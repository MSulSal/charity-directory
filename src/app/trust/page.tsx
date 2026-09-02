import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust & Verification",
  description: "How Charity Directory presents organization details and source-linked trust fields.",
};

export default function TrustPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
      <h1 className="text-4xl font-semibold text-[var(--color-text-strong)] sm:text-5xl">Trust & Verification</h1>
      <div className="dark-panel space-y-5 p-6 text-sm leading-7 text-[var(--color-text-muted)]">
        <p>
          Published profiles include direct organization links and, when available, structured fields for EINs, 501(c)(3) status, Form 990 documents, and watchdog listings. A listed source is not a Charity Directory rating or endorsement.
        </p>
        <p>
          Information can change. Confirm donation eligibility, program availability, hours, and service boundaries with the organization before acting. Charity Directory is not an emergency, crisis, or legal-advice service.
        </p>
        <p>
          Report a correction or recommend an organization through Apply / Recommend. We review proposed updates before publishing them.
        </p>
      </div>
    </section>
  );
}
