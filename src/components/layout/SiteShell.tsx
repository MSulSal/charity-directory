import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

interface SiteShellProps {
  children: ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-page-bg-solid)] text-[var(--color-text-strong)]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
