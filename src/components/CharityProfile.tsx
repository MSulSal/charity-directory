import Link from "next/link";

import { MapPreview } from "@/components/MapPreview";
import { VerificationBadges } from "@/components/VerificationBadges";
import { formatAddress, formatDate } from "@/lib/format";
import type { Category, CharityOrganization } from "@/types/charity";

interface CharityProfileProps {
  charity: CharityOrganization;
  category: Category;
  relatedCharities: CharityOrganization[];
}

function ExternalAction({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return (
      <span className="inline-flex border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-faint)]">
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-strong)] transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
    >
      {label}
    </a>
  );
}

export function CharityProfile({
  charity,
  category,
  relatedCharities,
}: CharityProfileProps) {
  return (
    <article className="mx-auto w-full max-w-7xl space-y-10 px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
      <header className="dark-panel space-y-5 p-7 sm:p-10">
        <p className="text-xs tracking-[0.16em] text-[var(--color-text-faint)] uppercase">
          Sample charity profile / {category.name}
        </p>
        <h1 className="font-semibold text-4xl leading-tight text-[var(--color-text-strong)] sm:text-5xl">
          {charity.name}
        </h1>
        <p className="max-w-4xl text-base leading-8 text-[var(--color-text-muted)]">{charity.mission}</p>

        <div className="flex flex-wrap gap-3">
          <ExternalAction href={charity.links.donate} label="Donate" />
          <ExternalAction href={charity.links.volunteer} label="Volunteer" />
          <ExternalAction
            href={
              charity.contact.email
                ? `mailto:${charity.contact.email}`
                : charity.contact.phone
                  ? `tel:${charity.contact.phone}`
                  : undefined
            }
            label="Contact"
          />
          <ExternalAction href={charity.links.website} label="Visit Website" />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="dark-panel space-y-6 p-6 sm:p-7">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">
              Organization details
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              This profile uses sample data fields to model future nonprofit records. Values below are placeholders for real integrations.
            </p>
          </div>

          <dl className="grid gap-4 text-sm text-[var(--color-text-muted)] sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[var(--color-text-strong)]">Category</dt>
              <dd>{category.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-text-strong)]">Subcategories</dt>
              <dd>{charity.subcategories.join(" | ")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-text-strong)]">Populations served</dt>
              <dd>{charity.populationServed.join(" | ")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-text-strong)]">Service scope</dt>
              <dd>
                {charity.serviceScale} / {charity.serviceArea}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-text-strong)]">Contact info</dt>
              <dd>
                {charity.contact.phone || "No phone listed"}
                <br />
                {charity.contact.email || "No email listed"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-text-strong)]">Address</dt>
              <dd>{formatAddress(charity.contact) || "Service area only"}</dd>
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
              <dt className="font-semibold text-[var(--color-text-strong)]">Form 990</dt>
              <dd>
                {charity.links.form990 ? (
                  <a
                    href={charity.links.form990}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[var(--color-border)] underline-offset-2 hover:decoration-[var(--color-soft-amethyst)]"
                  >
                    View Form 990 field
                  </a>
                ) : (
                  "Not available"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-text-strong)]">Goods / in-kind donations</dt>
              <dd>
                {charity.goodsDonationInfo ||
                  "No in-kind donation guidance listed in sample data."}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-text-strong)]">Last verified field update</dt>
              <dd>{formatDate(charity.lastVerified)}</dd>
            </div>
          </dl>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">
              Links
            </h3>
            <ul className="grid gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-2">
              <li>
                <ExternalAction href={charity.links.donate} label="Donation portal" />
              </li>
              <li>
                <ExternalAction href={charity.links.donationFaq} label="Donation FAQ" />
              </li>
              <li>
                <ExternalAction href={charity.links.volunteer} label="Volunteer link" />
              </li>
              <li>
                <ExternalAction href={charity.links.website} label="Website" />
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">
              Social links
            </h3>
            <ul className="grid gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-2">
              {Object.entries(charity.social).length === 0 ? (
                <li>No social links listed.</li>
              ) : (
                Object.entries(charity.social).map(([network, href]) => (
                  <li key={network}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-[var(--color-border)] underline-offset-2 hover:decoration-[var(--color-soft-amethyst)]"
                    >
                      {network}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <VerificationBadges badges={charity.verificationBadges} />
          <MapPreview
            charityName={charity.name}
            contact={charity.contact}
            serviceArea={charity.serviceArea}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-3xl text-[var(--color-text-strong)]">Related charities</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedCharities.map((related) => (
            <Link
              key={related.id}
              href={`/charities/${related.slug}`}
              className="dark-panel-soft block p-5 transition hover:border-[var(--color-soft-amethyst)]"
            >
              <h3 className="text-lg font-semibold text-[var(--color-text-strong)]">{related.name}</h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{related.subcategories[0]}</p>
              <p className="mt-3 text-xs text-[var(--color-text-faint)]">{related.serviceArea}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
