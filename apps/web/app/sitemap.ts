import type { MetadataRoute } from "next";

const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";

  return publicRoutes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/login" ? 1 : 0.4
  }));
}
