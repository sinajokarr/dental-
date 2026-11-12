import "./service-art.css";
import { ImplantArt } from "./ImplantArt";
import { PlayOnView } from "./PlayOnView";
import { SmileArt } from "./SmileArt";
import { VeneersArt } from "./VeneersArt";

const ART = { implants: ImplantArt, veneers: VeneersArt, smileDesign: SmileArt } as const;

/** The animated illustration of one home-page service (D-077). The treatment pages keep their own TreatmentDrawing. */
export function ServiceArt({ name }: { name: keyof typeof ART }) {
  const Art = ART[name];
  return (
    <PlayOnView>
      <Art />
    </PlayOnView>
  );
}
