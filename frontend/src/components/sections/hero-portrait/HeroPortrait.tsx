import Image from "next/image";
import portrait from "../../../../public/images/hero/portrait.webp";
import { PortraitParallax } from "./PortraitParallax";
import "./hero-portrait.css";

// The hero's visual (D-080): "The art of a natural smile" — a full-face, front-on portrait of a real person
// laughing naturally, cut out of its studio background and set in a warm arch window made from the palette.
// Licensed stock, decorative only: never presented as a patient, a doctor or a treatment result
// (docs/ASSET_LICENSES.md). The markup is the finished picture (no-JS, reduced motion); motion is CSS-only:
// the window opens, the camera pushes in with a focus pull, one breath, a light catches the smile — then rest.
// Depth: the subject and the backdrop sit on separate layers, so a fine pointer can shift them a few pixels apart.
export function HeroPortrait() {
  return (
    <div aria-hidden="true" data-hero-portrait="" className="hero-portrait absolute inset-0">
      <div className="hero-portrait-window">
        <div className="hero-portrait-backdrop" />
        <div className="hero-portrait-subject">
          <Image src={portrait} alt="" fill sizes="(min-width: 64rem) 36vw, 180px" quality={75} placeholder="blur" loading="eager" fetchPriority="high" className="object-cover object-bottom" />
        </div>
        <div className="hero-portrait-glint" />
      </div>
      <PortraitParallax />
    </div>
  );
}
