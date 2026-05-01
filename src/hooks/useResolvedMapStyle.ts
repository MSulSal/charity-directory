"use client";

import { useEffect, useMemo, useState } from "react";

import {
  MAP_STYLE_STORAGE_KEY,
  normalizeMapStylePreference,
  resolveMapStylePreference,
  type MapStylePreference,
} from "@/lib/mapTheme";

export function useResolvedMapStyle() {
  const [preference, setPreference] = useState<MapStylePreference>(() => {
    if (typeof window === "undefined") {
      return "auto";
    }

    return normalizeMapStylePreference(localStorage.getItem(MAP_STYLE_STORAGE_KEY));
  });
  const [clockTick, setClockTick] = useState(() => Date.now());

  useEffect(() => {
    if (preference !== "auto") {
      return;
    }

    const timerId = window.setInterval(() => {
      setClockTick(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [preference]);

  const resolvedStyle = useMemo(
    () => resolveMapStylePreference(preference, new Date(clockTick)),
    [clockTick, preference],
  );

  function updatePreference(nextPreference: MapStylePreference) {
    setPreference(nextPreference);
    if (typeof window !== "undefined") {
      localStorage.setItem(MAP_STYLE_STORAGE_KEY, nextPreference);
    }
  }

  return {
    preference,
    resolvedStyle,
    setPreference: updatePreference,
  };
}

