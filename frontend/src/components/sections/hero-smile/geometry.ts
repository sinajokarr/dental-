// Geometry of the hero "Signature Smile" (D-076): one smile curve and the eight front teeth that rest on it.
// Pure numbers → strings, no DOM, so it renders on the server and is unit-tested (tests/unit/hero-smile.test.ts).
// Coordinates live in a 600 × 600 viewBox; the curve is a quadratic Bézier, so every tooth can be seated exactly on it.

export const VIEWBOX = 600;
export const CURVE = { x0: 60, y0: 306, cx: 300, cy: 420, x1: 540, y1: 306 } as const;
export const CURVE_PATH = `M${CURVE.x0} ${CURVE.y0}Q${CURVE.cx} ${CURVE.cy} ${CURVE.x1} ${CURVE.y1}`;
/** Everything above the curve: the teeth are seated on the line and rise from behind it. */
export const ABOVE_CURVE = `M0 0H${VIEWBOX}V${CURVE.y1}H${CURVE.x1}Q${CURVE.cx} ${CURVE.cy} ${CURVE.x0} ${CURVE.y0}H0Z`;

type Kind = "central" | "lateral" | "canine" | "premolar";
type Spec = { kind: Kind; width: number; height: number };
// From the midline outwards. Real proportions: central incisors widest and tallest, premolars smallest.
const SPECS: Spec[] = [
  { kind: "central", width: 70, height: 98 },
  { kind: "lateral", width: 56, height: 90 },
  { kind: "canine", width: 59, height: 95 },
  { kind: "premolar", width: 53, height: 84 },
];
const OVERLAP = 0.97; // neighbours touch, with a hair of overlap so no dark gap shows between them
const TILT = 0.45; // how much a tooth leans with the arch (1 = exactly perpendicular to the curve)

/** Point of the curve at parameter t, and its slope dy/dx. */
export function curveAt(t: number): { x: number; y: number; slope: number } {
  const { x0, y0, cy, x1 } = CURVE;
  return { x: x0 + (x1 - x0) * t, y: y0 + 2 * (cy - y0) * t * (1 - t), slope: ((2 * (cy - y0)) * (1 - 2 * t)) / (x1 - x0) };
}

const f = (n: number) => Number(n.toFixed(1));

/** One tooth crown in its own frame: origin = middle of the incisal edge, +y is down, the crown grows towards -y. */
export function toothPath(kind: Kind, w: number, h: number): string {
  const hw = w / 2;
  const edge = hw * 0.86; // incisal corners sit slightly inside the widest point
  const top = hw * (kind === "premolar" ? 0.82 : 0.78);
  const bulge = { central: 3, lateral: 4, canine: 8, premolar: 5 }[kind];
  const bottom =
    kind === "canine"
      ? `M${f(-edge)} 0Q${f(-w * 0.22)} ${f(bulge * 0.9)} 0 ${f(bulge * 2.3)}Q${f(w * 0.22)} ${f(bulge * 0.9)} ${f(edge)} 0`
      : `M${f(-edge)} 0Q0 ${f(bulge * 2)} ${f(edge)} 0`;
  return (
    bottom +
    `C${f(hw * 1.0)} ${f(-h * 0.28)} ${f(hw * 0.97)} ${f(-h * 0.74)} ${f(top)} ${f(-h * 0.95)}` +
    `C${f(top * 0.62)} ${f(-h * 1.08)} ${f(-top * 0.62)} ${f(-h * 1.08)} ${f(-top)} ${f(-h * 0.95)}` +
    `C${f(-hw * 0.97)} ${f(-h * 0.74)} ${f(-hw * 1.0)} ${f(-h * 0.28)} ${f(-edge)} 0Z`
  );
}

export type Tooth = { index: number; kind: Kind; path: string; transform: string; x: number; y: number; angle: number; width: number; height: number };

/** The eight teeth, listed outside-in so the central pair is drawn last (on top). `index` = distance from the midline (0–3). */
export function teeth(): Tooth[] {
  const mid = (CURVE.x0 + CURVE.x1) / 2;
  const out: Tooth[] = [];
  let reach = 0; // distance from the midline to the near edge of the next tooth
  SPECS.forEach((spec, index) => {
    const centre = reach + spec.width / 2;
    reach += spec.width * OVERLAP;
    for (const side of [-1, 1]) {
      const x = mid + side * centre;
      const { y, slope } = curveAt((x - CURVE.x0) / (CURVE.x1 - CURVE.x0));
      const angle = (Math.atan(slope) * 180) / Math.PI * TILT;
      out.push({
        index, kind: spec.kind, path: toothPath(spec.kind, spec.width, spec.height), width: spec.width, height: spec.height,
        x: f(x), y: f(y), angle: f(angle), transform: `translate(${f(x)} ${f(y)}) rotate(${f(angle)})`,
      });
    }
  });
  return out.reverse();
}
