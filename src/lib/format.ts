import type { ContactInfo } from "@/types/charity";

export function formatLocation(contact: ContactInfo) {
  return [contact.city, contact.state, contact.country].filter(Boolean).join(", ");
}

export function formatAddress(contact: ContactInfo) {
  const line1 = contact.addressLine1 ? `${contact.addressLine1}, ` : "";
  const cityState = [contact.city, contact.state].filter(Boolean).join(", ");
  const postal = contact.postalCode ? ` ${contact.postalCode}` : "";
  const country = contact.country ? `, ${contact.country}` : "";
  return `${line1}${cityState}${postal}${country}`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
