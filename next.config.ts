import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel traces the app itself. `standalone` is for Docker/Caddy and
  // leaves `.next/next-server.js.nft.json` missing on Vercel builds.
  serverExternalPackages: ["pdf-parse", "mammoth", "pdfjs-dist", "@napi-rs/canvas"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
