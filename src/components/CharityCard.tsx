import Link from "next/link";

import { formatDate, formatLocation } from "@/lib/format";
import type { CharityOrganization } from "@/types/charity";

interface CharityCardProps {
  charity: CharityOrganization;
  categoryName: string;
}

function ExternalLink({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return <span className="text-[var(--color-text-faint)]">{label}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-b border-[var(--color-border)] pb-0.5 transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
    >
      {label}
    </a>
  );
}

export function CharityCard({ charity, categoryName }: CharityCardProps) {
  return (
    <article className="dark-panel flex h-full flex-col gap-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs tracking-[0.15em] text-[var(--color-text-faint)] uppercase">Sample profile</p>
          <h3 className="font-semibold text-2xl leading-tight text-[var(--color-text-strong)]">
            <Link
              href={`/charities/${charity.slug}`}
              className="transition hover:text-[var(--color-soft-amethyst)]"
            >
              {charity.name}
            </Link>
          </h3>
          <p className="text-xs text-[var(--color-text-faint)]">
            {categoryName} / {charity.subcategories.join(" | ")}
          </p>
        </div>

        <span className="border border-[var(--color-border)] bg-[rgb(13_10_18/65%)] px-2 py-1 text-[11px] tracking-wide text-[var(--color-text-faint)] uppercase">
          Last verified {formatDate(charity.lastVerified)}
        </span>
      </div>

      <p className="text-sm leading-7 text-[var(--color-text-muted)]">{charity.mission}</p>

      <dl className="grid gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Location</dt>
          <dd>{formatLocation(charity.contact)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Service area</dt>
          <dd>{charity.serviceArea}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Contact</dt>
          <dd>{charity.contact.phone || charity.contact.email || "Contact field pending"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Ways to help</dt>
          <dd>{charity.waysToHelp.join(", ")}</dd>
        </div>
      </dl>

      <div className="grid gap-2 text-xs text-[var(--color-text-muted)] sm:grid-cols-2">
        <ExternalLink href={charity.links.donate} label="Donation link" />
        <ExternalLink href={charity.links.donationFaq} label="Donation FAQ" />
        <ExternalLink href={charity.links.website} label="Website" />
        <ExternalLink href={charity.links.volunteer} label="Volunteer" />
      </div>

      <div className="mt-auto border-t border-[var(--color-border-soft)] pt-4 text-xs text-[var(--color-text-faint)]">
        {charity.verificationBadges.map((badge) => badge.source).join(" | ")}
      </div>
    </article>
  );
}
