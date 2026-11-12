import Image from "next/image";
import square from "../../../../public/images/hero/smile-square.jpg";
import "./hero-photo.css";

// The hero's visual (D-078): an editorial macro photograph of a natural smile — real skin, real enamel, no face.
// Licensed stock, decorative only: it is never presented as the clinic, a patient or a treatment result
// (docs/ASSET_LICENSES.md). One square source: the two-column desktop hero shows all of it, the phone slot (a wide
// band) shows its middle through object-fit — one file, one request. The finished picture is the markup itself.
export function HeroPhoto() {
  return (
    <div aria-hidden="true" data-hero-photo="" className="hero-photo absolute inset-0">
      <Image src={square} alt="" fill sizes="(min-width: 64rem) 45vw, 100vw" quality={60} placeholder="blur" loading="eager" fetchPriority="high" className="size-full" />
    </div>
  );
}
