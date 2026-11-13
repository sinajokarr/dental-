"use client";

import { useEffect, useRef } from "react";

/** Plays one treatment film once, the first time it is at least 40% in view; nothing for reduced motion or no JS.
 *  Until then nothing is downloaded (the sources only get their src here). If autoplay is refused, the CSS still
 *  shows the finished frame. The observer is released as soon as it has fired. */
export function FilmOnView() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = marker.current?.parentElement;
    const video = root?.querySelector("video");
    if (!root || !video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        video.querySelectorAll<HTMLSourceElement>("source[data-src]").forEach((source) => (source.src = source.dataset.src!));
        video.load();
        video.addEventListener("playing", () => (root.dataset.state = "play"), { once: true });
        video.addEventListener("ended", () => (root.dataset.state = "ended"), { once: true });
        video.play().catch(() => (root.dataset.state = "still"));
      },
      { threshold: 0.4 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  return <span ref={marker} hidden />;
}
