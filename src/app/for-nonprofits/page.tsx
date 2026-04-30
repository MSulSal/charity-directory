import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Nonprofits",
  description: "Information for nonprofits that may want to claim or update profiles in Charity Directory.",
};

export default function ForNonprofitsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-6 py-14 sm:px-8 lg:py-18">
      <h1 className="font-semibold text-4xl text-zinc-900">For Nonprofits</h1>
      <p className="text-sm leading-7 text-zinc-700">
        This section will support profile claiming, updates, and trust document submission. Nonprofit onboarding is not yet enabled.
      </p>
    </section>
  );
}
