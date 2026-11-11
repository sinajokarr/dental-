import { gzipSync } from "node:zlib";
import { expect, test, type APIRequestContext } from "@playwright/test";

// H03 — page budgets (SECURITY_PERFORMANCE_QA §1) on the production build, and lab Core Web Vitals on a
// throttled phone (Chromium CDP: ~1.6 Mbps, 150 ms RTT, 4× slower CPU). Field data needs the real domain: NOT RUN.
const KB = 1024;
const fetchBody = async (request: APIRequestContext, url: string) => Buffer.from(await (await request.get(url)).body());

for (const locale of ["fa", "en"]) {
  test(`/${locale}: initial JS ≤ 170 KB, CSS ≤ 35 KB, fonts ≤ 120 KB (gzip/wire), 3D and GSAP not in the initial load`, async ({ request }) => {
    const response = await request.get(`/${locale}`);
    const html = await response.text();
    // Modern browsers never download <script nomodule> (Next's legacy polyfills), so they are not in the budget.
    const scripts = [...html.matchAll(/<script([^>]+)src="([^"]+)"([^>]*)>/g)].filter((m) => !/nomodule/i.test(m[1] + m[3])).map((m) => m[2]);
    const styles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
    // Font preloads travel in the HTTP Link header (React preload()).
    const fonts = [...(response.headers()["link"] ?? "").matchAll(/<([^>]+\.woff2)>/g)].map((m) => m[1]);
    expect(fonts.length).toBeGreaterThan(0);
    let js = 0, css = 0, font = 0, code = "";
    for (const src of scripts) {
      const body = await fetchBody(request, src);
      js += gzipSync(body).length;
      code += body.toString();
    }
    for (const href of styles) css += gzipSync(await fetchBody(request, href)).length;
    for (const href of fonts) font += (await (await request.get(href)).body()).length; // woff2 is already compressed
    console.log(`/${locale}: JS ${(js / KB).toFixed(0)} KB · CSS ${(css / KB).toFixed(0)} KB · fonts ${(font / KB).toFixed(0)} KB`);
    expect(js).toBeLessThanOrEqual(170 * KB);
    expect(css).toBeLessThanOrEqual(35 * KB);
    expect(font).toBeLessThanOrEqual(120 * KB);
    expect(code).not.toMatch(/WebGLRenderer|ScrollTrigger/); // three.js and GSAP stay lazy (after load)
  });
}

test("lab vitals on a throttled phone: LCP ≤ 2.5 s, CLS ≈ 0, hero image ≤ 120 KB", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let poster = 0;
  page.on("response", async (response) => {
    if (response.url().includes("tooth-scan") || response.url().includes("tooth-poster")) poster = Math.max(poster, (await response.body()).length);
  });
  await page.goto("/en", { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const { lcp, cls } = await page.evaluate(
    () =>
      new Promise<{ lcp: number; cls: number }>((resolve) => {
        let lcp = 0, cls = 0;
        new PerformanceObserver((list) => list.getEntries().forEach((e) => (lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) =>
          (list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]).forEach((e) => !e.hadRecentInput && (cls += e.value)),
        ).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve({ lcp, cls }), 200);
      }),
  );
  console.log(`throttled phone: LCP ${(lcp / 1000).toFixed(2)} s · CLS ${cls.toFixed(3)} · hero image ${(poster / KB).toFixed(0)} KB`);
  expect(lcp).toBeLessThanOrEqual(2500);
  expect(cls).toBeLessThan(0.01);
  expect(poster).toBeGreaterThan(0);
  expect(poster).toBeLessThanOrEqual(120 * KB);
  await context.close();
});
