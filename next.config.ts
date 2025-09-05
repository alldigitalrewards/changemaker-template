import type { NextConfig } from "next";

const config = {
  reactStrictMode: true,
  // Disable Turbopack for now to avoid build issues
  experimental: { turbopack: false },
};

export default config;
