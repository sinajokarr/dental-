// "The Signature Smile" (D-077): a light travels the smile line and draws it, six front teeth take their contours in,
// planning guides (midline, incisal line, proportion ticks) settle, the teeth fill pearl-white and a soft sheen passes.
// Line art in the blueprint style, deliberately different from the hero's filled emblem. Markup = finished state.

function frontTooth(cx: number, w: number, top: number, bottom: number, pointed = false): string {
  const x0 = cx - w / 2, x1 = cx + w / 2, t0 = cx - w * 0.41, t1 = cx + w * 0.41, r = w * 0.22;
  const edge = pointed ? `L${cx} ${bottom + 5} L${x0 + r} ${bottom}` : `Q${x1} ${bottom} ${x1 - r} ${bottom} L${x0 + r} ${bottom}`;
  return `M${t0} ${top} Q${cx} ${top - 7} ${t1} ${top} L${x1} ${bottom - r} ${edge} Q${x0} ${bottom} ${x0} ${bottom - r} Z`;
}

// cx, width, top, bottom, pointed, distance from the midline (0 = central), initial lean in degrees
const TEETH: [number, number, number, number, boolean, number, number][] = [
  [93.5, 17, 122, 190, true, 2, -3],
  [114, 24, 124, 186, false, 1, -2],
  [143, 34, 118, 196, false, 0, 0],
  [177, 34, 118, 196, false, 0, 0],
  [206, 24, 124, 186, false, 1, 2],
  [226.5, 17, 122, 190, true, 2, 3],
];
const CURVE = "M62 176C110 236 210 236 258 176";

export function SmileArt() {
  const shapes = TEETH.map(([cx, w, top, bottom, pointed]) => frontTooth(cx, w, top, bottom, pointed));
  return (
    <svg viewBox="18 18 284 284" aria-hidden="true" className="sv sv-smile size-full fill-none stroke-[1.4] [stroke-linecap:round] [stroke-linejoin:round]">
      <defs>
        <clipPath id="sv-s-teeth">
          {shapes.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <linearGradient id="sv-s-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Planning guides: incisal line, midline and a proportion measure across the six teeth */}
      <g className="sv-s-guides stroke-sky-400" data-sv-extra="">
        <path d="M36 132H284" strokeDasharray="3 6" />
        <path d="M160 64V270" strokeDasharray="3 6" />
        <path d="M85 104H235" />
        {[85, 102, 126, 160, 194, 218, 235].map((x) => (
          <path key={x} d={`M${x} 99V109`} />
        ))}
      </g>

      {/* The signature smile line, and the point of light that draws it */}
      <path className="sv-s-curve stroke-sky-400" pathLength={1} d={CURVE} strokeWidth="2.2" />
      <g className="sv-s-dot">
        <path d={CURVE} pathLength={1} className="stroke-sky-400" strokeOpacity="0.25" strokeWidth="18" />
        <path d={CURVE} pathLength={1} className="stroke-sky-400" strokeOpacity="0.6" strokeWidth="9" />
        <path d={CURVE} pathLength={1} className="stroke-blue-700" strokeWidth="4" />
      </g>

      {TEETH.map(([, , , bottom, , order, lean], i) => (
        <g key={i} className="sv-s-tooth" style={{ "--i": order, "--lean": `${lean}deg`, transformOrigin: `${TEETH[i][0]}px ${bottom}px` } as React.CSSProperties}>
          <path className="sv-s-fill fill-ice-100 stroke-none" d={shapes[i]} />
          <path className="sv-s-outline stroke-blue-700" pathLength={1} d={shapes[i]} />
        </g>
      ))}

      <g clipPath="url(#sv-s-teeth)" stroke="none">
        <polygon className="sv-s-sheen" points="60,110 100,110 84,210 44,210" fill="url(#sv-s-sheen)" />
        <polygon className="sv-s-hover" points="60,110 100,110 84,210 44,210" fill="url(#sv-s-sheen)" />
      </g>
    </svg>
  );
}
