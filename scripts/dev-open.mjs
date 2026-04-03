import { spawn } from "node:child_process";

const port = process.env.PORT ?? "3000";
const url = process.env.DEV_START_URL ?? `http://localhost:${port}/onboarding`;

const nextBin = process.platform === "win32" ? "next.cmd" : "next";
const next = spawn(nextBin, ["dev", "--port", port], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

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

setTimeout(() => openBrowser(url), 1500);

next.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
