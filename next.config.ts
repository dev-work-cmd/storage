import type { NextConfig } from "next";

const configuredMaxPdfSizeMb = Number(process.env.MAX_PDF_SIZE_MB ?? 10);
const serverActionBodySizeLimitMb =
  Number.isFinite(configuredMaxPdfSizeMb) && configuredMaxPdfSizeMb > 0
    ? Math.min(Math.ceil(configuredMaxPdfSizeMb) + 1, 101)
    : 11;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: `${serverActionBodySizeLimitMb}mb`,
    },
  },
};

export default nextConfig;
