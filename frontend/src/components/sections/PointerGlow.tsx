"use client";

import { useEffect, useRef } from "react";

// Soft ice glow following a fine pointer across the hero (AN-06). CSS variables only — no re-renders.
export function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = ref.current;
    const section = glow?.parentElement;
    if (!glow || !section || !matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      const box = section.getBoundingClientRect();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        glow.style.setProperty("--gx", `${event.clientX - box.x}px`);
        glow.style.setProperty("--gy", `${event.clientY - box.y}px`);
        glow.style.opacity = "1";
      });
    };
    section.addEventListener("pointermove", move);
    return () => {
      section.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 [background:radial-gradient(520px_circle_at_var(--gx)_var(--gy),color-mix(in_srgb,var(--color-sky-400)_45%,transparent),transparent_65%)]"
    />
  );
}
