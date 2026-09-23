import { getImageProps } from "next/image";
import { faceCrop } from "@/lib/cloudinary-loader";

/**
 * Full-width article cover: 16:9 on small screens, 21:9 from lg. Each frame
 * gets its own face-aware Cloudinary crop so heads stay in view at both ratios.
 */
export function CoverHero({ src, alt }: { src: string; alt: string }) {
  const common = { alt, sizes: "100vw", priority: true };
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: faceCrop(src, "21:9"), width: 2100, height: 900 });
  const {
    props: { srcSet: narrow, ...rest },
  } = getImageProps({ ...common, src: faceCrop(src, "16:9"), width: 1600, height: 900 });

  return (
    <div className="shell mb-14">
      <div className="relative aspect-video overflow-hidden rounded-card border border-cord-line bg-cord-soft lg:aspect-[21/9]">
        <picture>
          <source media="(min-width: 1024px)" srcSet={wide} sizes="100vw" />
          <img {...rest} srcSet={narrow} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
        </picture>
      </div>
    </div>
  );
}
