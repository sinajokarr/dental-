"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Tier } from "./ToothScene";

// three.js + R3F load only after hydration, never on the critical path (3D_HERO_MASTER_PLAN §6).
const ToothScene = dynamic(() => import("./ToothScene"), { ssr: false });

export function HeroTooth() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [poster, setPoster] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- device capability is only known in the browser */
    setPoster(new URLSearchParams(location.search).has("poster")); // scripts/render-poster.mjs
    setTier(matchMedia("(pointer: fine) and (min-width: 64rem)").matches ? 2 : 1);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (poster) {
    // Poster capture: full-viewport, unmasked, desktop material — the poster equals the 3D first frame.
    return (
      <div className="fixed inset-0 z-[100]">
        <ToothScene tier={2} onFirstFrame={() => (document.documentElement.dataset.posterReady = "")} />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="absolute inset-0 [mask-image:radial-gradient(closest-side,#000_72%,transparent)]">
      {tier && <ToothScene tier={tier} />}
    </div>
  );
}
