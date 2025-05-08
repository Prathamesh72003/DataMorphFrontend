import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost','127.0.0.1', '127.0.0.1:5000'], // Adjust to your Flask server's domain if different
  },
};

export default nextConfig;
