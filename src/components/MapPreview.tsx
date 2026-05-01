"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useResolvedMapStyle } from "@/hooks/useResolvedMapStyle";
import { useIsIOSMobile } from "@/hooks/useIsIOSMobile";
import { formatAddress } from "@/lib/format";
import { buildMapLinks } from "@/lib/mapLinks";
import { getLeafletTileConfig } from "@/lib/mapTheme";
import type { ContactInfo } from "@/types/charity";

interface MapPreviewProps {
  charityName: string;
  contact: ContactInfo;
  serviceArea: string;
}

export function MapPreview({ charityName, contact, serviceArea }: MapPreviewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const tileLayerRef = useRef<import("leaflet").TileLayer | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const isIOSMobile = useIsIOSMobile();
  const { resolvedStyle: resolvedMapStyle } = useResolvedMapStyle();

  const address = formatAddress(contact);
  const mapLinks = useMemo(
    () => buildMapLinks(contact, serviceArea),
    [contact, serviceArea],
  );

  const coordinates = useMemo(() => {
    if (contact.latitude === undefined || contact.longitude === undefined) {
      return null;
    }

    return {
      latitude: contact.latitude,
      longitude: contact.longitude,
    };
  }, [contact.latitude, contact.longitude]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    let cancelled = false;

    import("leaflet")
      .then((L) => {
        if (cancelled || !mapContainerRef.current) {
          return;
        }

        leafletRef.current = L;
        setMapError(null);

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
        });

        map.setView([39.5, -98.35], 4);

        mapRef.current = map;
        markerLayerRef.current = L.layerGroup().addTo(map);
      })
      .catch(() => {
        if (!cancelled) {
          setMapError("Leaflet map failed to load. Refresh and try again.");
        }
      });

    return () => {
      cancelled = true;
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
        tileLayerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerLayerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;

    if (!L || !map) {
      return;
    }

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    const tileConfig = getLeafletTileConfig(resolvedMapStyle);
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);
  }, [resolvedMapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    const L = leafletRef.current;

    if (!map || !markerLayer || !L) {
      return;
    }

    markerLayer.clearLayers();

    if (!coordinates) {
      map.setView([39.5, -98.35], 4);
      return;
    }

    const charityLatLng = L.latLng(coordinates.latitude, coordinates.longitude);

    map.setView(charityLatLng, 12);

    L.circleMarker(charityLatLng, {
      radius: 7,
      color: "#0D0A12",
      weight: 1,
      fillColor: "#E8BE4B",
      fillOpacity: 1,
    })
      .addTo(markerLayer)
      .bindTooltip(charityName);
  }, [charityName, coordinates]);

  return (
    <section className="space-y-3" aria-label="Map preview">
      <h3 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">
        Location Map
      </h3>
      <div className="relative overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <div ref={mapContainerRef} className="h-80 w-full" />
        {!coordinates ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--color-map-overlay-soft)] px-6 text-center text-sm text-[var(--color-text-faint)]">
            Exact coordinates unavailable. Map is centered to the U.S. by default.
          </div>
        ) : null}
        {mapError ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--color-map-overlay-strong)] px-6 text-center text-sm text-[var(--color-text-faint)]">
            {mapError}
          </div>
        ) : null}
      </div>
      <p className="text-xs text-[var(--color-text-faint)]">{address || serviceArea}</p>
      {mapLinks && isIOSMobile ? (
        <div className="flex flex-wrap gap-2">
          <a
            href={mapLinks.apple}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit border border-[var(--color-border)] px-3 py-2 text-xs font-medium tracking-wide text-[var(--color-text-strong)] uppercase transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
          >
            Open in Apple Maps
          </a>
          <a
            href={mapLinks.google}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit border border-[var(--color-border)] px-3 py-2 text-xs font-medium tracking-wide text-[var(--color-text-strong)] uppercase transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
          >
            Open in Google Maps
          </a>
        </div>
      ) : mapLinks ? (
        <a
          href={mapLinks.google}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit border border-[var(--color-border)] px-3 py-2 text-xs font-medium tracking-wide text-[var(--color-text-strong)] uppercase transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
        >
          View on Google Maps
        </a>
      ) : null}
    </section>
  );
}
