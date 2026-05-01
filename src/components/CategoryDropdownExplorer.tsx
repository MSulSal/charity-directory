import Link from "next/link";

import { MapLinkOptions } from "@/components/MapLinkOptions";
import { formatAddress, formatDate } from "@/lib/format";
import { buildMapLinks } from "@/lib/mapLinks";
import type { Category, CharityOrganization, VerificationStatus } from "@/types/charity";

interface CategoryDropdownExplorerProps {
  categories: Category[];
  charities: CharityOrganization[];
  title?: string;
  description?: string;
}

const statusStyles: Record<VerificationStatus, string> = {
  verified: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  listed: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  "self-reported": "border-amber-500/40 bg-amber-500/15 text-amber-300",
  pending: "border-[var(--color-border)] bg-[var(--color-field-bg)] text-[var(--color-text-faint)]",
};

function statusLabel(status: VerificationStatus) {
  if (status === "self-reported") {
    return "Self-reported";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function ActionLink({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return <span className="text-[var(--color-text-faint)]">{label}: not listed</span>;
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

function CharityExpandedCard({
  charity,
  categoryName,
}: {
  charity: CharityOrganization;
  categoryName: string;
}) {
  const mapLinks = buildMapLinks(charity.contact, charity.name);

  return (
    <article className="dark-panel-soft space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] tracking-[0.14em] text-[var(--color-text-faint)] uppercase">
            {charity.sampleData ? "Sample charity record" : "Organization record"}
          </p>
          <h4 className="text-xl font-semibold text-[var(--color-text-strong)]">
            <Link
              href={`/charities/${charity.slug}`}
              className="transition hover:text-[var(--color-soft-amethyst)]"
            >
              {charity.name}
            </Link>
          </h4>
          <p className="text-xs text-[var(--color-text-faint)]">
            {categoryName} / {charity.subcategories.join(" | ")}
          </p>
        </div>

        <span className="border border-[var(--color-border)] px-2 py-1 text-[11px] tracking-wide text-[var(--color-text-faint)] uppercase">
          Last verified {formatDate(charity.lastVerified)}
        </span>
      </div>

      <p className="text-sm leading-7 text-[var(--color-text-muted)]">{charity.mission}</p>

      <dl className="grid gap-3 text-xs text-[var(--color-text-muted)] sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Location</dt>
          <dd>{[charity.contact.city, charity.contact.state].filter(Boolean).join(", ")}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Service area</dt>
          <dd>{charity.serviceArea}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Populations served</dt>
          <dd>{charity.populationServed.join(" | ")}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Contact</dt>
          <dd>{charity.contact.phone || charity.contact.email || "Not listed"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Address</dt>
          <dd>{formatAddress(charity.contact) || "Service area only"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Ways to help</dt>
          <dd>{charity.waysToHelp.join(", ")}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">EIN</dt>
          <dd>{charity.ein}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">501(c)(3) status</dt>
          <dd>{charity.status501c3}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-text-strong)]">Goods / in-kind</dt>
          <dd>{charity.goodsDonationInfo || "Not listed"}</dd>
        </div>
      </dl>

      <div className="grid gap-2 text-xs text-[var(--color-text-muted)] sm:grid-cols-2 lg:grid-cols-3">
        <ActionLink href={charity.links.donate} label="Donation link" />
        <ActionLink href={charity.links.donationFaq} label="Donation FAQ" />
        <ActionLink href={charity.links.website} label="Website" />
        <ActionLink href={charity.links.volunteer} label="Volunteer" />
        <ActionLink href={charity.links.form990} label="Form 990" />
        <MapLinkOptions
          googleHref={mapLinks?.google}
          appleHref={mapLinks?.apple}
          anchorClassName="border-b border-[var(--color-border)] pb-0.5 transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
        />
      </div>

      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.12em] text-[var(--color-text-faint)] uppercase">
          Verification fields
        </p>
        <ul className="flex flex-wrap gap-2">
          {charity.verificationBadges.map((badge) => (
            <li
              key={`${badge.source}-${badge.label}`}
              className={`inline-flex border px-2 py-1 text-[11px] tracking-wide ${statusStyles[badge.status]}`}
            >
              {badge.source}: {statusLabel(badge.status)}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function CategoryDropdownExplorer({
  categories,
  charities,
  title,
  description,
}: CategoryDropdownExplorerProps) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
      {title ? (
        <header className="max-w-4xl space-y-3">
          <h2 className="text-3xl font-semibold leading-tight text-[var(--color-text-strong)] sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-7 text-[var(--color-text-muted)]">{description}</p>
          ) : null}
        </header>
      ) : null}

      <div className="space-y-4">
        {categories.map((category) => {
          const categoryCharities = charities.filter(
            (charity) => charity.categorySlug === category.slug,
          );
          const realCount = categoryCharities.filter((charity) => !charity.sampleData).length;
          const sampleCount = categoryCharities.filter((charity) => charity.sampleData).length;

          return (
            <details key={category.slug} className="dark-panel group" open={false}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-[11px] tracking-[0.14em] text-[var(--color-text-faint)] uppercase">
                    {category.iconLabel}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-[var(--color-text-strong)]">
                    {category.name}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-muted)]">
                    {category.shortDescription}
                  </p>
                </div>

                <div className="w-full text-left text-xs text-[var(--color-text-faint)] sm:w-auto sm:text-right">
                  <p>{category.subcategories.length} subcategories</p>
                  <p>
                    {categoryCharities.length} listings ({realCount} real, {sampleCount} sample)
                  </p>
                </div>
              </summary>

              <div className="space-y-3 border-t border-[var(--color-border-soft)] px-5 py-4">
                {categoryCharities.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-faint)]">
                    No charities are mapped to this category yet.
                  </p>
                ) : (
                  categoryCharities
                    .slice()
                    .sort((left, right) => left.name.localeCompare(right.name))
                    .map((charity) => (
                      <details key={charity.id} className="dark-panel-soft" open={false}>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-[var(--color-text-strong)]">
                          <span>{charity.name}</span>
                          <span className="text-xs text-[var(--color-text-faint)]">
                            {[charity.contact.city, charity.contact.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </summary>

                        <div className="border-t border-[var(--color-border-soft)] p-4">
                          <CharityExpandedCard charity={charity} categoryName={category.name} />
                        </div>
                      </details>
                    ))
                )}

                <div className="pt-1">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="inline-flex border-b border-[var(--color-border)] pb-0.5 text-xs tracking-wide text-[var(--color-text-muted)] uppercase transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
                  >
                    Open dedicated category page
                  </Link>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
