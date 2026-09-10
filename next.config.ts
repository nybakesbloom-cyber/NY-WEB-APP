import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mongoose is Node-only; keep it out of the bundler entirely.
  serverExternalPackages: ["mongoose"],
  /* config options here */
};

export default nextConfig;
