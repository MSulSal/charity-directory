const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export function getConfiguredSiteUrl() {
  return configuredSiteUrl;
}

export function getAbsoluteUrl(path = "/") {
  if (!configuredSiteUrl) {
    return undefined;
  }

  return new URL(path, `${configuredSiteUrl}/`).toString();
}
