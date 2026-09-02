import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Charity Directory team about a listing, correction, or partnership.",
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-6 py-14 sm:px-8 lg:py-18">
      <h1 className="font-semibold text-4xl text-[var(--color-text-strong)]">Contact</h1>
      <p className="text-sm leading-7 text-[var(--color-text-muted)]">
        Contact us to report an incorrect listing, recommend an organization, or discuss a nonprofit partnership.
      </p>
      {contactEmail ? (
        <a
          href={`mailto:${contactEmail}`}
          className="inline-flex border border-[var(--color-saffron)] bg-[var(--color-saffron)] px-5 py-3 text-sm font-semibold text-[var(--color-obsidian)]"
        >
          Email the directory team
        </a>
      ) : (
        <p className="dark-panel p-4 text-sm text-[var(--color-text-muted)]">
          Our contact inbox is being configured.
        </p>
      )}
    </section>
  );
}
