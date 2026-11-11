"use client";

import dynamic from "next/dynamic";
import Image, { getImageProps } from "next/image";
import { useEffect, useState } from "react";
import { detectTier, readCapabilities } from "./tier";
import type { Still, Tier } from "./ToothScene";

// three.js + R3F + GSAP form one lazy chunk, requested only after the page load event (3D_HERO_MASTER_PLAN §6).
const ToothScene = dynamic(() => import("./ToothScene"), { ssr: false });
const GIVE_UP_MS = 8000; // still not ready → keep a poster for good (Tier 0 behaviour)
const SCAN = "/images/hero/tooth-scan.png"; // first frame of the digital-scan entrance (D-065)
const FINAL = "/images/hero/tooth-poster.png"; // the finished porcelain tooth
const SIZES = "(min-width: 64rem) 45vw, 90vw";
const POSTER_CLASS = "absolute inset-0 size-full object-contain";

function afterLoadIdle(callback: () => void): () => void {
  let handle = 0;
  const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined; // missing in Safari
  const run = () => {
    handle = idle ? idle(callback, { timeout: 2000 }) : window.setTimeout(callback, 200);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    window.removeEventListener("load", run);
    if (idle) cancelIdleCallback(handle);
    else clearTimeout(handle);
  };
}

/** Scan poster by default; the finished tooth for reduced motion — chosen by the browser, no JS needed. */
function ScanPoster() {
  const common = { alt: "", width: 1000, height: 1000, sizes: SIZES };
  const { srcSet: final } = getImageProps({ ...common, src: FINAL }).props;
  const { props } = getImageProps({ ...common, src: SCAN, loading: "eager", fetchPriority: "high" });
  return (
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet={final} sizes={SIZES} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" comes from getImageProps */}
      <img data-hero-poster {...props} className={POSTER_CLASS} />
    </picture>
  );
}

export function HeroTooth() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [state, setState] = useState<"poster" | "ready" | "settled" | "failed">("poster");
  const [noThreeD, setNoThreeD] = useState(false);
  const [posterCapture, setPosterCapture] = useState<Still | null>(null);

  useEffect(() => {
    const capture = new URLSearchParams(location.search).get("poster");
    if (capture === "scan" || capture === "final") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capture mode for scripts/render-poster.mjs
      setPosterCapture(capture);
      return;
    }
    return afterLoadIdle(() => {
      const detected = detectTier(readCapabilities()); // 0: reduced motion, data saver, no WebGL2, low memory, slow network
      if (detected === 0) setNoThreeD(true);
      else setTier(detected);
    });
  }, []);

  useEffect(() => {
    if (!tier || state !== "poster") return;
    const id = setTimeout(() => setState("failed"), GIVE_UP_MS);
    return () => clearTimeout(id);
  }, [tier, state]);

  if (posterCapture) {
    return (
      <div className="fixed inset-0 z-[100]">
        <ToothScene tier={2} still={posterCapture} onFirstFrame={() => (document.documentElement.dataset.posterReady = "")} />
      </div>
    );
  }

  const finalPoster = noThreeD || state === "failed";
  return (
    <div aria-hidden="true" className="absolute inset-0 [mask-image:radial-gradient(closest-side,#000_72%,transparent)]">
      {finalPoster ? (
        <Image data-hero-poster src={FINAL} alt="" fill sizes={SIZES} loading="eager" className="object-contain" />
      ) : (
        <ScanPoster />
      )}
      {tier && state !== "failed" && (
        <div
          data-hero-canvas
          data-ready={state !== "poster" || undefined}
          data-settled={state === "settled" || undefined}
          className="absolute inset-0 touch-pan-y opacity-0 transition-opacity duration-500 ease-out data-ready:opacity-100"
        >
          <ToothScene
            tier={tier}
            onFirstFrame={() => setState((current) => (current === "poster" ? "ready" : current))}
            onSettled={() => setState("settled")}
            onContextLost={() => setState("failed")}
          />
        </div>
      )}
    </div>
  );
}
