const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

// Vercel currently designates the www hostname as this domain's production URL.
const canonicalSiteUrl =
  configuredSiteUrl === "https://conradscharities.org"
    ? "https://www.conradscharities.org"
    : configuredSiteUrl;

export function getConfiguredSiteUrl() {
  return canonicalSiteUrl;
}

export function getAbsoluteUrl(path = "/") {
  if (!canonicalSiteUrl) {
    return undefined;
  }

  return new URL(path, `${canonicalSiteUrl}/`).toString();
}
