"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { detectTier, readCapabilities } from "./tier";
import type { Tier } from "./ToothScene";

// three.js + R3F + GSAP form one lazy chunk, requested only after the page load event (3D_HERO_MASTER_PLAN §6).
const ToothScene = dynamic(() => import("./ToothScene"), { ssr: false });
const GIVE_UP_MS = 8000; // still not ready → keep the poster for good (Tier 0 behaviour)

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

export function HeroTooth() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [state, setState] = useState<"poster" | "ready" | "failed">("poster");
  const [posterCapture, setPosterCapture] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).has("poster")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capture mode for scripts/render-poster.mjs
      setPosterCapture(true);
      return;
    }
    const detected = detectTier(readCapabilities());
    if (detected === 0) return; // reduced motion, data saver, no WebGL2, low memory, slow network
    return afterLoadIdle(() => setTier(detected));
  }, []);

  useEffect(() => {
    if (!tier || state !== "poster") return;
    const id = setTimeout(() => setState("failed"), GIVE_UP_MS);
    return () => clearTimeout(id);
  }, [tier, state]);

  if (posterCapture) {
    return (
      <div className="fixed inset-0 z-[100]">
        <ToothScene tier={2} still onFirstFrame={() => (document.documentElement.dataset.posterReady = "")} />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="absolute inset-0 [mask-image:radial-gradient(closest-side,#000_72%,transparent)]">
      <Image
        data-hero-poster
        src="/images/hero/tooth-poster.png"
        alt=""
        fill
        sizes="(min-width: 64rem) 45vw, 90vw"
        loading="eager"
        fetchPriority="high"
        className="object-contain"
      />
      {tier && state !== "failed" && (
        <div
          data-hero-canvas
          data-ready={state === "ready" || undefined}
          className="absolute inset-0 touch-pan-y opacity-0 transition-opacity duration-500 ease-out data-ready:opacity-100"
        >
          <ToothScene tier={tier} onFirstFrame={() => setState("ready")} onContextLost={() => setState("failed")} />
        </div>
      )}
    </div>
  );
}
