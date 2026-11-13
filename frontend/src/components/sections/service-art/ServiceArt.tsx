import "./service-art.css";
import { ImplantRender } from "./ImplantRender";
import { PlayOnView } from "./PlayOnView";
import { SmileRender } from "./SmileRender";
import { VeneersRender } from "./VeneersRender";

const ART = { implants: ImplantRender, veneers: VeneersRender, smileDesign: SmileRender } as const;

/** The studio-render illustration of one home-page service (D-081). The treatment pages keep their own TreatmentDrawing. */
export function ServiceArt({ name }: { name: keyof typeof ART }) {
  const Art = ART[name];
  return (
    <PlayOnView>
      <Art />
    </PlayOnView>
  );
}
