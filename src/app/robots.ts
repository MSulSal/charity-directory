import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const sitemap = getAbsoluteUrl("/sitemap.xml");

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap,
  };
}
