import { categories } from "@/data/categories";
import { charities } from "@/data/charities";
import type { CharityOrganization, WayToHelp } from "@/types/charity";

export { categories, charities };

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCharityBySlug(slug: string) {
  return charities.find((charity) => charity.slug === slug);
}

export function getCharitiesByCategory(slug: string) {
  return charities.filter((charity) => charity.categorySlug === slug);
}

export function getRelatedCharities(
  charity: CharityOrganization,
  limit = 3,
): CharityOrganization[] {
  return charities
    .filter(
      (candidate) =>
        candidate.slug !== charity.slug &&
        (candidate.categorySlug === charity.categorySlug ||
          candidate.subcategories.some((subcategory) =>
            charity.subcategories.includes(subcategory),
          )),
    )
    .slice(0, limit);
}

export function getUniqueSubcategories(pool = charities) {
  return Array.from(new Set(pool.flatMap((charity) => charity.subcategories))).sort();
}

export function getUniquePopulationServed(pool = charities) {
  return Array.from(
    new Set(pool.flatMap((charity) => charity.populationServed)),
  ).sort();
}

export function getUniqueWaysToHelp(pool = charities): WayToHelp[] {
  return Array.from(new Set(pool.flatMap((charity) => charity.waysToHelp))).sort(
    (left, right) => left.localeCompare(right),
  ) as WayToHelp[];
}
