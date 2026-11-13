import gum from "../../../assets/treatments/veneers/gum.png";
import meta from "../../../assets/treatments/veneers/meta.json";
import shell from "../../../assets/treatments/veneers/shell.png";
import tooth from "../../../assets/treatments/veneers/tooth.png";
import { RenderLayer } from "./RenderLayer";

// "Porcelain elegance" (D-081): a natural tooth in its gingival collar, a very thin porcelain shell approaches the front
// surface and seats on it. The shell is a thin layer on a prepared tooth, never a replacement for the treatment process.
export function VeneersRender() {
  const [x, y] = meta.shellCentre;
  return (
    <div className="sr sr-veneers">
      <svg viewBox="0 0 1000 1000" aria-hidden="true" className="sr-guides sr-v-guides">
        <path d={`M${x + 250} ${y + 20}H${x + 90}`} />
        <path d={`M${x + 112} ${y + 2}L${x + 90} ${y + 20}L${x + 112} ${y + 38}`} />
      </svg>
      <div className="sr-shadow" />
      <RenderLayer src={tooth} className="sr-v-tooth" />
      <RenderLayer src={gum} className="sr-v-gum" />
      <RenderLayer src={shell} className="sr-v-shell" />
    </div>
  );
}
