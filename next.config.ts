import type { NextConfig } from "next";

const isWindows = process.platform === "win32";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  ...(isWindows
    ? {
        typescript: {
          ignoreBuildErrors: true,
        },
        experimental: {
          workerThreads: true,
        },
        turbopack: {
          root: process.cwd(),
        },
      }
    : {}),
};

export default nextConfig;
