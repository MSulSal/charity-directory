import { getAbsoluteUrl, getConfiguredSiteUrl } from "@/lib/site";
import type { Category, CharityOrganization } from "@/types/charity";

export const SITE_NAME = "Conrad's Charities";
export const SITE_DESCRIPTION =
  "Find local charities, food banks, nonprofit services, donation links, volunteer opportunities, and help by cause, location, and ways to give.";

function withoutEmptyValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== ""),
  );
}

export function getWebSiteSchema() {
  const siteUrl = getConfiguredSiteUrl();
  if (!siteUrl) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_NAME,
    alternateName: "ConradsCharities.org",
    url: siteUrl,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/charities?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getDirectoryOrganizationSchema() {
  const siteUrl = getConfiguredSiteUrl();
  if (!siteUrl) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: "ConradsCharities.org",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description: SITE_DESCRIPTION,
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  const entries = items
    .map((item) => ({ name: item.name, url: getAbsoluteUrl(item.path) }))
    .filter((item) => item.url);

  if (entries.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getCategoryCollectionSchema(category: Category) {
  const url = getAbsoluteUrl(`/categories/${category.slug}`);
  const siteUrl = getConfiguredSiteUrl();
  if (!url || !siteUrl) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Charities`,
    description: category.shortDescription,
    url,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: category.name,
  };
}

export function getLocationCollectionSchema({
  city,
  state,
  path,
  resourceCount,
}: {
  city: string;
  state: string;
  path: string;
  resourceCount: number;
}) {
  const url = getAbsoluteUrl(path);
  const siteUrl = getConfiguredSiteUrl();
  if (!url || !siteUrl) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${city}, ${state} Local Resources`,
    description: `Source-linked local help in ${city}, ${state}, including ${resourceCount} published resource profiles.`,
    url,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@type": "City", name: city, address: { "@type": "PostalAddress", addressRegion: state } },
  };
}

export function getCharitySchema(charity: CharityOrganization) {
  const url = getAbsoluteUrl(`/charities/${charity.slug}`);
  if (!url) {
    return null;
  }

  const address = withoutEmptyValues({
    "@type": "PostalAddress",
    streetAddress: charity.contact.addressLine1,
    addressLocality: charity.contact.city,
    addressRegion: charity.contact.state,
    postalCode: charity.contact.postalCode,
    addressCountry: charity.contact.country === "USA" ? "US" : charity.contact.country,
  });
  const geo =
    charity.contact.latitude !== undefined && charity.contact.longitude !== undefined
      ? {
          "@type": "GeoCoordinates",
          latitude: charity.contact.latitude,
          longitude: charity.contact.longitude,
        }
      : undefined;
  const sameAs = [charity.links.website, ...Object.values(charity.social)].filter(Boolean);
  const taxId = /^\d{2}-?\d{7}$/.test(charity.ein) ? charity.ein : undefined;

  return withoutEmptyValues({
    "@context": "https://schema.org",
    "@type": ["Organization", "NGO"],
    "@id": `${url}#organization`,
    name: charity.name,
    description: charity.mission,
    url: charity.links.website || url,
    mainEntityOfPage: url,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    address: Object.keys(address).length > 1 ? address : undefined,
    geo,
    telephone: charity.contact.phone,
    email: charity.contact.email,
    taxID: taxId,
  });
}
