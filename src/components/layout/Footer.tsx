import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/categories", label: "Categories" },
  { href: "/charities", label: "Charities" },
  { href: "/for-nonprofits", label: "For Nonprofits" },
  { href: "/submit-a-charity", label: "Submit a Charity" },
  { href: "/charities?verified=1", label: "Trust & Verification" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border-soft)] bg-[rgb(13_10_18/85%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--color-text-muted)]">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[var(--color-text-strong)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="max-w-3xl text-xs leading-6 text-[var(--color-text-faint)]">
          Sample prototype for Charity Directory. Organization details, trust badges, and links currently use mock data fields for product design and testing.
        </p>
      </div>
    </footer>
  );
}
