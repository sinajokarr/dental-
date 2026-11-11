// The hero tooth's digital-scan entrance (D-063), kept free of three.js so its timing is unit-tested.
// A plane travels down the tooth in model space (y ∈ [-1, 1]): above it porcelain, below it scan data.
import type { gsap as Gsap } from "gsap";

export const SCAN_TOP = 1.12;
export const SCAN_BOTTOM = -1.12;
/** First frame (= tooth-scan.png) and rest pose (= tooth-poster.png). */
export const ENTRANCE_START = { scan: SCAN_TOP, points: 1, glow: 1, rim: 0, z: 6.6, spin: 0.38 };
export const ENTRANCE_FINAL = { scan: SCAN_BOTTOM, points: 0, glow: 0, rim: 1, z: 6.0, spin: 0 };

type Motion = typeof ENTRANCE_START & { sweepX: number; sweepI: number; float: number };

/** The scan mills the cloud into porcelain while the camera eases in; then rim light, a polish glint, one float.
 *  Ends ≈ 4.85 s after the reveal — automatic motion stays under 5 s (WCAG 2.2.2, D-041). */
export function buildEntrance(gsap: typeof Gsap, motion: Motion, tick: () => void, onComplete: () => void) {
  return gsap
    .timeline({ delay: 0.35, onUpdate: tick, onComplete })
    .to(motion, { scan: SCAN_BOTTOM, duration: 2.3, ease: "power1.inOut" }, 0)
    .to(motion, { z: ENTRANCE_FINAL.z, duration: 2.6, ease: "power2.inOut" }, 0)
    .to(motion, { spin: 0, duration: 2.8, ease: "power2.out" }, 0)
    .to(motion, { points: 0, duration: 0.6, ease: "power1.out" }, 1.9)
    .to(motion, { glow: 0, duration: 0.4 }, 2.1)
    .to(motion, { rim: 1, duration: 0.8, ease: "power1.out" }, 2.0)
    .fromTo(motion, { sweepX: -3.2 }, { sweepX: 3.2, duration: 1.2, ease: "power1.inOut" }, 2.3)
    .to(motion, { sweepI: 12, duration: 0.6, ease: "sine.in", yoyo: true, repeat: 1 }, 2.3)
    .to(motion, { float: 1, duration: 1.6, ease: "sine.inOut" }, 2.9);
}
