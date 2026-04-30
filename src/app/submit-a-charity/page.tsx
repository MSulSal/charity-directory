import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Charity",
  description: "Placeholder page for charity submissions in Charity Directory.",
};

export default function SubmitCharityPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-6 py-14 sm:px-8 lg:py-18">
      <h1 className="font-semibold text-4xl text-zinc-900">Submit a Charity</h1>
      <p className="text-sm leading-7 text-zinc-700">
        Submission workflows are planned for a future version. Right now, this page is reserved while we finalize submission requirements, review criteria, and verification document intake.
      </p>
    </section>
  );
}
