"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Plays one service illustration once, the first time it scrolls into view (D-077).
 * The SVG inside is server-rendered in its FINISHED state, so no-JS and reduced motion need nothing from here.
 * With motion allowed the wrapper is "armed" (animations paused at their first frame) and an IntersectionObserver
 * switches it to "play". An illustration already on screen at load never animates (same rule as RevealObserver);
 * no scroll listener, no requestAnimationFrame; the observer is released as soon as it has fired (one short timer waits for the lazy images).
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
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        // The renders are lazy images: let them arrive (at most 2.5 s) so the story never plays on an empty circle.
        const decoded = Promise.all([...element.querySelectorAll("img")].map((img) => (img.complete ? null : img.decode().catch(() => null))));
        void Promise.race([decoded, new Promise((resolve) => setTimeout(resolve, 2500))]).then(() => {
          if (!cancelled) element.dataset.state = "play";
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} data-service-art="" className="size-full">
      {children}
    </div>
  );
}
