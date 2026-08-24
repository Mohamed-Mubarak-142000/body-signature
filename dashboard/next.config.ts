import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin this app's own directory as the Turbopack root — see the matching
  // comment in ../backend/next.config.ts for why (multiple lockfiles in
  // this monorepo confuse Turbopack's auto-detected root otherwise).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
