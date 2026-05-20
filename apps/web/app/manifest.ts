import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MediClinic Pro",
    short_name: "MediClinic",
    description: "Enterprise clinic management for secure USA healthcare workflows.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5fbfb",
    theme_color: "#178f84",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
