"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import RoutePreloader from "./RoutePreloader";
import ScrollReveal from "./ScrollReveal";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";

export function PublicPreloaderChrome() {
  const pathname = usePathname();
  const isPanelRoute = pathname?.startsWith("/panels");

  if (isPanelRoute) return null;

  return (
    <>
      <RoutePreloader />
      <ScrollReveal />
    </>
  );
}

export function PublicHeaderChrome() {
  const pathname = usePathname();
  const isPanelRoute = pathname?.startsWith("/panels");

  if (isPanelRoute) return null;

  return <Navbar />;
}

export function PublicFooterChrome() {
  const pathname = usePathname();
  const isPanelRoute = pathname?.startsWith("/panels");

  if (isPanelRoute) return null;

  return (
    <>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

