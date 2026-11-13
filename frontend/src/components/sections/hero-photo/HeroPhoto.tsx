import Image from "next/image";
import smile from "../../../assets/hero-smile.jpg";
import "./hero-photo.css";

// The hero's visual (D-088, composition D-089): the clinic's own close-up photograph of a smile with porcelain
// veneers. Desktop: an editorial split — the photograph runs full height to the edge of the screen on the
// inline-end side and dissolves softly into the ivory where it meets the words. Phones: a full-width print under
// the calls to action. No frame, no ornaments: the smile is the design. Provided by the client; decorative here
// (no caption presents it as a specific patient's result). The markup is the finished picture (no-JS, reduced
// motion); with motion allowed the photograph fades in from a slow push, once (about 2.4 s), then rests.
export function HeroPhoto() {
  return (
    <div aria-hidden="true" data-hero-photo="" className="hero-photo">
      <Image src={smile} alt="" fill sizes="(min-width: 64rem) 46vw, 100vw" quality={78} placeholder="blur" loading="eager" fetchPriority="high" className="hero-photo-img object-cover" />
    </div>
  );
}
