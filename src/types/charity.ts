export type WayToHelp =
  | "Donate"
  | "Volunteer"
  | "Goods"
  | "Events"
  | "Remote"
  | "Get Help";

export type ServiceScale = "Local" | "National" | "International";

export type VerificationStatus =
  | "verified"
  | "listed"
  | "self-reported"
  | "pending";

export interface Category {
  slug: string;
  name: string;
  shortDescription: string;
  subcategories: string[];
  iconLabel: string;
  searchIntent: string[];
}

export interface VerificationBadge {
  source: string;
  label: string;
  status: VerificationStatus;
  url?: string;
  updatedAt?: string;
  note?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  addressLine1?: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
  country?: string;
}

export interface CharityLinks {
  website?: string;
  donate?: string;
  donationFaq?: string;
  volunteer?: string;
  form990?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
  youtube?: string;
}

export interface CharityOrganization {
  id: string;
  slug: string;
  name: string;
  mission: string;
  sampleData: boolean;
  categorySlug: string;
  subcategories: string[];
  populationServed: string[];
  serviceScale: ServiceScale;
  serviceArea: string;
  contact: ContactInfo;
  links: CharityLinks;
  social: SocialLinks;
  waysToHelp: WayToHelp[];
  goodsDonationInfo?: string;
  verificationBadges: VerificationBadge[];
  ein: string;
  status501c3: string;
  lastVerified: string;
  notes?: string;
}

export interface CharityFilters {
  query: string;
  location: string;
  subcategory: string;
  wayToHelp: WayToHelp | "";
  verifiedOnly: boolean;
  serviceScale: ServiceScale | "";
  populationServed: string;
}
