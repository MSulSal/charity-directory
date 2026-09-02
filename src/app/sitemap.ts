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
  const urls = [
    ...paths,
    ...categories.map((category) => `/categories/${category.slug}`),
    ...charities.map((charity) => `/charities/${charity.slug}`),
  ];

  return urls.flatMap((path) => {
    const url = getAbsoluteUrl(path);
    return url ? [{ url, lastModified: new Date() }] : [];
  });
}
