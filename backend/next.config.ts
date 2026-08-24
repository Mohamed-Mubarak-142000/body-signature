import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin this app's own directory as the Turbopack root — otherwise it walks
  // up to the monorepo root (zefaaf-body-signature/package-lock.json) and
  // resolves node_modules/tsconfig from the wrong place, breaking type
  // inference (e.g. Prisma's generated types) despite `npm run build`
  // being invoked from inside backend/.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
