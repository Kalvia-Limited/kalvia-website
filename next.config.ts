import type { NextConfig } from "next";
import { commonSecurityHeaders } from "./lib/security-headers";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: commonSecurityHeaders }];
  },
};
export default nextConfig;
