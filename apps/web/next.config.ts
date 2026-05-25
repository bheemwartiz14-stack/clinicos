import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@mediclinic/auth", "@mediclinic/db", "@mediclinic/logger", "@mediclinic/rbac", "@mediclinic/ui"],
  typedRoutes: true,
  experimental: {
    
 
  }
};

export default nextConfig;
