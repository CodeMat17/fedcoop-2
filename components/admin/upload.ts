"use client";

import { useAction } from "convex/react";
import { useCallback } from "react";
import { api } from "@/convex/_generated/api";

/*
 * Browser → Cloudinary uploads, signed per request by a Convex action that
 * checks the admin role. Nothing is stored in Convex file storage.
 */

export type Folder = "news" | "events" | "gallery" | "directors" | "resources" | "cooperatives";

export type Uploaded = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes: number;
  format?: string;
  resourceType: string;
  name: string;
  blurDataUrl?: string;
};

type CloudinaryResponse = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes: number;
  format?: string;
  resource_type: string;
  original_filename?: string;
  error?: { message: string };
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function post(url: string, body: FormData, onProgress?: (pct: number) => void) {
  return new Promise<CloudinaryResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      const res = xhr.response as CloudinaryResponse | null;
      if (xhr.status >= 200 && xhr.status < 300 && res) resolve(res);
      else reject(new Error(res?.error?.message ?? `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(body);
  });
}

/** A tiny blurred JPEG from Cloudinary, stored as the LQIP placeholder (§14.4). */
async function blurFor(cloudName: string, publicId: string) {
  try {
    const res = await fetch(`https://res.cloudinary.com/${cloudName}/image/upload/w_24,e_blur:600,q_40,f_jpg/${publicId}`);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export function useCloudinaryUpload(folder: Folder) {
  const sign = useAction(api.cloudinary.signUpload);
  return useCallback(
    async (
      file: File,
      opts: { kind?: "image" | "any"; blur?: boolean; onProgress?: (pct: number) => void } = {},
    ): Promise<Uploaded> => {
      const kind = opts.kind ?? "image";
      if (kind === "image") {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
        if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name} is larger than 10 MB.`);
      }
      const s = await sign({ folder });
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", s.apiKey);
      body.append("timestamp", String(s.timestamp));
      body.append("folder", s.folder);
      body.append("signature", s.signature);
      const endpoint = kind === "image" ? "image" : "auto";
      const r = await post(`https://api.cloudinary.com/v1_1/${s.cloudName}/${endpoint}/upload`, body, opts.onProgress);
      return {
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        format: r.format,
        resourceType: r.resource_type,
        name: file.name,
        blurDataUrl: opts.blur ? await blurFor(s.cloudName, r.public_id) : undefined,
      };
    },
    [sign, folder],
  );
}

/** Delivery URL for an admin thumbnail from either a public ID or a Cloudinary URL. */
export function thumb(src: string, width = 480) {
  const t = `f_auto,q_auto,c_limit,w_${width}`;
  if (src.includes("res.cloudinary.com")) return src.replace("/upload/", `/upload/${t}/`);
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${t}/${src}`;
}
