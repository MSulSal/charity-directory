"use client";

import { useIsIOSMobile } from "@/hooks/useIsIOSMobile";

interface MapLinkOptionsProps {
  googleHref?: string;
  appleHref?: string;
  anchorClassName: string;
  googleOnlyLabel?: string;
  googleLabel?: string;
  appleLabel?: string;
}

function ExternalMapLink({
  href,
  label,
  anchorClassName,
}: {
  href: string;
  label: string;
  anchorClassName: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={anchorClassName}
    >
      {label}
    </a>
  );
}

export function MapLinkOptions({
  googleHref,
  appleHref,
  anchorClassName,
  googleOnlyLabel = "View on Google Maps",
  googleLabel = "Google Maps",
  appleLabel = "Apple Maps",
}: MapLinkOptionsProps) {
  const isIOSMobile = useIsIOSMobile();

  if (isIOSMobile && appleHref && googleHref) {
    return (
      <>
        <ExternalMapLink
          href={appleHref}
          label={appleLabel}
          anchorClassName={anchorClassName}
        />
        <ExternalMapLink
          href={googleHref}
          label={googleLabel}
          anchorClassName={anchorClassName}
        />
      </>
    );
  }

  if (googleHref) {
    return (
      <ExternalMapLink
        href={googleHref}
        label={googleOnlyLabel}
        anchorClassName={anchorClassName}
      />
    );
  }

  if (appleHref) {
    return (
      <ExternalMapLink
        href={appleHref}
        label={appleLabel}
        anchorClassName={anchorClassName}
      />
    );
  }

  return null;
}
