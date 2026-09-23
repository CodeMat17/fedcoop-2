type LoaderArgs = { src: string; width: number; quality?: number };

const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Accepts either a Cloudinary public ID ("fedcoop/agm-2025/01") or a full
 * res.cloudinary.com delivery URL, and returns a transformed URL.
 */
export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  const q = quality ? `q_${quality}` : "q_auto:good";
  const params = `f_auto,${q},dpr_auto,c_limit,w_${width}`;

  if (src.includes("res.cloudinary.com")) {
    return src.replace("/upload/", `/upload/${params}/`);
  }
  if (src.startsWith("http") || src.startsWith("/")) return src;
  if (!cloud) return src;
  return `https://res.cloudinary.com/${cloud}/image/upload/${params}/${src}`;
}

/**
 * Pre-crops an image to `aspect` on Cloudinary, keeping faces (or, failing
 * that, the most salient area) in frame — CSS object-cover only crops around
 * the centre, which cuts heads off portrait photos. The loader chains its
 * resize in front of this segment.
 */
export function faceCrop(src: string, aspect: "16:9" | "21:9"): string {
  const crop = `c_fill,g_auto:faces,ar_${aspect}`;
  if (src.includes("res.cloudinary.com")) return src.replace("/upload/", `/upload/${crop}/`);
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `${crop}/${src}`;
}
