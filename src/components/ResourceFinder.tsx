"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  resolveLocationQuery,
  toRelativeMarkerPosition,
  withDistanceFrom,
} from "@/lib/geo";
import type {
  Category,
  CharityOrganization,
  ServiceScale,
  WayToHelp,
} from "@/types/charity";

interface ResourceFinderProps {
  charities: CharityOrganization[];
  categories: Category[];
  title?: string;
  description?: string;
  initialQuery?: string;
  initialLocation?: string;
  initialRadiusMiles?: number;
  initialSubcategory?: string;
  initialWayToHelp?: WayToHelp | "";
  initialVerifiedOnly?: boolean;
  initialServiceScale?: ServiceScale | "";
  initialPopulationServed?: string;
  showOpenPageLink?: boolean;
}

const radiusOptions = [5, 10, 25, 50, 100, 250, 500];

interface MapLatLngLiteral {
  lat: number;
  lng: number;
}

interface GoogleMapOptions {
  center: MapLatLngLiteral;
  zoom: number;
  mapTypeControl: boolean;
  streetViewControl: boolean;
  fullscreenControl: boolean;
}

interface GoogleMapInstance {
  setCenter(center: MapLatLngLiteral): void;
  setZoom(zoom: number): void;
  fitBounds(bounds: GoogleLatLngBoundsInstance): void;
}

interface GoogleMarkerOptions {
  map: GoogleMapInstance;
  position: MapLatLngLiteral;
  title?: string;
  icon?: {
    path: unknown;
    scale: number;
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWeight: number;
  };
}

interface GoogleMarkerInstance {
  setMap(map: GoogleMapInstance | null): void;
  addListener(eventName: string, handler: () => void): void;
}

interface GoogleInfoWindowInstance {
  setContent(content: string): void;
  open(options: {
    map: GoogleMapInstance;
    anchor: GoogleMarkerInstance;
    shouldFocus?: boolean;
  }): void;
}

interface GoogleLatLngBoundsInstance {
  extend(latLng: MapLatLngLiteral): void;
}

interface GoogleMapsNamespace {
  Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMapInstance;
  Marker: new (options: GoogleMarkerOptions) => GoogleMarkerInstance;
  InfoWindow: new () => GoogleInfoWindowInstance;
  LatLngBounds: new () => GoogleLatLngBoundsInstance;
  SymbolPath: {
    CIRCLE: unknown;
  };
}

declare global {
  interface Window {
    google?: {
      maps: GoogleMapsNamespace;
    };
    __charityDirectoryGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
  }
}

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (window.__charityDirectoryGoogleMapsPromise) {
    return window.__charityDirectoryGoogleMapsPromise;
  }

  window.__charityDirectoryGoogleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      "script[data-google-maps='charity-directory']",
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google?.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error("Google Maps API loaded without maps namespace."));
        }
      });
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps script.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "charity-directory";
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps API loaded without maps namespace."));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });

  return window.__charityDirectoryGoogleMapsPromise;
}

function zoomForRadius(radiusMiles: number) {
  if (radiusMiles <= 5) return 12;
  if (radiusMiles <= 10) return 11;
  if (radiusMiles <= 25) return 10;
  if (radiusMiles <= 50) return 9;
  if (radiusMiles <= 100) return 8;
  if (radiusMiles <= 250) return 6;
  return 5;
}

function isVetted(charity: CharityOrganization) {
  return charity.verificationBadges.some(
    (badge) => badge.status === "verified" || badge.status === "listed",
  );
}

