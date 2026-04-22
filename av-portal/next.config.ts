import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['googleapis', 'google-auth-library', '@google-cloud/storage'],
};

export default nextConfig;
