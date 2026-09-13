import { getAbsoluteUrl, getConfiguredSiteUrl } from "@/lib/site";
import type { Category, CharityOrganization } from "@/types/charity";

export const SITE_NAME = "Conrad's Charities";
export const SITE_DESCRIPTION =
  "Find source-linked charities, nonprofit profiles, donation links, volunteer opportunities, and local help by cause and location.";

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
    addressCountry: charity.contact.country,
  });
  const geo =
    charity.contact.latitude !== undefined && charity.contact.longitude !== undefined
      ? {
          "@type": "GeoCoordinates",
          latitude: charity.contact.latitude,
          longitude: charity.contact.longitude,
        }
      : undefined;
  const sameAs = Object.values(charity.social).filter(Boolean);

  return withoutEmptyValues({
    "@context": "https://schema.org",
    "@type": ["Organization", "NGO"],
    name: charity.name,
    description: charity.mission,
    url,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    address: Object.keys(address).length > 1 ? address : undefined,
    geo,
    telephone: charity.contact.phone,
    email: charity.contact.email,
    taxID: charity.ein,
  });
}
