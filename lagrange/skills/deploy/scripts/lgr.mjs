#!/usr/bin/env node
// Runs the LagrangeCloud CLI that matches the server it talks to. The server
// publishes its CLI at /cli/lgr.mjs and the file's hash at /cli/manifest.json;
// this launcher downloads the file when the hash changes, keeps it in the
// cache folder, and runs it with the same arguments. A platform release thus
// updates every plugin user without a plugin update.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_URL = "https://lgr.tensorblock.co";
const args = process.argv.slice(2);
const urlArg = args.findIndex((a) => a === "--url" || a.startsWith("--url="));
const base = (urlArg < 0 ? process.env.LGR_API_URL ?? DEFAULT_URL : args[urlArg].includes("=") ? args[urlArg].slice(6) : args[urlArg + 1] ?? DEFAULT_URL).replace(/\/+$/, "");
const cache = join(process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"), "lgr");
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

async function fetchText(path) {
  const res = await fetch(base + path, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${base}${path} answered ${res.status}`);
  return res.text();
}

/** The cached CLI for the server's current hash, downloading it if needed. */
async function current() {
  const { sha256: want } = JSON.parse(await fetchText("/cli/manifest.json"));
  const file = join(cache, `${want}.mjs`);
  if (await stat(file).then(() => true, () => false)) return file;
  const code = await fetchText("/cli/lgr.mjs");
  if (sha256(code) !== want) throw new Error(`the CLI downloaded from ${base} does not match its hash`);
  await mkdir(cache, { recursive: true });
  await writeFile(`${file}.tmp`, code);
  await rename(`${file}.tmp`, file);
  // Keep only the new CLI and the one before it.
  const older = (await newestFirst()).slice(2);
  await Promise.all(older.map((f) => rm(f, { force: true })));
  return file;
}

async function newestFirst() {
  const files = (await readdir(cache).catch(() => [])).filter((f) => f.endsWith(".mjs"));
  const dated = await Promise.all(files.map(async (f) => ({ f: join(cache, f), t: (await stat(join(cache, f))).mtimeMs })));
  return dated.sort((a, b) => b.t - a.t).map((d) => d.f);
}

/** The most recently downloaded CLI, for when the server can't be reached. */
async function newestCached() {
  const newest = (await newestFirst())[0];
  // A cached file is only run if it still matches the hash in its name.
  return newest && sha256(await readFile(newest, "utf8")) === newest.slice(-68, -4) ? newest : undefined;
}

let cli;
try {
  cli = await current();
} catch (err) {
  cli = await newestCached();
  if (!cli) {
    console.error(`lgr: could not download the CLI from ${base}: ${err.message}`);
    process.exit(1);
  }
  console.error(`lgr: could not check ${base} for a newer CLI (${err.message}); using the one downloaded before.`);
}

const child = spawn(process.execPath, [cli, ...args], { stdio: "inherit" });
// Ctrl-C reaches the CLI directly, which cancels its run; only pass on SIGTERM.
process.on("SIGINT", () => {});
process.on("SIGTERM", () => child.kill("SIGTERM"));
child.on("exit", (code, signal) => process.exit(code ?? (signal === "SIGINT" ? 130 : 143)));
