import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { SiteShell } from "@/components/layout/SiteShell";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Charity Directory - Find Trusted Charities by Cause and Location",
    template: "%s | Charity Directory",
  },
  description:
    "Find trusted charities, nonprofits, donation links, volunteer opportunities, and local help by cause, location, and ways to give.",
  keywords: [
    "food charities near me",
    "animal rescue charities",
    "mental health charities",
    "volunteer opportunities near me",
    "local nonprofits",
    "donation opportunities",
  ],
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Charity Directory",
    description:
      "Discover trusted nonprofits, donation links, volunteer options, and local help by cause and location.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0a12" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (() => {
      try {
        const key = "${THEME_STORAGE_KEY}";
        const saved = localStorage.getItem(key);
        const theme = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);

        const existingMeta = document.head.querySelector('meta[data-theme-color="manual"]');
        if (theme === "system") {
          if (existingMeta) existingMeta.remove();
          return;
        }

        const color = theme === "dark" ? "#0d0a12" : "#f5f1eb";
        const meta = existingMeta || (() => {
          const created = document.createElement("meta");
          created.name = "theme-color";
          created.setAttribute("data-theme-color", "manual");
          document.head.appendChild(created);
          return created;
        })();
        meta.content = color;
      } catch {}
    })();
  `;

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
