import type { NextConfig } from "next";
import { commonSecurityHeaders } from "./lib/security-headers";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [{ source: "/:path*", headers: commonSecurityHeaders }];
  },
};
export default nextConfig;


