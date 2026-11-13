import { FilmOnView } from "./FilmOnView";
import "./service-film.css";

// The home page's three treatment chapters and the treatment pages' heroes (D-086): one short real film per treatment,
// in a circular window. Decorative only, never captioned as a specific patient, a doctor or a treatment result.
//   implants: a dentist shows a patient a dental cast (assessment and planning come first)
//   veneers:  the clinic's own close-up of a smile with porcelain veneers (D-090; provided by the client)
//   smile design: the clinic's own footage of a smile, filmed close up (D-090; provided by the client)
// The markup is the finished picture (CSS background = the film's last frame) for no-JS, reduced motion and print.
// With motion allowed, FilmOnView loads the film only when the window scrolls into view and plays it once; it rests on
// its last frame. Native <video>, no library.
const FILMS = { implants: "implants", veneers: "veneers", smileDesign: "smile" } as const;
const MOTION = "(prefers-reduced-motion: no-preference)";

export function ServiceFilm({ name }: { name: keyof typeof FILMS }) {
  const base = `/images/treatments/${FILMS[name]}`;
  // A string, because React does not serialise `muted`; data-src keeps the browser from loading anything early.
  const video = `<video muted playsinline disableremoteplayback preload="none" tabindex="-1" width="720" height="720">
<source data-src="${base}-480.webm" type="video/webm" media="${MOTION} and (max-width: 767px)">
<source data-src="${base}-480.mp4" type="video/mp4" media="${MOTION} and (max-width: 767px)">
<source data-src="${base}-720.webm" type="video/webm" media="${MOTION}">
<source data-src="${base}-720.mp4" type="video/mp4" media="${MOTION}">
</video>`;
  return (
    <div aria-hidden="true" data-service-film={name} className="sf" style={{ backgroundImage: `url(${base}-last.webp)` }}>
      <div className="sf-video" dangerouslySetInnerHTML={{ __html: video }} />
      <FilmOnView />
    </div>
  );
}
