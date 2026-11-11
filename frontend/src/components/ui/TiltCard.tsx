"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Hover lift + ≤4° tilt + spotlight (AN-13). Fine pointers only; nothing for touch or reduced motion.
export function TiltCard({
  className = "",
  style,
  children,
  ...rest
}: { className?: string; style?: CSSProperties; children: ReactNode } & Record<`data-${string}`, string>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card || !matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width, y = (event.clientY - box.top) / box.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) translateY(-4px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg)`;
        card.style.setProperty("--sx", `${x * 100}%`);
        card.style.setProperty("--sy", `${y * 100}%`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      card.style.transform = "";
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} style={style} className={`group/card relative transition-transform duration-300 ease-out ${className}`} {...rest}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 [background:radial-gradient(320px_circle_at_var(--sx)_var(--sy),rgb(189_234_255/0.5),transparent_60%)] group-hover/card:opacity-100" />
      {children}
    </div>
  );
}
