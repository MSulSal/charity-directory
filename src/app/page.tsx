import type { Metadata } from "next";

import { CategoryDropdownExplorer } from "@/components/CategoryDropdownExplorer";
import { Hero } from "@/components/Hero";
import { ResourceFinder } from "@/components/ResourceFinder";
import { JsonLd } from "@/components/seo/JsonLd";
import { categories, charities } from "@/data";
import { SITE_DESCRIPTION, SITE_NAME, getWebSiteSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Conrad's Charities | Find Charities by Cause and Location",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: SITE_NAME, description: SITE_DESCRIPTION, url: "/" },
};

export default function HomePage() {
  const websiteSchema = getWebSiteSchema();

  return (
    <>
      {websiteSchema ? <JsonLd data={websiteSchema} /> : null}
      <Hero />

      <ResourceFinder
        charities={charities}
        categories={categories}
        title="Resource Finder"
        description="Enter a covered city or ZIP, set a radius, and filter published organizations by ways to help and service area."
        showOpenPageLink
      />

      <CategoryDropdownExplorer
        categories={categories}
        charities={charities}
        title="Charities"
        description="Browse charities by major cause area, then open each charity name to view full details."
      />
    </>
  );
}
