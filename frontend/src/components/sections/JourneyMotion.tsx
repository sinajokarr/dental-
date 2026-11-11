"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/motion";

// AN-16/17: the navy panel settles in and the journey line draws with the scroll. Without JS or with
// reduced motion nothing here runs, so the line stays drawn and every step stays lit.
export function JourneyMotion() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = anchor.current?.closest("section");
    if (!section) return;
    let revert = () => {};
    let cancelled = false;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const steps = [...section.querySelectorAll<HTMLElement>("[data-journey-step]")];
        const list = section.querySelector("ol");
        steps.forEach((step) => step.setAttribute("data-pending", ""));
        gsap.fromTo(
          section.querySelector("[data-journey-panel]"),
          { scale: 0.96 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "top 25%", scrub: 0.6 } },
        );
        for (const line of section.querySelectorAll<HTMLElement>("[data-journey-line]")) {
          const axis = line.dataset.journeyLine === "x" ? "scaleX" : "scaleY";
          gsap.fromTo(line, { [axis]: 0 }, { [axis]: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 80%", end: "bottom 55%", scrub: 0.6 } });
        }
        const triggers = steps.map((step) =>
          ScrollTrigger.create({ trigger: step, start: "top 80%", onEnter: () => step.removeAttribute("data-pending") }),
        );
        return () => {
          triggers.forEach((trigger) => trigger.kill());
          steps.forEach((step) => step.removeAttribute("data-pending"));
        };
      });
      revert = () => mm.revert();
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  return <span ref={anchor} hidden />;
}
