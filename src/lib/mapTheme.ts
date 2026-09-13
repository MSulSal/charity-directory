interface LeafletTileConfig {
  url: string;
  attribution: string;
  maxZoom: number;
}

const OPEN_STREET_MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function getLeafletTileConfig(): LeafletTileConfig {
  return {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: OPEN_STREET_MAP_ATTRIBUTION,
    maxZoom: 19,
  };
}
