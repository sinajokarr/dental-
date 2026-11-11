import type { ReactNode } from "react";

type Tone = "light" | "ice" | "navy";

const tones: Record<Tone, string> = {
  light: "bg-white text-navy-900",
  ice: "bg-ice-50 text-navy-900",
  navy: "bg-navy-900 text-white",
};

// Page section with the shared rhythm (py-section) and container (max 1280px, 24/48px gutters).
export function Section({
  id,
  tone = "light",
  labelledBy,
  className = "",
  children,
}: {
  id?: string;
  tone?: Tone;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`relative py-section ${tones[tone]} ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">{children}</div>
    </section>
  );
}

// Eyebrow + H2 + lead. The title reveals word by word (AN-11); Persian stays whole words (D-024).
export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  center = false,
  dark = false,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <header className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`eyebrow mb-4 ${dark ? "text-sky-400" : "text-blue-700"}`}>{eyebrow}</p>}
      <h2 id={id} data-reveal="words" className="font-display text-h2 font-light text-balance">
        {title.split(" ").map((word, i) => (
          <span key={i} className="reveal-word">
            <span style={{ "--i": i } as React.CSSProperties}>{word}</span>{" "}
          </span>
        ))}
      </h2>
      {lead && (
        <p data-reveal className={`mt-5 text-lead ${dark ? "text-dark-muted" : "text-slate-600"}`}>
          {lead}
        </p>
      )}
    </header>
  );
}
