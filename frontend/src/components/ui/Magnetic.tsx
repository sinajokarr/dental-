"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Pulls its child up to 6px toward a fine pointer (AN-14). Off for touch and reduced motion.
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - 0.5) * 12;
      const y = ((event.clientY - box.top) / box.height - 0.5) * 12;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => (el.style.transform = `translate(${x}px, ${y}px)`));
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={ref} className="inline-flex transition-transform duration-300 ease-out">
      {children}
    </span>
  );
}
