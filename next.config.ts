import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  agentRules: false,
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
