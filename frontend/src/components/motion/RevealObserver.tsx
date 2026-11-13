"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Scroll reveals (AN-10/11/12). Content is hidden only after this runs (html[data-motion]), so it stays
// visible without JS, if JS fails, and with reduced motion. Elements already in view never animate.
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let observer: IntersectionObserver | undefined;
    let handle = 0;
    const start = () => {
      const elements = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")];
      for (const el of elements) if (el.getBoundingClientRect().top < innerHeight) el.dataset.revealed = "";
      document.documentElement.dataset.motion = "";
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.revealed = "";
            observer!.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      for (const el of elements) if (!("revealed" in el.dataset)) observer.observe(el);
    };
    // On the first load the page segment may still be hydrating (streamed after the layout): marking its elements
    // now would make React report a hydration mismatch. Wait for load and an idle moment; until then nothing is
    // hidden (html[data-motion] is not set yet), so the content is simply visible. Client navigations start at once.
    const hasIdle = typeof requestIdleCallback === "function"; // Safari < 18 has no idle callback
    const idle = (fn: () => void): number => (hasIdle ? requestIdleCallback(fn, { timeout: 600 }) : window.setTimeout(fn, 150));
    const later = () => (handle = idle(start));
    if (document.documentElement.hasAttribute("data-motion")) start();
    else if (document.readyState === "complete") later();
    else addEventListener("load", later, { once: true });
    return () => {
      removeEventListener("load", later);
      if (hasIdle) cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
