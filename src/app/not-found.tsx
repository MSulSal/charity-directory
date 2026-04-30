import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-6 py-20 text-center sm:px-8">
      <p className="text-xs tracking-[0.15em] text-zinc-600 uppercase">404</p>
      <h1 className="font-semibold text-4xl text-zinc-900">Page not found</h1>
      <p className="text-sm leading-7 text-zinc-700">
        The requested page could not be found. You can continue browsing categories or return to the homepage.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="border border-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900"
        >
          Home
        </Link>
        <Link
          href="/categories"
          className="border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800"
        >
          Categories
        </Link>
      </div>
    </section>
  );
}
