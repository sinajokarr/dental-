import type { CSSProperties, ReactNode } from "react";

// Blueprint line drawings for the treatment chapters (D-063). Lines with pathLength="1" draw themselves with
// the scroll (globals.css, "Treatment drawings"); data-guide lines are construction marks that fade in.
// Brand renders can replace them later; they illustrate the treatment, never a result.

type Line = { d: string; accent?: boolean; guide?: boolean };

/** Upper front tooth seen from the front: gingival arc on top, tapered sides, rounded or pointed incisal edge. */
function frontTooth(cx: number, w: number, top: number, bottom: number, pointed = false): string {
  const x0 = cx - w / 2, x1 = cx + w / 2, t0 = cx - w * 0.41, t1 = cx + w * 0.41, r = w * 0.22;
  const edge = pointed ? `L${cx} ${bottom + 5} L${x0 + r} ${bottom}` : `Q${x1} ${bottom} ${x1 - r} ${bottom} L${x0 + r} ${bottom}`;
  return `M${t0} ${top} Q${cx} ${top - 7} ${t1} ${top} L${x1} ${bottom - r} ${edge} Q${x0} ${bottom} ${x0} ${bottom - r} Z`;
}

const smileTeeth: [number, number, number, number, boolean?][] = [
  [93.5, 17, 122, 190, true],
  [114, 24, 124, 186],
  [143, 34, 118, 196],
  [177, 34, 118, 196],
  [206, 24, 124, 186],
  [226.5, 17, 122, 190, true],
];

const pin = (x: number, y: number) => [
  { d: `M${x} ${y}c-7-9-12-15-12-21a12 12 0 1 1 24 0c0 6-5 12-12 21Z` },
  { d: `M${x - 4} ${y - 21}a4 4 0 1 0 8 0a4 4 0 1 0-8 0` },
];

const drawings: Record<"implants" | "veneers" | "smileDesign" | "travel", Line[]> = {
  implants: [
    { d: "M160 16V306", guide: true },
    // Crown, with its occlusal ridge and seating margin
    { d: "M108 110C102 88 103 66 111 54C117 45 128 42 136 49C143 41 153 39 160 46C167 39 178 41 185 48C193 42 204 45 209 54C217 66 218 88 212 110C190 118 130 118 108 110Z" },
    { d: "M128 58C138 66 150 66 160 60C170 66 182 66 192 58" },
    { d: "M115 103C137 109 183 109 205 103" },
    { d: "M152 125L160 132L168 125", accent: true },
    // Abutment: cone and collar
    { d: "M146 140H174L178 166H142Z" },
    { d: "M138 166H182L177 180H143Z" },
    { d: "M152 187L160 194L168 187", accent: true },
    // Titanium fixture with its threads
    { d: "M143 202H177L173 284C171 298 149 298 147 284Z" },
    ...Array.from({ length: 8 }, (_, i) => ({ d: `M${144 + i * 0.45} ${216 + i * 9}L${176 - i * 0.45} ${210 + i * 9}` })),
    { d: "M44 200C76 194 108 206 136 200M184 200C212 206 244 194 276 200", accent: true },
  ],
  veneers: [
    // Root inside the gum (construction), gum line, the tooth in profile, the veneer shell placed on its front
    { d: "M138 108C136 70 144 36 152 26C160 36 170 70 182 108", guide: true },
    { d: "M92 112C110 100 126 114 138 108M182 108C198 102 216 116 238 104", accent: true },
    { d: "M138 108L182 108C190 150 186 212 166 256C162 262 158 262 156 254C152 220 146 174 140 152C134 136 134 120 138 108Z" },
    { d: "M150 124C152 160 156 200 160 238" },
    { d: "M198 110L207 110C215 152 211 214 191 262L183 257C202 212 206 152 198 110Z" },
    { d: "M232 176L222 184L232 192", accent: true },
    { d: "M262 184H226", guide: true },
  ],
  smileDesign: [
    { d: "M36 132H284", guide: true },
    { d: "M160 64V270", guide: true },
    // Proportion measure across the six front teeth
    { d: "M85 104H235", accent: true },
    ...[85, 102, 126, 160, 194, 218, 235].map((x) => ({ d: `M${x} 99V109`, accent: true })),
    ...smileTeeth.map(([cx, w, top, bottom, pointed]) => ({ d: frontTooth(cx, w, top, bottom, pointed) })),
    { d: "M62 176C110 236 210 236 258 176", accent: true },
  ],
  travel: [
    // A globe, the visitor's starting point and two routes to Istanbul (north) and Antalya (south).
    { d: "M60 160a100 100 0 1 0 200 0a100 100 0 1 0-200 0" },
    { d: "M160 60c-42 30-42 170 0 200M160 60c42 30 42 170 0 200M66 124h188M66 196h188", guide: true },
    { d: "M80 212a4 4 0 1 0 8 0a4 4 0 1 0-8 0", accent: true },
    { d: "M86 208C106 150 156 118 206 128", accent: true },
    { d: "M88 214C124 196 172 182 222 186", accent: true },
    ...pin(206, 128),
    ...pin(222, 186),
  ],
};

export function TreatmentDrawing({ name }: { name: keyof typeof drawings }) {
  const lines: ReactNode[] = drawings[name].map((line, i) =>
    line.guide ? (
      <path key={i} d={line.d} data-guide="" className="stroke-sky-400" strokeDasharray="3 6" />
    ) : (
      <path
        key={i}
        d={line.d}
        pathLength={1}
        style={{ "--d": i } as CSSProperties}
        className={line.accent ? "stroke-sky-400" : "stroke-blue-700"}
      />
    ),
  );
  return (
    <svg viewBox="18 18 284 284" aria-hidden="true" className="size-full fill-none stroke-[1.4] [stroke-linecap:round] [stroke-linejoin:round]">
      {lines}
    </svg>
  );
}
