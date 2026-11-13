import arch from "../../../assets/treatments/smile/arch.png";
import meta from "../../../assets/treatments/smile/meta.json";
import { RenderLayer } from "./RenderLayer";

// "Smile harmony" (D-081): a natural upper dental arch (eight teeth, never mirror-identical), planning guides drawn from the
// exact projected points of the render — midline, smile arc along the incisal edges, proportion bracket, gingival zeniths —
// which then fade and leave the natural arch. A fine pointer over the chapter calls the guides back.
type Point = [number, number];
const teeth = meta.teeth as unknown as { incisal: Point; edgeLeft: Point; edgeRight: Point; zenith: Point }[];

/** Smooth curve through points (Catmull-Rom → cubic Bézier). */
function smooth(points: Point[]): string {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] ?? p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

export function SmileRender() {
  const centrals = teeth.slice(3, 5);
  const midX = (centrals[0].incisal[0] + centrals[1].incisal[0]) / 2;
  const baseline = Math.max(...teeth.map((t) => t.incisal[1])) + 70;
  const arc = smooth(teeth.map((t) => t.incisal));
  return (
    <div className="sr sr-smile">
      <div className="sr-shadow" />
      <RenderLayer src={arch} className="sr-s-arch" />
      <svg viewBox="0 0 1000 1000" aria-hidden="true" className="sr-guides sr-s-guides">
        <path d={`M${midX} ${Math.min(...teeth.map((t) => t.zenith[1])) - 110}V${baseline + 30}`} className="sr-dotted" />
        <path d={arc} pathLength={1} className="sr-s-arc" />
        <g data-sr-extra="">
          <path d={`M${teeth[0].edgeLeft[0]} ${baseline}H${teeth[7].edgeRight[0]}`} />
          {teeth.flatMap((t, i) => (i === 0 ? [t.edgeLeft[0], t.edgeRight[0]] : [t.edgeRight[0]])).map((x) => (
            <path key={x} d={`M${x} ${baseline - 14}V${baseline + 14}`} />
          ))}
        </g>
        {teeth.map((t, i) => (
          <circle key={i} cx={t.zenith[0]} cy={t.zenith[1]} r="5" className="sr-dot" />
        ))}
      </svg>
    </div>
  );
}
