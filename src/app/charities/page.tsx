import type { Metadata } from "next";

import { CharityCatalog } from "@/components/CharityCatalog";
import { categories, charities } from "@/data";
import { filtersFromSearchParams } from "@/lib/filters";

interface CharitiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Charity Listings",
  description:
    "Find local nonprofits, donation opportunities, and volunteer options with filters for cause, location, and ways to help.",
};

export default async function CharitiesPage({ searchParams }: CharitiesPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialFilters = filtersFromSearchParams(resolvedSearchParams);

  return (
    <CharityCatalog
      charities={charities}
      categories={categories}
      initialFilters={initialFilters}
      title="Browse Charity Listings"
      description="Search and filter sample records by subcategory, location, ways to help, trust field status, service scale, and population served."
    />
  );
}
