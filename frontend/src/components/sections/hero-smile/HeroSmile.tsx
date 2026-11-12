import "./hero-smile.css";
import { ABOVE_CURVE, CURVE, CURVE_PATH, VIEWBOX, teeth } from "./geometry";

// The hero's visual (D-076): a gentian medallion on which a light draws one smile line and pearl teeth rise from it.
// Decorative only — an emblem, never a face, a patient or a result (CLAUDE.md content rules). Server-rendered SVG:
// no JavaScript, no image request; the markup IS the finished state, so no-JS and reduced motion get it as is.
export function HeroSmile() {
  const set = teeth();
  return (
    <div aria-hidden="true" data-hero-smile="" className="hero-smile absolute inset-0">
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} preserveAspectRatio="xMidYMid meet" className="size-full">
        <defs>
          <radialGradient id="hs-disc" cx="50%" cy="38%" r="75%">
            <stop offset="0" stopColor="#3b4d65" />
            <stop offset="0.65" stopColor="#2f3e51" />
            <stop offset="1" stopColor="#263242" />
          </radialGradient>
          <radialGradient id="hs-stage" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#cbbaa8" stopOpacity="0.26" />
            <stop offset="1" stopColor="#cbbaa8" stopOpacity="0" />
          </radialGradient>
          <pattern id="hs-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.3" fill="#cbbaa8" />
          </pattern>
          <radialGradient id="hs-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.85" stopColor="#fff" stopOpacity="0.9" />
          </radialGradient>
          <mask id="hs-dots-mask">
            <rect width={VIEWBOX} height={VIEWBOX} fill="url(#hs-fade)" />
          </mask>
          <radialGradient id="hs-ground" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#263242" stopOpacity="0.28" />
            <stop offset="1" stopColor="#263242" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hs-line" gradientUnits="userSpaceOnUse" x1={CURVE.x0} y1="0" x2={CURVE.x1} y2="0">
            <stop offset="0" stopColor="#cbbaa8" />
            <stop offset="0.5" stopColor="#fff8ec" />
            <stop offset="1" stopColor="#cbbaa8" />
          </linearGradient>
          <linearGradient id="hs-pearl" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#e3e5e8" />
            <stop offset="0.07" stopColor="#eeeae5" />
            <stop offset="0.22" stopColor="#f6f2ed" />
            <stop offset="0.62" stopColor="#f9f6f2" />
            <stop offset="1" stopColor="#d9cec2" />
          </linearGradient>
          <radialGradient id="hs-gloss" cx="0.34" cy="0.4" r="0.55">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hs-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="hs-teeth">
            {set.map((tooth, i) => (
              <path key={i} d={tooth.path} transform={tooth.transform} />
            ))}
          </clipPath>
          <clipPath id="hs-above">
            <path d={ABOVE_CURVE} />
          </clipPath>
        </defs>

        <ellipse cx="300" cy="566" rx="190" ry="20" fill="url(#hs-ground)" />
        <g data-hs="disc">
          <circle cx="300" cy="300" r="282" fill="url(#hs-disc)" />
          <circle cx="300" cy="300" r="282" fill="none" stroke="#cbbaa8" strokeOpacity="0.55" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="293" fill="none" stroke="#cbbaa8" strokeOpacity="0.22" strokeWidth="1" />
          <circle cx="300" cy="316" r="250" fill="url(#hs-stage)" />
          <circle cx="300" cy="300" r="282" fill="url(#hs-dots)" fillOpacity="0.2" mask="url(#hs-dots-mask)" />
        </g>

        <g clipPath="url(#hs-above)">
          {set.map((tooth, i) => (
            <g key={i} transform={tooth.transform}>
              <g data-hs="tooth" data-hs-outer={tooth.index >= 3 ? "" : undefined} style={{ "--i": tooth.index } as React.CSSProperties}>
                <path d={tooth.path} fill="url(#hs-pearl)" stroke="#263242" strokeOpacity="0.3" strokeWidth="1.2" />
                <path d={tooth.path} fill="url(#hs-gloss)" />
              </g>
            </g>
          ))}
        </g>

        <g clipPath="url(#hs-above)">
          <g clipPath="url(#hs-teeth)">
            <polygon data-hs="sweep" points="10,150 150,150 100,520 -40,520" fill="url(#hs-sheen)" />
            <polygon data-hs="hover-sweep" points="10,150 150,150 100,520 -40,520" fill="url(#hs-sheen)" />
          </g>
        </g>

        <g data-hs="glow">
          <path d={CURVE_PATH} pathLength="1" fill="none" stroke="url(#hs-line)" strokeOpacity="0.3" strokeWidth="10" strokeLinecap="round" />
        </g>
        <g data-hs="dot">
          <path d={CURVE_PATH} pathLength="1" fill="none" stroke="#fff3df" strokeOpacity="0.12" strokeWidth="44" strokeLinecap="round" />
          <path d={CURVE_PATH} pathLength="1" fill="none" stroke="#fff3df" strokeOpacity="0.3" strokeWidth="24" strokeLinecap="round" />
          <path d={CURVE_PATH} pathLength="1" fill="none" stroke="#fffaf0" strokeWidth="10" strokeLinecap="round" />
        </g>
        <path data-hs="line" d={CURVE_PATH} pathLength="1" fill="none" stroke="url(#hs-line)" strokeWidth="3.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
