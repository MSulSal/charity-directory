import type { Metadata } from "next";

import { CategoryDropdownExplorer } from "@/components/CategoryDropdownExplorer";
import { Hero } from "@/components/Hero";
import { ResourceFinder } from "@/components/ResourceFinder";
import { categories, charities } from "@/data";

export const metadata: Metadata = {
  title: {
    absolute: "Charity Directory - Find Trusted Charities by Cause and Location",
  },
  description:
    "Find trusted charities, nonprofits, donation links, volunteer opportunities, and local help by cause, location, and ways to give.",
};

export default function HomePage() {
  return (
    <>
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
