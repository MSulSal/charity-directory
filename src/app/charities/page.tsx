import type { Metadata } from "next";

import { CharityCatalog } from "@/components/CharityCatalog";
import { categories, charities } from "@/data";
import { filtersFromSearchParams } from "@/lib/filters";

interface CharitiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Search Charities",
  description:
    "Search charities and nonprofits by cause, location, trust filters, and ways to help.",
};

export default async function CharitiesPage({
  searchParams,
}: CharitiesPageProps) {
  const resolved = await searchParams;
  const initialFilters = filtersFromSearchParams(resolved);

  return (
    <CharityCatalog
      charities={charities}
      categories={categories}
      initialFilters={initialFilters}
      title="Charity Search Results"
      description="Use the main search flow to explore charities with full profile card details. Filter by subcategory, location, ways to help, trust status, service scope, and population served."
    />
  );
}
