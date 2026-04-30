import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/resource-finder", label: "Resource Finder" },
  { href: "/categories", label: "Categories" },
  { href: "/for-nonprofits", label: "For Nonprofits" },
  { href: "/submit-a-charity", label: "Submit a Charity" },
  { href: "/resource-finder?verified=1", label: "Trust & Verification" },
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
          Charity Directory includes a mix of sample and live-source records while we expand coverage. Always review each organization profile, contact details, and verification fields before taking action.
        </p>
      </div>
    </footer>
  );
}
