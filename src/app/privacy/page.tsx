import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Charity Directory handles information used while you browse the directory.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
      <h1 className="text-4xl font-semibold text-[var(--color-text-strong)] sm:text-5xl">Privacy</h1>
      <div className="dark-panel space-y-5 p-6 text-sm leading-7 text-[var(--color-text-muted)]">
        <p>
          Charity Directory does not require an account and does not sell personal information. Resource Finder resolves locations from the directory&apos;s covered locations; it does not send your search to a third-party geocoding provider. Map tiles are provided by CARTO and OpenStreetMap-based services.
        </p>
        <p>
          When you use Apply / Recommend, this site opens a draft in your email application. The information in that draft is sent only if you choose to send the email; it is not stored by this website.
        </p>
        <p>
          We may update this notice as the directory adds analytics, saved listings, or an account system. For questions, use the Contact page.
        </p>
      </div>
    </section>
  );
}
