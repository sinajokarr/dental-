import Image, { type StaticImageData } from "next/image";

/** A licensed photograph (D-087) in the site's arch window, revealed once like a curtain as it scrolls into view
 *  (data-reveal="clip", RevealObserver). Decorative: the people shown are models, never patients, dentists or results
 *  of JOKAR DENTAL (docs/ASSET_LICENSES.md), so the image carries no alt text that could suggest otherwise. */
export function Photo({ src, sizes, className = "", position = "center", arch = true }: { src: StaticImageData; sizes: string; className?: string; position?: string; arch?: boolean }) {
  return (
    <div data-photo="" data-reveal="clip" className={`relative overflow-hidden shadow-e3 ${arch ? "rounded-t-[999px] rounded-b-[28px] max-lg:rounded-t-[28px]" : "rounded-[28px]"} ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} quality={75} placeholder="blur" className="object-cover" style={{ objectPosition: position }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-sky-400)_55%,transparent)]" />
    </div>
  );
}
