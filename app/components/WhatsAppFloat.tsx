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
      {/* DESKTOP WHATSAPP */}
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

      {/* MOBILE FLOATING CONTACT BUTTONS */}
      <div className="mobile-contact-bar">

        <a
          href={`tel:+${PHONE}`}
          className="mobile-contact-call"
          aria-label="Call Tulja Motors"
        >
          <Phone size={23} />
          <span className="mobile-contact-label">Call Now</span>
        </a>

        <a
          href={`https://wa.me/${PHONE}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-contact-whatsapp"
          aria-label="Chat with Tulja Motors on WhatsApp"
        >
          <MessageCircle size={25} />
          <span className="mobile-contact-label">WhatsApp</span>
        </a>

      </div>
    </>
  );
}