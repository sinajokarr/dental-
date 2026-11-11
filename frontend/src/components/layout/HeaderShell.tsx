"use client";

import { useEffect, useState, type ReactNode } from "react";

// Transparent over the hero; glass and 64px tall once the page scrolls (AN-01).
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ease-out data-scrolled:glass-nav"
    >
      <div className="mx-auto flex h-19 max-w-7xl items-center justify-between gap-6 px-6 transition-[height] duration-300 ease-out in-data-scrolled:h-16 lg:px-12">
        {children}
      </div>
    </header>
  );
}
