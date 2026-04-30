import { formatAddress } from "@/lib/format";
import type { ContactInfo } from "@/types/charity";

export interface MapLinks {
  google: string;
  apple: string;
}

function buildGoogleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildAppleMapsUrl(query: string) {
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}

export function buildMapLinks(
  contact: ContactInfo,
  fallbackQuery?: string,
): MapLinks | null {
  const addressQuery = formatAddress(contact);
  if (addressQuery.trim()) {
    return {
      google: buildGoogleMapsUrl(addressQuery),
      apple: buildAppleMapsUrl(addressQuery),
    };
  }

  const fallback = fallbackQuery?.trim() || "";
  if (fallback) {
    return {
      google: buildGoogleMapsUrl(fallback),
      apple: buildAppleMapsUrl(fallback),
    };
  }

  if (contact.latitude !== undefined && contact.longitude !== undefined) {
    const coordinateQuery = `${contact.latitude},${contact.longitude}`;

    return {
      google: buildGoogleMapsUrl(coordinateQuery),
      apple: buildAppleMapsUrl(coordinateQuery),
    };
  }

  return null;
}
