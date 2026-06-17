import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@mediclinic/db"],
  typedRoutes: false,
  serverExternalPackages: ["bcryptjs"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "radix-ui",
      "@base-ui/react",
      "react-hot-toast",
      "recharts",
    ],
    scrollRestoration: true,
  },
};

export default nextConfig;
