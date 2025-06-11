import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  'allowedDevOrigins': ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8081', 'http://127.0.0.1:8081'],
};

export default nextConfig;
