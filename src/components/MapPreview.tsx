import { formatAddress } from "@/lib/format";
import type { ContactInfo } from "@/types/charity";

interface MapPreviewProps {
  charityName: string;
  contact: ContactInfo;
  serviceArea: string;
}

export function MapPreview({ charityName, contact, serviceArea }: MapPreviewProps) {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const address = formatAddress(contact);
  const query = encodeURIComponent(address || `${contact.city}, ${contact.state}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  if (!mapsApiKey) {
    return (
      <section className="space-y-3" aria-label="Map preview">
        <h3 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">
          Location Map
        </h3>
        <div className="dark-panel flex min-h-56 flex-col justify-between p-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--color-text-strong)]">Map preview placeholder</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your environment to load an embedded map.
            </p>
            <p className="text-xs text-[var(--color-text-faint)]">{address || serviceArea}</p>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit border border-[var(--color-border)] px-3 py-2 text-xs font-medium tracking-wide text-[var(--color-text-strong)] uppercase transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
          >
            View on Google Maps
          </a>
        </div>
      </section>
    );
  }

  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${query}`;

  return (
    <section className="space-y-3" aria-label="Map preview">
      <h3 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">
        Location Map
      </h3>
      <div className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <iframe
          title={`${charityName} location`}
          src={embedUrl}
          width="100%"
          height="320"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit border border-[var(--color-border)] px-3 py-2 text-xs font-medium tracking-wide text-[var(--color-text-strong)] uppercase transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
      >
        Open in Google Maps
      </a>
    </section>
  );
}
