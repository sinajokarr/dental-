import Image, { type StaticImageData } from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { FilmOnView } from "../service-film/FilmOnView";
import "./expansion.css";

// Shared pieces of the V7 treatment expansion (D-091). Used only by ImplantsExpansion and SmileExpansion, so the rest
// of the site never changes when they do. Plain prefixed CSS (xp-), logical properties, no client JavaScript.

/** One transparent layer of a studio render; `stage` names the steps of a staged picture it belongs to (CSS plays them). */
export function Layer({ src, stage, className = "", sizes = "(min-width: 64rem) 36rem, 92vw" }: { src: StaticImageData; stage?: string; className?: string; sizes?: string }) {
  return (
    <div className={`xp-layer ${className}`} data-stage={stage}>
      <Image src={src} alt="" fill sizes={sizes} quality={78} className="object-contain" />
    </div>
  );
}

/** A short rendered teaching film (D-092), square, silent, played once when it scrolls into view (FilmOnView, D-086);
 *  the markup is its last frame, so no-JS, reduced motion and print see the finished picture. Decorative. */
// Phones get the smaller of the two encodings first (H.264 at 480 px, WebM at 720 px).
export function Film({ name, className = "" }: { name: string; className?: string }) {
  const base = `/images/treatments/${name}`;
  const video = `<video muted playsinline disableremoteplayback preload="none" tabindex="-1" width="720" height="720">
<source data-src="${base}-480.mp4" type="video/mp4" media="${MOTION} and (max-width: 767px)">
<source data-src="${base}-480.webm" type="video/webm" media="${MOTION} and (max-width: 767px)">
<source data-src="${base}-720.webm" type="video/webm" media="${MOTION}">
<source data-src="${base}-720.mp4" type="video/mp4" media="${MOTION}">
</video>`;
  return (
    <div aria-hidden="true" data-film={name} className={`xp-film ${className}`} style={{ backgroundImage: `url(${base}-last.webp)` }}>
      <div className="xp-film-video" dangerouslySetInnerHTML={{ __html: video }} />
      <FilmOnView />
    </div>
  );
}
const MOTION = "(prefers-reduced-motion: no-preference)";

/** The steps a film shows, named under it. */
export function Steps({ label, steps }: { label: string; steps: string[] }) {
  return (
    <ol aria-label={label} className="xp-steps-caption">
      {steps.map((step) => (
        <li key={step}>
          <span aria-hidden="true" className="xp-dot" />
          {step}
        </li>
      ))}
    </ol>
  );
}

/** A licensed photograph in a soft frame (decorative: models and laboratories, never JOKAR DENTAL's patients or rooms). */
export function Frame({ src, sizes, className = "", position = "center", children }: { src: StaticImageData; sizes: string; className?: string; position?: string; children?: ReactNode }) {
  return (
    <div data-reveal="clip" className={`xp-frame ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} quality={76} placeholder="blur" className="object-cover" style={{ objectPosition: position }} />
      {children}
    </div>
  );
}

/** A service inside a larger section: its name as a small label, a signature line as the h3. */
export function SubHeading({ id, label, title, lead }: { id: string; label: string; title: string; lead?: string }) {
  return (
    <header className="max-w-2xl">
      <p className="eyebrow text-blue-700">{label}</p>
      <h3 id={id} className="xp-h3 mt-3 font-display font-light text-balance">
        {title}
      </h3>
      {lead && <p className="mt-5 text-lead text-slate-600">{lead}</p>}
    </header>
  );
}

/** The quiet consultation link that closes each service: it leads to the page's own form, no new call to action. */
export function Ask({ children }: { children: ReactNode }) {
  return (
    <p className="mt-10">
      <a href="#consultation" className="inline-flex min-h-11 items-center font-semibold text-blue-700 underline decoration-sky-400 underline-offset-4 hover:decoration-blue-700">
        {children}
      </a>
    </p>
  );
}

export const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;
