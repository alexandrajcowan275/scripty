import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingIncludes: {
    "/api/**": ["./seed/cache/**/*", "./seed/labels.json", "./seed/mara.json", "./public/seed/**/*"],
  },
};
export default nextConfig;
