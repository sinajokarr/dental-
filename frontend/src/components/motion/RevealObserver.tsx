"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Scroll reveals (AN-10/11/12). Content is hidden only after this runs (html[data-motion]), so it stays
// visible without JS, if JS fails, and with reduced motion. Elements already in view never animate.
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")];
    for (const el of elements) if (el.getBoundingClientRect().top < innerHeight) el.dataset.revealed = "";
    document.documentElement.dataset.motion = "";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const el of elements) if (!("revealed" in el.dataset)) observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
