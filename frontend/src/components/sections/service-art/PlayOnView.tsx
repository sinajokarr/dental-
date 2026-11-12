"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Plays one service illustration once, the first time it scrolls into view (D-077).
 * The SVG inside is server-rendered in its FINISHED state, so no-JS and reduced motion need nothing from here.
 * With motion allowed the wrapper is "armed" (animations paused at their first frame) and an IntersectionObserver
 * switches it to "play". An illustration already on screen at load never animates (same rule as RevealObserver);
 * no scroll listener, no timers, no requestAnimationFrame; the observer is released as soon as it has fired.
 */
export function PlayOnView({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || element.dataset.state === "play") return;
    if (element.dataset.state !== "armed") {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const box = element.getBoundingClientRect();
      if (box.top < innerHeight * 0.85 && box.bottom > 0) return;
      element.dataset.state = "armed";
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.state = "play";
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-service-art="" className="size-full">
      {children}
    </div>
  );
}
