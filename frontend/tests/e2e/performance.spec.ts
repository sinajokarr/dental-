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

test("lab vitals on a throttled phone: LCP ≤ 2.5 s, CLS ≈ 0, the hero film's first frame ≤ 60 KB and the phone film ≤ 250 KB, no 3D", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  // The hero film (D-084): its first frame is the poster; the phone gets the small film; no 3D asset.
  let photo = 0, film = 0;
  const heroAssets: string[] = [];
  page.on("request", (request) => /models\/|tooth/.test(request.url()) && heroAssets.push(request.url()));
  page.on("response", async (response) => {
    if (response.url().includes("film/first.webp")) photo = Math.max(photo, (await response.body()).length);
    if (/film\/smile-\d+\./.test(response.url())) film = Math.max(film, Number(response.headers()["content-range"]?.split("/")[1] ?? response.headers()["content-length"] ?? 0)); // whole file, however it is ranged
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
  console.log(`throttled phone: LCP ${(lcp / 1000).toFixed(2)} s · CLS ${cls.toFixed(3)} · film poster ${(photo / KB).toFixed(0)} KB · film ${(film / KB).toFixed(0)} KB · other hero assets ${heroAssets.length}`);
  expect(lcp).toBeLessThanOrEqual(2500);
  expect(cls).toBeLessThan(0.01);
  expect(photo).toBeGreaterThan(0);
  expect(photo).toBeLessThanOrEqual(60 * KB);
  expect(film).toBeGreaterThan(0);
  expect(film).toBeLessThanOrEqual(250 * KB);
  expect(heroAssets).toEqual([]);
  await context.close();
});

for (const locale of ["fa", "en"]) {
  test(`/${locale}: fonts that arrive late never move the page (CLS 0 on a phone)`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    // Slow font delivery, as on a weak mobile network: the text is painted before the web fonts arrive.
    await page.route("**/fonts/*.woff2", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });
    await page.goto(`/${locale}`, { waitUntil: "load" });
    await page.waitForTimeout(1000);
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) =>
            (list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]).forEach((e) => !e.hadRecentInput && (total += e.value)),
          ).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 200);
        }),
    );
    expect(cls).toBeLessThan(0.01);
    await context.close();
  });
}
