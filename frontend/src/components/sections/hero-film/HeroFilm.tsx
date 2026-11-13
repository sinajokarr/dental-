import { FilmGuard } from "./FilmGuard";
import "./hero-film.css";

// The hero's visual (D-084): "the smile moment" — a real person looks at the camera and breaks into a natural smile,
// once, inside the arch window, and the picture rests on the smile. Licensed stock footage, decorative only: never
// presented as a patient, a doctor or a treatment result (docs/ASSET_LICENSES.md).
// Native <video>, no library: it autoplays muted without JavaScript, never loops, and its sources carry a
// prefers-reduced-motion media query, so with reduced motion nothing is downloaded and CSS shows the finished smile
// as a still. Until the film starts the window shows the film's own first frame (CSS background), so nothing jumps.
// The markup is a string because React does not serialise `muted`, and an unmuted video may not autoplay.
const FILM = "/images/hero/film";
const MOTION = "(prefers-reduced-motion: no-preference)";
const VIDEO = `<video autoplay muted playsinline disableremoteplayback preload="auto" tabindex="-1" width="720" height="900">
<source src="${FILM}/smile-480.webm" type="video/webm" media="${MOTION} and (max-width: 767px)">
<source src="${FILM}/smile-480.mp4" type="video/mp4" media="${MOTION} and (max-width: 767px)">
<source src="${FILM}/smile-720.webm" type="video/webm" media="${MOTION}">
<source src="${FILM}/smile-720.mp4" type="video/mp4" media="${MOTION}">
</video>`;

export function HeroFilm() {
  return (
    <div aria-hidden="true" data-hero-film="" className="hero-film absolute inset-0">
      <link rel="preload" as="image" href={`${FILM}/first.webp`} media={MOTION} fetchPriority="high" />
      <link rel="preload" as="image" href={`${FILM}/last.webp`} media="(prefers-reduced-motion: reduce)" fetchPriority="high" />
      <div className="hero-film-window" dangerouslySetInnerHTML={{ __html: VIDEO }} />
      <FilmGuard />
    </div>
  );
}
