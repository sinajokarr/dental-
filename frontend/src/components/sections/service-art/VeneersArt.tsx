// "Porcelain Perfection" (D-077): the natural tooth is drawn, a very thin porcelain shell approaches its front
// surface and seats on it, then a soft pearl reflection passes. The shell is a thin layer on a prepared tooth —
// the picture never suggests the treatment needs no process. The markup is the finished (seated) state.

const TOOTH = "M138 108L182 108C190 150 186 212 166 256C162 262 158 262 156 254C152 220 146 174 140 152C134 136 134 120 138 108Z";
const SHELL = "M198 110L207 110C215 152 211 214 191 262L183 257C202 212 206 152 198 110Z";

export function VeneersArt() {
  return (
    <svg viewBox="18 18 284 284" aria-hidden="true" className="sv sv-veneers size-full fill-none stroke-[1.4] [stroke-linecap:round] [stroke-linejoin:round]">
      <defs>
        <clipPath id="sv-v-shell">
          <path d={SHELL} transform="translate(-14 0)" />
        </clipPath>
        <linearGradient id="sv-v-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Root inside the gum (construction) and the gum line */}
      <path className="sv-v-guide stroke-sky-400" d="M138 108C136 70 144 36 152 26C160 36 170 70 182 108" strokeDasharray="3 6" />
      <path className="sv-v-gum stroke-sky-400" pathLength={1} d="M92 112C110 100 126 114 138 108M182 108C198 102 216 116 238 104" />

      {/* The natural tooth in profile: fill appears after its outline is drawn */}
      <path className="sv-v-fill fill-white stroke-none" d={TOOTH} />
      <path className="sv-v-outline stroke-blue-700" pathLength={1} d={TOOTH} />
      <path className="sv-v-line stroke-blue-700" pathLength={1} d="M150 124C152 160 156 200 160 238" />

      {/* Approach path of the shell (fades out) */}
      <path className="sv-v-approach stroke-sky-400" d="M262 184H230" strokeDasharray="3 6" />
      <g className="sv-v-arrow stroke-sky-400">
        <path d="M238 176L228 184L238 192" />
      </g>

      {/* The porcelain shell, seated on the front surface */}
      <g transform="translate(-14 0)">
        <g className="sv-v-shell">
          <path d={SHELL} className="fill-sky-100 stroke-blue-700" />
          <path className="sv-v-edge stroke-sky-400" pathLength={1} d="M207 110C215 152 211 214 191 262" strokeWidth="2" />
          <g clipPath="url(#sv-v-shell)" stroke="none">
            <polygon className="sv-v-sheen" points="170,100 232,100 232,150 170,150" fill="url(#sv-v-sheen)" />
          </g>
        </g>
      </g>

    </svg>
  );
}
