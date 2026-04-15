import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all tunnel domains to enable hot reloading and routing
  allowedDevOrigins: [
    "4bb43c9721623b.lhr.life", 
    "*.lhr.life", 
    "*.loca.lt", 
    "*.serveo.net",
    "*.pinggy.io"
  ],
};

export default nextConfig;
