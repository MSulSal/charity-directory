import { redirect } from "next/navigation";

interface LegacyCharitiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

export default async function LegacyCharitiesPage({
  searchParams,
}: LegacyCharitiesPageProps) {
  const resolved = await searchParams;
  const params = new URLSearchParams();

  const query = firstValue(resolved.q);
  const location = firstValue(resolved.location);
  const way = firstValue(resolved.way) || firstValue(resolved.wayToHelp);
  const verified = firstValue(resolved.verified);
  const radius = firstValue(resolved.radius);
  const subcategory = firstValue(resolved.subcategory);
  const scale = firstValue(resolved.scale);
  const population = firstValue(resolved.population);

  if (query) {
    params.set("q", query);
  }

  if (location) {
    params.set("location", location);
  }

  if (way) {
    params.set("way", way);
  }

  if (verified) {
    params.set("verified", verified);
  }

  if (radius) {
    params.set("radius", radius);
  }

  if (subcategory) {
    params.set("subcategory", subcategory);
  }

  if (scale) {
    params.set("scale", scale);
  }

  if (population) {
    params.set("population", population);
  }

  const queryString = params.toString();
  redirect(queryString ? `/resource-finder?${queryString}` : "/resource-finder");
}
