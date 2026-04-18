import { spawn } from "node:child_process";

const argv = new Set(process.argv.slice(2));
const shouldOpenBrowser = !argv.has("--no-open");
const useWebpack =
  argv.has("--webpack") || process.env.NEXT_DEV_BUNDLER === "webpack";

const port = Number.parseInt(process.env.PORT ?? "3000", 10) || 3000;
const dir = process.cwd();
const url = process.env.DEV_START_URL ?? `http://localhost:${port}/onboarding`;
const isWindows = process.platform === "win32";

let opened = false;

function openBrowser(targetUrl) {
  if (opened) {
    return;
  }
  opened = true;

  let command;
  let args;
  if (process.platform === "darwin") {
    command = "open";
    args = [targetUrl];
  } else if (process.platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", targetUrl];
  } else {
    command = "xdg-open";
    args = [targetUrl];
  }

  const child = spawn(command, args, {
    stdio: "ignore",
    detached: true,
  });
  child.on("error", (error) => {
    console.warn("Could not auto-open browser:", error.message);
  });
  child.unref();
}

async function runWindowsDevServer() {
  const envModule = await import("@next/env");
  const { loadEnvConfig } = envModule.default ?? envModule;
  const { startServer } = await import("next/dist/server/lib/start-server.js");

  loadEnvConfig(dir, true);

  process.env.NODE_ENV = "development";
  process.env.NEXT_RUNTIME = "nodejs";
  process.env.__NEXT_DEV_SERVER = "1";
  process.env.NEXT_PRIVATE_START_TIME =
    process.env.NEXT_PRIVATE_START_TIME ?? Date.now().toString();

  if (useWebpack) {
    delete process.env.TURBOPACK;
  } else {
    process.env.TURBOPACK = process.env.TURBOPACK || "1";
  }

  await startServer({
    dir,
    port,
    allowRetry: true,
    isDev: true,
    serverFastRefresh: true,
  });
}

async function runNonWindowsDevServer() {
  const nextBin = process.platform === "win32" ? "next.cmd" : "next";
  const nextArgs = ["dev", "--port", String(port)];
  if (useWebpack) {
    nextArgs.push("--webpack");
  }

  const child = spawn(nextBin, nextArgs, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

if (shouldOpenBrowser) {
  setTimeout(() => openBrowser(url), 1500);
}

if (isWindows) {
  await runWindowsDevServer();
} else {
  await runNonWindowsDevServer();
}
