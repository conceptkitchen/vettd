import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@kalibr/sdk", "cohere-ai", "@google/generative-ai"],
};

export default nextConfig;
