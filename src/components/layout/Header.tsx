import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/charities", label: "Charities" },
  { href: "/charities?verified=1", label: "Trust & Verification" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-soft)] bg-[rgb(13_10_18/86%)] text-[var(--color-text-strong)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="text-lg font-semibold tracking-[0.12em] uppercase">
          Charity Directory
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-transparent pb-1 transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-text-strong)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
