// Quick end-to-end check that mirrors what the frontend does on mount
// and on Analyze. Not a production test — used during integration to
// confirm wire compatibility without spinning up a browser.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE = process.env.BACKEND_URL || "http://localhost:8000";

async function call(path, init) {
  const res = await fetch(BASE + path, init);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: res.ok, status: res.status, json, text };
}

async function main() {
  console.log("-> /api/health");
  const h = await call("/api/health");
  console.log(h.status, h.json);

  console.log("-> /api/jobs");
  const j = await call("/api/jobs");
  console.log(j.status, "count=", Array.isArray(j.json) ? j.json.length : 0);

  if (!Array.isArray(j.json) || j.json.length === 0) {
    throw new Error("No jobs returned");
  }

  console.log("-> /api/analyze (valid PDF)");
  const sample = resolve(
    __dirname,
    "..",
    "..",
    "..",
    "backend",
    "sample_data",
    "sample_resume.pdf",
  );
  const buf = await readFile(sample);
  const form = new FormData();
  // File constructor in node 20+ accepts a Blob with filename via:
  form.append(
    "resume",
    new Blob([buf], { type: "application/pdf" }),
    "sample_resume.pdf",
  );
  form.append("jobRole", j.json[0].id);
  const a = await call("/api/analyze", { method: "POST", body: form });
  console.log(a.status, a.json && {
    id: a.json.id,
    candidate: a.json.candidate?.name,
    matchScore: a.json.matchScore,
    matched: a.json.matchedSkills?.length,
    missing: a.json.missingSkills?.length,
    suggestions: a.json.suggestions?.length,
    education: a.json.education?.length,
    experience: a.json.experience?.length,
  });

  console.log("-> /api/analyze (invalid role)");
  const form2 = new FormData();
  form2.append(
    "resume",
    new Blob([buf], { type: "application/pdf" }),
    "sample_resume.pdf",
  );
  form2.append("jobRole", "not-a-real-role");
  const e1 = await call("/api/analyze", { method: "POST", body: form2 });
  console.log(e1.status, e1.json);

  console.log("-> /api/analyze (bad extension)");
  const form3 = new FormData();
  form3.append(
    "resume",
    new Blob([Buffer.from("hello")], { type: "text/plain" }),
    "fake.txt",
  );
  form3.append("jobRole", j.json[0].id);
  const e2 = await call("/api/analyze", { method: "POST", body: form3 });
  console.log(e2.status, e2.json);

  console.log("-> /api/analyze (empty file)");
  const form4 = new FormData();
  form4.append(
    "resume",
    new Blob([new Uint8Array(0)], { type: "application/pdf" }),
    "empty.pdf",
  );
  form4.append("jobRole", j.json[0].id);
  const e3 = await call("/api/analyze", { method: "POST", body: form4 });
  console.log(e3.status, e3.json);

  console.log("-> /api/analyze (oversized PDF)");
  const big = Buffer.alloc(6 * 1024 * 1024, 0x25); // 6MB of "%"
  const form5 = new FormData();
  form5.append(
    "resume",
    new Blob([big], { type: "application/pdf" }),
    "big.pdf",
  );
  form5.append("jobRole", j.json[0].id);
  const e4 = await call("/api/analyze", { method: "POST", body: form5 });
  console.log(e4.status, e4.json);
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
