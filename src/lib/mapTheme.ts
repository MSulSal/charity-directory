export const MAP_STYLE_STORAGE_KEY = "charity-directory-map-style";

export const mapStylePreferences = ["auto", "day", "night"] as const;

export type MapStylePreference = (typeof mapStylePreferences)[number];
export type ResolvedMapStyle = Exclude<MapStylePreference, "auto">;

export function normalizeMapStylePreference(
  value: string | null | undefined,
): MapStylePreference {
  if (value === "day" || value === "night" || value === "auto") {
    return value;
  }

  return "auto";
}

export function resolveMapStylePreference(
  preference: MapStylePreference,
  now: Date = new Date(),
): ResolvedMapStyle {
  if (preference === "day" || preference === "night") {
    return preference;
  }

  const hour = now.getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

interface LeafletTileConfig {
  url: string;
  attribution: string;
  subdomains: string;
  maxZoom: number;
}

const SHARED_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function getLeafletTileConfig(style: ResolvedMapStyle): LeafletTileConfig {
  if (style === "night") {
    return {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: SHARED_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 20,
    };
  }

  return {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: SHARED_ATTRIBUTION,
    subdomains: "abcd",
    maxZoom: 20,
  };
}

