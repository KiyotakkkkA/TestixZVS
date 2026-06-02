import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.18.0.1", "172.30.32.1"],
  output: "standalone",
};

export default nextConfig;
