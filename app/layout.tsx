import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import {
  PublicPreloaderChrome,
  PublicHeaderChrome,
  PublicFooterChrome,
} from "./components/PublicChrome";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Denting Painting & Accident Repair in Kolhapur | Tulja Motors",
    template: "%s | Tulja Motors Kolhapur",
  },

  description:
    "Tulja Motors offers accident repair, denting, painting, car restoration, mechanical repairs and insurance claim assistance in Kolhapur. Explore Sharvari Motors for premium car modification, detailing and customisation.",

  keywords: [
    "Accident Repair in Kolhapur",
    "Denting Painting in Kolhapur",
    "Car Restoration Kolhapur",
    "Tulja Motors",
    "Sharvari Motors",
    "Car Modification Kolhapur",
    "Car Detailing Kolhapur",
    "Insurance Claim Assistance",
    "Ceramic Coating Kolhapur",
    "PPF Installation Kolhapur",
  ],

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.tuljamotors.com"
  ),

  openGraph: {
    title: "Tulja Motors | Accident Repair & Denting Painting in Kolhapur",
    description:
      "Professional vehicle repair, restoration and automotive customisation in Kolhapur.",
    url: "https://www.tuljamotors.com",
    siteName: "Tulja Motors",
    type: "website",
    locale: "en_IN",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* PRELOADER & SCROLL ANIMATION ON PUBLIC PAGES ONLY */}
        <Suspense fallback={null}>
          <PublicPreloaderChrome />
        </Suspense>

        {/* WEBSITE NAVIGATION (HIDDEN ON /panels) */}
        <Suspense fallback={null}>
          <PublicHeaderChrome />
        </Suspense>

        {/* ALL WEBSITE & PANEL PAGES */}
        <div className="site-content">{children}</div>

        {/* WEBSITE FOOTER & FLOATING WHATSAPP (HIDDEN ON /panels) */}
        <Suspense fallback={null}>
          <PublicFooterChrome />
        </Suspense>

        {/* VERCEL WEB ANALYTICS */}
        <Analytics />
      </body>
    </html>
  );
}
