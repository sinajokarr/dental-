// Device tiers for the hero tooth (3D_HERO_MASTER_PLAN §8): 0 = poster only, 1 = light material, 2 = full material.
export type Capabilities = {
  reducedMotion: boolean;
  saveData: boolean;
  webgl2: boolean;
  deviceMemory?: number; // GB, Chromium only
  effectiveType?: string; // Network Information API, Chromium only
  finePointer: boolean;
  wide: boolean; // ≥ 1024px
};

export function detectTier(c: Capabilities): 0 | 1 | 2 {
  const slowNetwork = ["slow-2g", "2g", "3g"].includes(c.effectiveType ?? "");
  if (c.reducedMotion || c.saveData || !c.webgl2 || (c.deviceMemory ?? 8) < 4 || slowNetwork) return 0;
  return c.finePointer && c.wide ? 2 : 1;
}

type Connection = { saveData?: boolean; effectiveType?: string };

export function readCapabilities(): Capabilities {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: Connection };
  return {
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData ?? false,
    webgl2: !!document.createElement("canvas").getContext("webgl2"),
    deviceMemory: nav.deviceMemory,
    effectiveType: nav.connection?.effectiveType,
    finePointer: matchMedia("(pointer: fine)").matches,
    wide: matchMedia("(min-width: 64rem)").matches,
  };
}
