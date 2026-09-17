import { geoContains, geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import topology from "@/data/nigeria-states.json";

export type StateShape = { code: string; name: string; d: string; cx: number; cy: number };
type Props = { code: string; name: string };

const MAP_W = 800;
const MAP_H = 640;

/** Projects the committed TopoJSON to SVG path strings. Pure; safe on server or client. */
export function projectStates(width = MAP_W, height = MAP_H): StateShape[] {
  const topo = topology as unknown as Topology<{ states: GeometryCollection<Props> }>;
  const key = Object.keys(topo.objects)[0] as "states";
  const fc = feature(topo, topo.objects[key]);
  const features = fc.features as Feature<Geometry, Props>[];
  const projection = geoMercator().fitSize([width, height], fc);
  const path = geoPath(projection);
  return features.map((f) => {
    const [cx, cy] = path.centroid(f);
    return { code: f.properties.code, name: f.properties.name, d: path(f) ?? "", cx, cy };
  });
}

const HUB_CODE = "NG-FC";

type NetworkNode = { code: string; name: string; x: number; y: number; order: number; line: string };
type NetworkMarker = { x: number; y: number; state: string };
export type NetworkGeometry = {
  width: number;
  height: number;
  outline: string;
  borders: string;
  hub: { x: number; y: number };
  nodes: NetworkNode[];
  markers: NetworkMarker[];
};

/** Seeded PRNG so server and client render identical markers. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/**
 * Geometry for the hero network: national outline, internal borders, a node per
 * state linked to Abuja, and cooperative markers sampled inside each state.
 * `counts` scales marker density per state; markers are a sample, not a census.
 */
export function projectNetwork(width: number, height: number, counts: Record<string, number> = {}): NetworkGeometry {
  const topo = topology as unknown as Topology<{ states: GeometryCollection<Props> }>;
  const key = Object.keys(topo.objects)[0] as "states";
  const obj = topo.objects[key];
  const fc = feature(topo, obj);
  const features = fc.features as Feature<Geometry, Props>[];
  const pad = 12;
  const projection = geoMercator().fitExtent(
    [
      [pad, pad],
      [width - pad, height - pad],
    ],
    fc,
  );
  const path = geoPath(projection);
  const r = (n: number) => Math.round(n * 10) / 10;

  const hubF = features.find((f) => f.properties.code === HUB_CODE) ?? features[0];
  const [hx, hy] = path.centroid(hubF).map(r);
  const max = Math.max(1, ...Object.values(counts));

  const withDist = features
    .filter((f) => f !== hubF)
    .map((f) => {
      const [x, y] = path.centroid(f).map(r);
      return { f, x, y, dist: Math.hypot(x - hx, y - hy) };
    })
    .sort((a, b) => a.dist - b.dist);

  const nodes: NetworkNode[] = withDist.map(({ f, x, y }, order) => {
    // bow each link slightly, alternating sides, so the web reads as organic
    const mx = (hx + x) / 2;
    const my = (hy + y) / 2;
    const len = Math.hypot(x - hx, y - hy) || 1;
    const bow = (order % 2 ? 1 : -1) * len * 0.12;
    const cx = r(mx + (-(y - hy) / len) * bow);
    const cy = r(my + ((x - hx) / len) * bow);
    return { code: f.properties.code, name: f.properties.name, x, y, order, line: `M${hx} ${hy}Q${cx} ${cy} ${x} ${y}` };
  });

  const markers: NetworkMarker[] = [];
  features.forEach((f, i) => {
    const count = counts[f.properties.code] ?? 0;
    const n = count ? 2 + Math.round((count / max) * 6) : 2;
    const [[x0, y0], [x1, y1]] = path.bounds(f);
    const rand = rng(i * 7919 + 17);
    for (let tries = 0, placed = 0; placed < n && tries < 60; tries++) {
      const x = x0 + rand() * (x1 - x0);
      const y = y0 + rand() * (y1 - y0);
      const ll = projection.invert?.([x, y]);
      if (ll && geoContains(f, ll)) {
        markers.push({ x: r(x), y: r(y), state: f.properties.code });
        placed++;
      }
    }
  });

  return {
    width,
    height,
    outline: path(mesh(topo, obj, (a, b) => a === b)) ?? "",
    borders: path(mesh(topo, obj, (a, b) => a !== b)) ?? "",
    hub: { x: hx, y: hy },
    nodes,
    markers,
  };
}
