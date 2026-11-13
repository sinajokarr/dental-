import Image, { type StaticImageData } from "next/image";

/** One transparent studio-render layer of a treatment (D-081). Decorative: the chapter's heading carries the meaning. */
export function RenderLayer({ src, className }: { src: StaticImageData; className: string }) {
  return (
    <div className={`sr-layer ${className}`}>
      <Image src={src} alt="" fill sizes="(min-width: 64rem) 448px, 384px" quality={75} className="object-contain" />
    </div>
  );
}
