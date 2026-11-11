// Shared motion helpers (ANIMATION_MASTER_PLAN §2–3). Browser-only.

/** +1 for LTR, -1 for RTL: multiply every horizontal offset by this. */
export const dirSign = (): 1 | -1 => (document.documentElement.dir === "rtl" ? -1 : 1);

export const prefersReducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Gsap = { gsap: typeof import("gsap").gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger };
let gsapPromise: Promise<Gsap> | undefined;

/** GSAP + ScrollTrigger, loaded on first use only — never part of the initial bundle (D-039). */
export function loadGsap(): Promise<Gsap> {
  gsapPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  });
  return gsapPromise;
}
