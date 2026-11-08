"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";

const PHONE = "919130129205";

export default function WhatsAppFloat() {
  const pathname = usePathname();

  const hiddenRoutes = [
    "/admin",
    "/panels",
    "/employee",
    "/dashboard",
    "/software",
  ];

  const shouldHide = hiddenRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  if (shouldHide) return null;

  const message = encodeURIComponent(
    "Hello Tulja Motors, I would like to enquire about your vehicle repair and restoration services."
  );

  return (
    <>
      <div className="desktop-whatsapp">
        <a
          href={`https://wa.me/${PHONE}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Tulja Motors on WhatsApp"
        >
          <MessageCircle size={23} />
          <span>WhatsApp Us</span>
        </a>
      </div>

      <div className="mobile-contact-bar">
        <a href={`tel:+${PHONE}`} className="mobile-contact-call">
          <Phone size={19} />
          Call Now
        </a>

        <a
          href={`https://wa.me/${PHONE}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-contact-whatsapp"
        >
          <MessageCircle size={19} />
          WhatsApp
        </a>
      </div>
    </>
  );
}