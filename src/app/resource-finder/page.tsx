import type { Metadata } from "next";

import { ResourceFinder } from "@/components/ResourceFinder";
import { categories, charities } from "@/data";
import type { ServiceScale, WayToHelp } from "@/types/charity";

interface ResourceFinderPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Resource Finder",
  description:
    "Find published charity profiles within a selected radius of a covered city or ZIP, then narrow by cause and ways to help.",
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function parseRadius(value: string) {
  const radius = Number(value);
  if (!Number.isFinite(radius) || radius <= 0) {
    return 50;
  }

  return radius;
}

function parseWay(value: string): WayToHelp | "" {
  const allowed = new Set<WayToHelp>([
    "Donate",
    "Volunteer",
    "Goods",
    "Events",
    "Remote",
    "Get Help",
  ]);

  if (allowed.has(value as WayToHelp)) {
    return value as WayToHelp;
  }

  return "";
}

function parseScale(value: string): ServiceScale | "" {
  if (value === "Local" || value === "National" || value === "International") {
    return value;
  }

  return "";
}

function parseBoolean(value: string) {
  return value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "yes";
}

export default async function ResourceFinderPage({
  searchParams,
}: ResourceFinderPageProps) {
  const resolved = await searchParams;

  return (
    <ResourceFinder
      charities={charities}
      categories={categories}
      title="Resource Finder"
      description="Find published organization profiles within a selected radius of a covered city or ZIP. Confirm current services and eligibility directly with each organization."
      initialQuery={firstValue(resolved.q)}
      initialLocation={firstValue(resolved.location)}
      initialRadiusMiles={parseRadius(firstValue(resolved.radius))}
      initialSubcategory={firstValue(resolved.subcategory)}
      initialWayToHelp={parseWay(firstValue(resolved.way) || firstValue(resolved.wayToHelp))}
      initialVerifiedOnly={parseBoolean(firstValue(resolved.verified))}
      initialServiceScale={parseScale(firstValue(resolved.scale))}
      initialPopulationServed={firstValue(resolved.population)}
    />
  );
}
