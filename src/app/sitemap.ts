import type { MetadataRoute } from "next";

import { categories, charities } from "@/data";
import { getAbsoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/about",
    "/categories",
    "/charities",
    "/resource-finder",
    "/for-nonprofits",
    "/submit-a-charity",
    "/trust",
    "/privacy",
  ];
  const staticEntries = paths.flatMap((path) => {
    const url = getAbsoluteUrl(path);
    return url ? [{ url, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 }] : [];
  });
  const categoryEntries = categories.flatMap((category) => {
    const url = getAbsoluteUrl(`/categories/${category.slug}`);
    return url ? [{ url, changeFrequency: "weekly" as const, priority: 0.8 }] : [];
  });
  const charityEntries = charities.flatMap((charity) => {
    const url = getAbsoluteUrl(`/charities/${charity.slug}`);
    return url
      ? [{
          url,
          lastModified: new Date(charity.lastVerified),
          changeFrequency: "monthly" as const,
          priority: 0.9,
        }]
      : [];
  });

  return [...staticEntries, ...categoryEntries, ...charityEntries];
}
