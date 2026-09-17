/*
 * Five colour bands from --cord-soft to --cord, top band in --brass (§13.1).
 * Only verified counts are banded; unknown is never treated as zero.
 */

export const BAND_FILLS = [
  "var(--cord-soft)",
  "color-mix(in oklab, var(--cord) 30%, var(--cord-soft))",
  "color-mix(in oklab, var(--cord) 60%, var(--cord-soft))",
  "var(--cord)",
  "var(--brass)",
] as const;

export type Band = { index: number; min: number; max: number };

export function makeBands(values: number[]): Band[] {
  if (values.length === 0) return [];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  if (lo === hi) return [{ index: 4, min: lo, max: hi }];
  const step = (hi - lo) / 5;
  return Array.from({ length: 5 }, (_, i) => ({
    index: i,
    min: Math.round(lo + step * i),
    max: i === 4 ? hi : Math.round(lo + step * (i + 1)) - (Number.isInteger(step) ? 1 : 0),
  }));
}

export function bandFor(value: number, bands: Band[]): number {
  if (bands.length === 1) return bands[0].index;
  for (let i = bands.length - 1; i >= 0; i--) if (value >= bands[i].min) return bands[i].index;
  return 0;
}

