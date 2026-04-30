import type {
  CharityFilters,
  CharityOrganization,
  ServiceScale,
  WayToHelp,
} from "@/types/charity";

export const defaultCharityFilters: CharityFilters = {
  query: "",
  location: "",
  subcategory: "",
  wayToHelp: "",
  verifiedOnly: false,
  serviceScale: "",
  populationServed: "",
};

export function isVettedCharity(charity: CharityOrganization) {
  return charity.verificationBadges.some(
    (badge) => badge.status === "verified" || badge.status === "listed",
  );
}

export function filterCharities(
  charities: CharityOrganization[],
  filters: CharityFilters,
): CharityOrganization[] {
  const query = filters.query.trim().toLowerCase();
  const location = filters.location.trim().toLowerCase();

  return charities.filter((charity) => {
    if (query) {
      const searchable = [
        charity.name,
        charity.mission,
        charity.serviceArea,
        charity.subcategories.join(" "),
        charity.populationServed.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      if (!searchable.includes(query)) {
        return false;
      }
    }

    if (location) {
      const locationBlob = [
        charity.serviceArea,
        charity.contact.city,
        charity.contact.state,
        charity.contact.postalCode,
        charity.contact.country,
      ]
        .join(" ")
        .toLowerCase();

      if (!locationBlob.includes(location)) {
        return false;
      }
    }

    if (filters.subcategory && !charity.subcategories.includes(filters.subcategory)) {
      return false;
    }

    if (filters.wayToHelp && !charity.waysToHelp.includes(filters.wayToHelp)) {
      return false;
    }

    if (filters.verifiedOnly && !isVettedCharity(charity)) {
      return false;
    }

    if (filters.serviceScale && charity.serviceScale !== filters.serviceScale) {
      return false;
    }

    if (
      filters.populationServed &&
      !charity.populationServed.includes(filters.populationServed)
    ) {
      return false;
    }

    return true;
  });
}

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseBoolean(value: string | undefined) {
  return value === "1" || value === "true";
}

export function filtersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): CharityFilters {
  const wayParam = firstValue(searchParams.wayToHelp) || firstValue(searchParams.way);

  return {
    query: firstValue(searchParams.q) || "",
    location: firstValue(searchParams.location) || "",
    subcategory: firstValue(searchParams.subcategory) || "",
    wayToHelp: (wayParam as WayToHelp | "") || "",
    verifiedOnly: parseBoolean(firstValue(searchParams.verified)),
    serviceScale: (firstValue(searchParams.scale) as ServiceScale | "") || "",
    populationServed: firstValue(searchParams.population) || "",
  };
}
