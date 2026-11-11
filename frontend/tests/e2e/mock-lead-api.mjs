// Stand-in for the Django lead API during e2e runs (API_SPEC §2): same contract, deterministic outcomes chosen by
// the submitted full name, and every request recorded for assertions. Run by playwright.config.ts.
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_API_PORT ?? 3199);
const TOKEN = process.env.INTERNAL_API_TOKEN;
const leads = new Map(); // submission_id → reference (idempotency, like the unique column)
const requests = [];
const failedOnce = new Set();

createServer(async (req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (req.method === "GET" && req.url === "/api/v1/health/") return send(200, { status: "ok", db: "ok" });
  if (req.method === "GET" && req.url === "/__requests") return send(200, requests);
  if (req.method !== "POST" || req.url !== "/api/v1/leads/") return send(404, { error: "not_found" });
  if (req.headers.authorization !== `Bearer ${TOKEN}`) return send(401, { error: "unauthorized" });
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = JSON.parse(raw);
  requests.push({ body, clientIp: req.headers["x-client-ip"] ?? null });

  const name = String(body.full_name);
  if (name.startsWith("Connection Drop")) return req.socket.destroy(); // the API process is gone mid-request
  // First request only: stored after the client's 8 s timeout — the retry must find it, not create a twin.
  if (name.startsWith("Slow Server") && !failedOnce.has(name)) {
    failedOnce.add(name);
    await new Promise((resolve) => setTimeout(resolve, 9000));
  }
  if (leads.has(body.submission_id)) return send(200, { reference: leads.get(body.submission_id), created: false });
  if (name.startsWith("Rate Limited")) return send(429, { error: "rate_limited", retry_after: 1800 });
  if (name.startsWith("Invalid Phone")) return send(400, { errors: { phone: ["invalid_phone"] } });
  if (name.startsWith("Server Down")) return send(500, { error: "server_error" });
  if (name.startsWith("Flaky") && !failedOnce.has(name)) {
    failedOnce.add(name);
    return send(500, { error: "server_error" });
  }
  const reference = `JD-E2E${String(leads.size + 1).padStart(3, "0")}`;
  leads.set(body.submission_id, reference);
  return send(201, { reference, created: true });
}).listen(PORT, "127.0.0.1", () => console.log(`mock lead API on :${PORT}`));
