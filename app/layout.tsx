
import type { Metadata } from "next";
import "./globals.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ScrollReveal from "./components/ScrollReveal";
import RoutePreloader from "./components/RoutePreloader";

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

  metadataBase: new URL("https://www.tuljamotors.com"),

  openGraph: {
    title:
      "Tulja Motors | Accident Repair & Denting Painting in Kolhapur",
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
        {/* PRELOADER ON EVERY PAGE NAVIGATION */}
        <RoutePreloader />

        {/* GLOBAL SCROLL ANIMATION */}
        <ScrollReveal />

        {/* WEBSITE NAVIGATION */}
        <Navbar />

        {/* ALL WEBSITE PAGES */}
        <div className="site-content">
          {children}
        </div>

        {/* WEBSITE FOOTER */}
        <Footer />

        {/* FLOATING WHATSAPP */}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
