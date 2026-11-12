"use client";

import { useEffect, useRef } from "react";

/** Depth for a fine pointer: moving over the portrait nudges the subject and the backdrop a few pixels apart.
 *  Two CSS variables, one rAF per frame while the pointer moves; nothing runs for touch, reduced motion or no JS. */
export function PortraitParallax() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = marker.current?.parentElement;
    if (!root || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = root.getBoundingClientRect();
        root.style.setProperty("--px", String(Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - 0.5) * 2))));
        root.style.setProperty("--py", String(Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - 0.5) * 2))));
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      root.style.setProperty("--px", "0");
      root.style.setProperty("--py", "0");
    };
    const section = root.closest("section") ?? root;
    section.addEventListener("pointermove", move as EventListener, { passive: true });
    section.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", move as EventListener);
      section.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <span ref={marker} hidden />;
}
