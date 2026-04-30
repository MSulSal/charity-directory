import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/SiteShell";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
