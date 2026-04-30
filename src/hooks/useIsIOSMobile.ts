"use client";

import { useEffect, useState } from "react";

function detectIsIOSMobile() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent || "";
  const platform = window.navigator.platform || "";
  const maxTouchPoints = window.navigator.maxTouchPoints || 0;
  const isIOSPlatform =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1);
  const isMobileViewport = window.matchMedia("(max-width: 1023px)").matches;

  return isIOSPlatform && isMobileViewport;
}

export function useIsIOSMobile() {
  const [isIOSMobile, setIsIOSMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const update = () => {
      setIsIOSMobile(detectIsIOSMobile());
    };

    update();

    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isIOSMobile;
}
