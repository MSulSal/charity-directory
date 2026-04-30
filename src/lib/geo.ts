import type { CharityOrganization } from "@/types/charity";

export interface GeoPoint {
  latitude: number;
  longitude: number;
  label: string;
}

export interface CharityWithDistance {
  charity: CharityOrganization;
  distanceMiles: number | null;
}

const knownCities: Array<{ key: string; latitude: number; longitude: number; label: string }> = [
  { key: "memphis, tn", latitude: 35.1495, longitude: -90.049, label: "Memphis, TN" },
  { key: "st. louis, mo", latitude: 38.627, longitude: -90.1994, label: "St. Louis, MO" },
  { key: "chicago, il", latitude: 41.8781, longitude: -87.6298, label: "Chicago, IL" },
  { key: "houston, tx", latitude: 29.7604, longitude: -95.3698, label: "Houston, TX" },
  { key: "denver, co", latitude: 39.7392, longitude: -104.9903, label: "Denver, CO" },
  { key: "atlanta, ga", latitude: 33.749, longitude: -84.388, label: "Atlanta, GA" },
  { key: "boston, ma", latitude: 42.3601, longitude: -71.0589, label: "Boston, MA" },
  { key: "phoenix, az", latitude: 33.4484, longitude: -112.074, label: "Phoenix, AZ" },
  { key: "seattle, wa", latitude: 47.6062, longitude: -122.3321, label: "Seattle, WA" },
  { key: "los angeles, ca", latitude: 34.0522, longitude: -118.2437, label: "Los Angeles, CA" },
  { key: "washington, dc", latitude: 38.9072, longitude: -77.0369, label: "Washington, DC" },
  { key: "new york, ny", latitude: 40.7128, longitude: -74.006, label: "New York, NY" },
  { key: "san francisco, ca", latitude: 37.7749, longitude: -122.4194, label: "San Francisco, CA" },
  { key: "nashville, tn", latitude: 36.1627, longitude: -86.7816, label: "Nashville, TN" },
  { key: "dallas, tx", latitude: 32.7767, longitude: -96.797, label: "Dallas, TX" },
  { key: "miami, fl", latitude: 25.7617, longitude: -80.1918, label: "Miami, FL" },
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseLatLng(query: string): GeoPoint | null {
  const match = query.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);

  if (!match) {
    return null;
  }

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
    label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
  };
}

export function resolveLocationQuery(
  query: string,
  charities: CharityOrganization[],
): GeoPoint | null {
  const normalized = normalize(query);
  if (!normalized) {
    return null;
  }

  const fromLatLng = parseLatLng(query);
  if (fromLatLng) {
    return fromLatLng;
  }

  for (const charity of charities) {
    const { city, state, postalCode, latitude, longitude } = charity.contact;
    if (latitude === undefined || longitude === undefined) {
      continue;
    }

    const cityState = normalize(`${city}, ${state}`);
    const cityOnly = normalize(city);
    const normalizedPostal = postalCode ? normalize(postalCode) : "";
    if (
      cityState.includes(normalized) ||
      normalized.includes(cityState) ||
      cityOnly === normalized ||
      (normalizedPostal && normalizedPostal === normalized)
    ) {
      const label = normalizedPostal && normalizedPostal === normalized
        ? `${city}, ${state} ${postalCode}`
        : `${city}, ${state}`;
      return {
        latitude,
        longitude,
        label,
      };
    }
  }

  const known = knownCities.find(
    (city) => city.key.includes(normalized) || normalized.includes(city.key),
  );

  if (known) {
    return {
      latitude: known.latitude,
      longitude: known.longitude,
      label: known.label,
    };
  }

  return null;
}

export function haversineMiles(start: GeoPoint, end: GeoPoint) {
  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(end.latitude - start.latitude);
  const dLon = toRadians(end.longitude - start.longitude);
  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(end.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

export function withDistanceFrom(
  charities: CharityOrganization[],
  center: GeoPoint | null,
): CharityWithDistance[] {
  return charities.map((charity) => {
    const { latitude, longitude } = charity.contact;

    if (!center || latitude === undefined || longitude === undefined) {
      return { charity, distanceMiles: null };
    }

    return {
      charity,
      distanceMiles: haversineMiles(center, {
        latitude,
        longitude,
        label: charity.name,
      }),
    };
  });
}

export function toRelativeMarkerPosition(
  center: GeoPoint,
  point: GeoPoint,
  radiusMiles: number,
) {
  const milesPerLatDegree = 69;
  const milesPerLngDegree = 69 * Math.cos((center.latitude * Math.PI) / 180);

  const deltaXMiles = (point.longitude - center.longitude) * milesPerLngDegree;
  const deltaYMiles = (point.latitude - center.latitude) * milesPerLatDegree;

  const safeRadius = Math.max(radiusMiles, 1);
  const x = 50 + (deltaXMiles / safeRadius) * 42;
  const y = 50 - (deltaYMiles / safeRadius) * 42;

  return {
    x: Math.min(95, Math.max(5, x)),
    y: Math.min(95, Math.max(5, y)),
  };
}
