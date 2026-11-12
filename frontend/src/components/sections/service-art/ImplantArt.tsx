// "Precision Implant Assembly" (D-077): fixture, abutment and crown seat on one axis, then a pearl glint crosses the
// crown. Educational line art in the site's blueprint style — a simplified assembly, never a surgical simulation.
// The markup is the finished (assembled) state; service-art.css animates it from the exploded state.

const CROWN =
  "M108 110C102 88 103 66 111 54C117 45 128 42 136 49C143 41 153 39 160 46C167 39 178 41 185 48C193 42 204 45 209 54C217 66 218 88 212 110C190 118 130 118 108 110Z";
const THREADS = Array.from({ length: 8 }, (_, i) => `M${144 + i * 0.45} ${216 + i * 9}L${176 - i * 0.45} ${210 + i * 9}`);

export function ImplantArt() {
  return (
    <svg viewBox="18 18 284 284" aria-hidden="true" className="sv sv-implant size-full fill-none stroke-[1.4] [stroke-linecap:round] [stroke-linejoin:round]">
      <defs>
        <clipPath id="sv-i-crown">
          <path d={CROWN} />
        </clipPath>
        <linearGradient id="sv-i-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Construction: the implant axis and a measuring line with a tick at every joint */}
      <g className="sv-i-guides">
        <path d="M160 22V294" className="stroke-sky-400" strokeDasharray="3 6" />
        <path d="M84 60V264" className="stroke-sky-400" strokeDasharray="3 6" />
        <g className="stroke-sky-400">
          {[60, 130, 170, 264].map((y) => (
            <path key={y} d={`M78 ${y}H92`} />
          ))}
        </g>
      </g>

      {/* Gum line at the collar */}
      <path className="sv-i-gum stroke-sky-400" pathLength={1} d="M44 170C76 164 108 176 138 170M182 170C212 176 244 164 276 170" />

      <g transform="translate(0 -32)">
        <g className="sv-i-fixture stroke-blue-700">
          <path d="M143 202H177L173 284C171 298 149 298 147 284Z" className="fill-sky-100" />
          {THREADS.map((d) => (
            <path key={d} d={d} />
          ))}
          <path d="M150 210L152 280" className="stroke-white" strokeWidth="1.8" />
        </g>
      </g>

      <g className="sv-i-chev sv-i-chev-a stroke-sky-400">
        <path d="M152 167L160 174L168 167" />
      </g>
      <g transform="translate(0 -10)">
      <g className="sv-i-abut stroke-blue-700">
        <path d="M146 140H174L178 166H142Z" className="fill-ice-100" />
        <path d="M138 166H182L177 180H143Z" className="fill-ice-100" />
      </g>
      </g>

      <g className="sv-i-chev sv-i-chev-b stroke-sky-400">
        <path d="M152 124L160 131L168 124" />
      </g>
      <g transform="translate(0 21)">
        <g className="sv-i-crown stroke-blue-700">
          <path d={CROWN} className="fill-ice-50" />
          <path d="M128 58C138 66 150 66 160 60C170 66 182 66 192 58" />
          <path d="M115 103C137 109 183 109 205 103" />
          <g clipPath="url(#sv-i-crown)" stroke="none">
            <polygon className="sv-i-sheen" points="70,30 118,30 98,130 50,130" fill="url(#sv-i-sheen)" />
          </g>
        </g>
      </g>
    </svg>
  );
}
