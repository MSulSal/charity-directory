"use client";

import { useState } from "react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/resource-finder", label: "Resource Finder" },
  { href: "/categories", label: "Categories" },
  { href: "/resource-finder?verified=1", label: "Trust & Verification" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[2000] border-b border-[var(--color-border-soft)] bg-[var(--color-header-bg)] text-[var(--color-text-strong)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="text-base font-semibold tracking-[0.12em] uppercase sm:text-lg">
          Charity Directory
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-strong)] md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span className="sr-only">Menu</span>
          <span className="relative block h-3.5 w-4">
            <span
              className={`absolute left-0 top-0 block h-0.5 w-4 bg-current transition ${isOpen ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-4 bg-current transition ${isOpen ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 top-3 block h-0.5 w-4 bg-current transition ${isOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </span>
        </button>

        <div className="hidden items-center gap-5 md:flex">
          <nav
            aria-label="Primary"
            className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]"
          >
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
          <ThemeToggle />
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`${isOpen ? "block" : "hidden"} border-t border-[var(--color-border-soft)] bg-[var(--color-header-mobile-bg)] md:hidden`}
      >
        <nav aria-label="Mobile primary" className="mx-auto w-full max-w-7xl px-4 py-3">
          <ul className="grid gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block border border-transparent px-3 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-border)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-strong)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-[var(--color-border-soft)] pt-3">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
