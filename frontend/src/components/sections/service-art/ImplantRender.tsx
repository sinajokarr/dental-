import abutment from "../../../assets/treatments/implant/abutment.png";
import crown from "../../../assets/treatments/implant/crown.png";
import fixture from "../../../assets/treatments/implant/fixture.png";
import gum from "../../../assets/treatments/implant/gum.png";
import meta from "../../../assets/treatments/implant/meta.json";
import { RenderLayer } from "./RenderLayer";

// "Precision implant" (D-081): four studio renders — titanium fixture, anodised abutment, gingival cuff, porcelain crown —
// seat on one axis. The markup is the assembled implant (no-JS, reduced motion); service-art.css plays the assembly once.
// A simplified teaching picture, not a surgical simulation. Guides use the exact projected positions of the render.
export function ImplantRender() {
  return (
    <div className="sr sr-implant">
      <svg viewBox="0 0 1000 1000" aria-hidden="true" className="sr-guides sr-i-guides">
        <path d={`M${meta.axis} ${meta.crownTop - 70}V${meta.fixtureBottom + 50}`} />
        {[meta.crownTop, meta.crownMargin, meta.platform, meta.fixtureBottom].map((y) => (
          <path key={y} d={`M${meta.width[0] - 80} ${y}H${meta.width[0] - 40}`} data-sr-extra="" />
        ))}
        <path d={`M${meta.width[0] - 60} ${meta.crownTop}V${meta.fixtureBottom}`} data-sr-extra="" />
      </svg>
      <div className="sr-shadow" />
      <RenderLayer src={fixture} className="sr-i-fixture" />
      <RenderLayer src={abutment} className="sr-i-abutment" />
      <RenderLayer src={gum} className="sr-i-gum" />
      <RenderLayer src={crown} className="sr-i-crown" />
    </div>
  );
}
