import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image transformation happens on Cloudinary, never on Vercel (§18.5).
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
  },
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/about/leadership", destination: "/directors", permanent: true }];
  },
};

export default nextConfig;
