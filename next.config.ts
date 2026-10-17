import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  async headers() {
    return [{ source: "/images/renditions/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
  outputFileTracingIncludes: {
    "/api/**": ["./seed/cache/**/*", "./seed/labels.json", "./seed/mara.json", "./public/seed/**/*"],
  },
};
export default nextConfig;
