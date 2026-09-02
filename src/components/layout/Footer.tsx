import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/resource-finder", label: "Resource Finder" },
  { href: "/categories", label: "Categories" },
  { href: "/for-nonprofits", label: "For Nonprofits" },
  { href: "/submit-a-charity", label: "Apply / Recommend" },
  { href: "/resource-finder?verified=1", label: "Trust & Verification" },
  { href: "/contact", label: "Contact" },
  { href: "/trust", label: "Trust & Verification" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border-soft)] bg-[var(--color-footer-bg)]">
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
          Charity Directory publishes a limited, source-linked set of organization records. Review each organization&apos;s official website and current eligibility information before donating, volunteering, or seeking services. We are not an emergency service.
        </p>
      </div>
    </footer>
  );
}