function uniq(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildDirectionsUrl(charity: CharityOrganization, originText: string) {
  const params = new URLSearchParams({ api: "1", travelmode: "driving" });

  if (
    charity.contact.latitude !== undefined &&
    charity.contact.longitude !== undefined
  ) {
    params.set(
      "destination",
      `${charity.contact.latitude},${charity.contact.longitude}`,
    );
  } else {
    const address = [
      charity.contact.addressLine1,
      charity.contact.city,
      charity.contact.state,
      charity.contact.postalCode,
      charity.contact.country,
    ]
      .filter(Boolean)
      .join(", ");

    if (address) {
      params.set("destination", address);
    } else {
      return null;
    }
  }

  if (originText.trim()) {
    params.set("origin", originText.trim());
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function ResourceFinder({
  charities,
  categories,
  title = "Resource Finder",
  description = "Find charities near an entered location with radius-based search and filters.",
  initialQuery = "",
  initialLocation = "",
  initialRadiusMiles = 50,
  initialSubcategory = "",
  initialWayToHelp = "",
  initialVerifiedOnly = false,
  initialServiceScale = "",
  initialPopulationServed = "",
  showOpenPageLink = false,
}: ResourceFinderProps) {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [radiusMiles, setRadiusMiles] = useState(initialRadiusMiles);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [wayToHelp, setWayToHelp] = useState<WayToHelp | "">(initialWayToHelp);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
  const [serviceScale, setServiceScale] = useState<ServiceScale | "">(
    initialServiceScale,
  );
  const [populationServed, setPopulationServed] = useState(initialPopulationServed);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<GoogleMapInstance | null>(null);
  const googleMarkersRef = useRef<GoogleMarkerInstance[]>([]);
  const infoWindowRef = useRef<GoogleInfoWindowInstance | null>(null);

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map((category) => [category.slug, category.name] as const),
      ),
    [categories],
  );

  const subcategories = useMemo(
    () => uniq(charities.flatMap((charity) => charity.subcategories)),
    [charities],
  );

  const populations = useMemo(
    () => uniq(charities.flatMap((charity) => charity.populationServed)),
    [charities],
  );

  const waysToHelp = useMemo(
    () => uniq(charities.flatMap((charity) => charity.waysToHelp)) as WayToHelp[],
    [charities],
  );

  const locationCenter = useMemo(
    () => resolveLocationQuery(location, charities),
    [location, charities],
  );

  const withDistance = useMemo(
    () => withDistanceFrom(charities, locationCenter),
    [charities, locationCenter],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const hasLocationText = location.trim().length > 0;

    const results = withDistance.filter(({ charity, distanceMiles }) => {
      if (normalizedQuery) {
        const searchable = [
          charity.name,
          charity.mission,
          charity.serviceArea,
          charity.subcategories.join(" "),
          charity.populationServed.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(normalizedQuery)) {
          return false;
        }
      }

      if (hasLocationText) {
        if (!locationCenter || distanceMiles === null || distanceMiles > radiusMiles) {
          return false;
        }
      }

      if (subcategory && !charity.subcategories.includes(subcategory)) {
        return false;
      }

      if (wayToHelp && !charity.waysToHelp.includes(wayToHelp)) {
        return false;
      }

      if (serviceScale && charity.serviceScale !== serviceScale) {
        return false;
      }

      if (populationServed && !charity.populationServed.includes(populationServed)) {
        return false;
      }

      if (verifiedOnly && !isVetted(charity)) {
        return false;
      }

      return true;
    });

    return results.sort((left, right) => {
      if (left.distanceMiles !== null && right.distanceMiles !== null) {
        return left.distanceMiles - right.distanceMiles;
      }

      if (left.distanceMiles !== null) {
        return -1;
      }

      if (right.distanceMiles !== null) {
        return 1;
      }

      return left.charity.name.localeCompare(right.charity.name);
    });
  }, [
    location,
    locationCenter,
    populationServed,
    query,
    radiusMiles,
    serviceScale,
    subcategory,
    verifiedOnly,
    wayToHelp,
    withDistance,
  ]);

  const mappableResults = useMemo(
    () =>
      filtered.filter(({ charity, distanceMiles }) => {
        return (
          charity.contact.latitude !== undefined &&
          charity.contact.longitude !== undefined &&
          distanceMiles !== null
        );
      }),
    [filtered],
  );

  const fallbackMarkers = useMemo(() => {
    if (!locationCenter) {
      return [] as Array<{ id: string; x: number; y: number; name: string; distance: number }>;
    }

    return mappableResults.slice(0, 40).map(({ charity, distanceMiles }) => {
      const position = toRelativeMarkerPosition(
        locationCenter,
        {
          latitude: charity.contact.latitude as number,
          longitude: charity.contact.longitude as number,
          label: charity.name,
        },
        radiusMiles,
      );

      return {
        id: charity.id,
        x: position.x,
        y: position.y,
        name: charity.name,
        distance: distanceMiles as number,
      };
    });
  }, [locationCenter, mappableResults, radiusMiles]);

  useEffect(() => {
    if (!mapsApiKey || !mapContainerRef.current) {
      return;
    }

    let cancelled = false;

    loadGoogleMaps(mapsApiKey)
      .then((maps) => {
        if (cancelled || !mapContainerRef.current || !maps) {
          return;
        }

        setMapError(null);

        const center = locationCenter
          ? { lat: locationCenter.latitude, lng: locationCenter.longitude }
          : { lat: 39.5, lng: -98.35 };

        if (!googleMapRef.current) {
          googleMapRef.current = new maps.Map(mapContainerRef.current, {
            center,
            zoom: locationCenter ? zoomForRadius(radiusMiles) : 4,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
          infoWindowRef.current = new maps.InfoWindow();
        }

        const map = googleMapRef.current;
        map.setCenter(center);
        map.setZoom(locationCenter ? zoomForRadius(radiusMiles) : 4);

        googleMarkersRef.current.forEach((marker) => marker.setMap(null));
        googleMarkersRef.current = [];

        const bounds = new maps.LatLngBounds();

        if (locationCenter) {
          bounds.extend(center);

          const originMarker = new maps.Marker({
            map,
            position: center,
            title: `Search center: ${locationCenter.label}`,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#E8BE4B",
              fillOpacity: 1,
              strokeColor: "#0D0A12",
              strokeWeight: 1,
            },
          });

          googleMarkersRef.current.push(originMarker);
        }

        mappableResults.slice(0, 80).forEach(({ charity, distanceMiles }) => {
          const marker = new maps.Marker({
            map,
            position: {
              lat: charity.contact.latitude as number,
              lng: charity.contact.longitude as number,
            },
            title: charity.name,
          });

          marker.addListener("click", () => {
            if (!infoWindowRef.current) {
              return;
            }

            const distanceText =
              distanceMiles === null
                ? "Distance unavailable"
                : `${distanceMiles.toFixed(1)} miles away`;

            infoWindowRef.current.setContent(
              `<div style="font-family:Arial,sans-serif;color:#0D0A12;font-size:13px;line-height:1.4;"><strong>${escapeHtml(charity.name)}</strong><br/>${escapeHtml(distanceText)}</div>`,
            );

            infoWindowRef.current.open({ map, anchor: marker, shouldFocus: false });
          });

          googleMarkersRef.current.push(marker);
          bounds.extend({
            lat: charity.contact.latitude as number,
            lng: charity.contact.longitude as number,
          });
        });

        if (locationCenter && mappableResults.length > 0) {
          map.fitBounds(bounds);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMapError(
            "Google Maps failed to load. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and key restrictions.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    locationCenter,
    mappableResults,
    mapsApiKey,
    radiusMiles,
  ]);

  function resetFilters() {
    setQuery(initialQuery);
    setLocation(initialLocation);
    setRadiusMiles(initialRadiusMiles);
    setSubcategory(initialSubcategory);
    setWayToHelp(initialWayToHelp);
    setVerifiedOnly(initialVerifiedOnly);
    setServiceScale(initialServiceScale);
    setPopulationServed(initialPopulationServed);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
      <header className="space-y-3">
        <h2 className="text-3xl font-semibold leading-tight text-[var(--color-text-strong)] sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-4xl text-sm leading-7 text-[var(--color-text-muted)]">
          {description}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="dark-panel space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, state, or ZIP"
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
              />
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Radius</span>
              <select
                value={radiusMiles}
                onChange={(event) => setRadiusMiles(Number(event.target.value))}
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                {radiusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} miles
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Keyword</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="food bank, legal aid, youth"
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
              />
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Subcategory</span>
              <select
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                <option value="">All subcategories</option>
                {subcategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Ways to help</span>
              <select
                value={wayToHelp}
                onChange={(event) => setWayToHelp(event.target.value as WayToHelp | "")}
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                <option value="">All ways</option>
                {waysToHelp.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Service scope</span>
              <select
                value={serviceScale}
                onChange={(event) =>
                  setServiceScale(event.target.value as ServiceScale | "")
                }
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                <option value="">All scopes</option>
                <option value="Local">Local</option>
                <option value="National">National</option>
                <option value="International">International</option>
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2 lg:col-span-1">
              <span className="mb-2 block uppercase tracking-wide">Population served</span>
              <select
                value={populationServed}
                onChange={(event) => setPopulationServed(event.target.value)}
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                <option value="">All populations</option>
                {populations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-soft)] pt-3">
            <label className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="h-4 w-4 border-[var(--color-border)] bg-[rgb(13_10_18/75%)]"
              />
              Verified/listed only
            </label>

            <div className="flex items-center gap-3">
              <p className="text-xs text-[var(--color-text-faint)]">
                {filtered.length} results
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-text-strong)]"
              >
                Reset
              </button>
            </div>
          </div>

          {showOpenPageLink ? (
            <div>
              <Link
                href="/resource-finder"
                className="text-xs tracking-wide text-[var(--color-text-muted)] uppercase underline underline-offset-4 decoration-[var(--color-border)] hover:text-[var(--color-soft-amethyst)]"
              >
                Open full resource finder page
              </Link>
            </div>
          ) : null}
        </div>

        <div className="dark-panel space-y-3 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-[var(--color-text-strong)]">Map results</h3>
            <p className="text-xs text-[var(--color-text-faint)]">
              {locationCenter
                ? `${locationCenter.label} • ${radiusMiles} mi radius`
                : location.trim()
                  ? "Location not recognized"
                  : "Enter a location (city/state or ZIP) to activate radius search"}
            </p>
          </div>

          {mapsApiKey ? (
            <div className="relative h-64 overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <div ref={mapContainerRef} className="h-full w-full" />
              {mapError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgb(13_10_18/85%)] px-6 text-center text-sm text-[var(--color-text-faint)]">
                  {mapError}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative h-64 overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(180deg,#171125_0%,#100c19_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_28%,rgba(140,107,196,0.2)_0%,rgba(140,107,196,0)_58%)]" />
              <div className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border-soft)]" />
              <div className="absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border-soft)]" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-saffron)]" />

              {locationCenter
                ? fallbackMarkers.map((marker) => (
                    <div
                      key={marker.id}
                      title={`${marker.name} (${marker.distance.toFixed(1)} mi)`}
                      className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-text-strong)] bg-[var(--color-soft-amethyst)]"
                      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                    />
                  ))
                : null}

              {!locationCenter ? (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-[var(--color-text-faint)]">
                  {location.trim()
                    ? "No location match found yet. Try city/state or ZIP."
                    : "Set a location to see nearby charities plotted on the map."}
                </div>
              ) : null}

              <div className="absolute bottom-2 right-2 rounded border border-[var(--color-border)] bg-[rgb(13_10_18/85%)] px-2 py-1 text-[10px] text-[var(--color-text-faint)]">
                Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for live Google map pins
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dark-panel space-y-4 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-[var(--color-text-strong)]">
            Matching organizations
          </h3>
          <p className="text-xs text-[var(--color-text-faint)]">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No resources found with the current location, radius, and filter settings.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border-soft)] border border-[var(--color-border)]">
            {filtered.slice(0, 80).map(({ charity, distanceMiles }) => {
              const directionsUrl = buildDirectionsUrl(charity, location);

              return (
                <li key={charity.id} className="space-y-2 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link
                      href={`/charities/${charity.slug}`}
                      className="text-sm font-semibold text-[var(--color-text-strong)] transition hover:text-[var(--color-soft-amethyst)]"
                    >
                      {charity.name}
                    </Link>
                    <p className="text-xs text-[var(--color-text-faint)]">
                      {distanceMiles === null
                        ? "Distance unavailable"
                        : `${distanceMiles.toFixed(1)} miles away`}
                    </p>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)]">
                    {categoryMap.get(charity.categorySlug) ?? "Uncategorized"} •{" "}
                    {[charity.contact.city, charity.contact.state].filter(Boolean).join(", ")} •{" "}
                    {charity.waysToHelp.join(", ")}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
                    <Link
                      href={`/charities/${charity.slug}`}
                      className="underline underline-offset-2 decoration-[var(--color-border)] transition hover:text-[var(--color-soft-amethyst)]"
                    >
                      View profile
                    </Link>
                    {charity.links.website ? (
                      <a
                        href={charity.links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 decoration-[var(--color-border)] transition hover:text-[var(--color-soft-amethyst)]"
                      >
                        Website
                      </a>
                    ) : null}
                    {directionsUrl ? (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 decoration-[var(--color-border)] transition hover:text-[var(--color-soft-amethyst)]"
                      >
                        Directions
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
