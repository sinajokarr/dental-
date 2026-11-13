"use client";

import { useEffect, useRef } from "react";

/** If the browser refuses to autoplay (low power mode, a strict policy), show the finished smile as a still instead of
 *  leaving the film on its first frame. Nothing else: the film itself is native. */
export function FilmGuard() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = marker.current?.parentElement;
    const video = root?.querySelector("video");
    if (!root || !video || !video.paused || video.ended) return;
    video.play().catch(() => {
      root.dataset.still = "";
    });
  }, []);
  return <span ref={marker} hidden />;
}
