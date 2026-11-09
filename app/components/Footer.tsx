
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  
} from "lucide-react";
import CurrentYear from "./CurrentYear";
import "./footer.css";

const PHONE = "9130129205";
const WHATSAPP = "919130129205";
const EMAIL = "tuljamotors@gmail.com";

const ADDRESS =
  "Pune Bengaluru National Highway NH 48, near Shetimal Petrol Pump, Top Sambhapur, Kolhapur, Maharashtra 416122";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(ADDRESS);

export default function Footer() {
  return (
    <footer className="tm-footer">
      {/* FOOTER TOP CTA */}
      <div className="tm-footer-cta">
        <div>
          <span className="tm-footer-eyebrow">
            YOUR AUTOMOTIVE JOURNEY STARTS HERE
          </span>
          <h2>
            YOUR CAR DESERVES
            <br />
            <em>THE RIGHT CARE.</em>
          </h2>
        </div>

        <Link href="/contact" className="tm-footer-cta-button">
          LET&apos;S TALK ABOUT YOUR CAR
          <ArrowUpRight size={19} />
        </Link>
      </div>

      {/* MAIN FOOTER */}
      <div className="tm-footer-main">
        {/* BRAND */}
        <div className="tm-footer-brand">
          <Link href="/" className="tm-footer-logo">
            <Image
              src="/logos/tulja-motors-logo.png"
              alt="Tulja Motors"
              width={190}
              height={90}
            />
          </Link>

          <p>
            Two identities. One automotive destination. From accident
            repair and restoration to detailing and customisation,
            discover complete automotive care in Kolhapur.
          </p>

          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
              "Hello Tulja Motors, I would like to enquire about your services."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-footer-whatsapp"
          >
            CHAT WITH OUR TEAM
            <ArrowUpRight size={16} />
          </a>
        </div>

        {/* QUICK LINKS */}
        <div className="tm-footer-column">
          <h3>EXPLORE</h3>
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/gallery">Our Work</Link>
          <Link href="/contact">Contact Us</Link>
        </div>

        {/* TULJA */}
        <div className="tm-footer-column">
          <h3>TULJA MOTORS</h3>
          <Link href="/tulja-motors#accident-repair">
            Accident Repair
          </Link>
          <Link href="/tulja-motors#denting-painting">
            Denting & Painting
          </Link>
          <Link href="/tulja-motors#restoration">
            Car Restoration
          </Link>
          <Link href="/tulja-motors#mechanical">
            Mechanical Work
          </Link>
        </div>

        {/* SHARVARI */}
        <div className="tm-footer-column">
          <h3>SHARVARI MOTORS</h3>
          <Link href="/sharvari-motors#exterior">
            Exterior Modification
          </Link>
          <Link href="/sharvari-motors#interior">
            Interior Modification
          </Link>
          <Link href="/sharvari-motors#detailing">
            Ceramic Coating & Detailing
          </Link>
          <Link href="/sharvari-motors#accessories">
            Accessories
          </Link>
        </div>

        {/* CONTACT */}
        <div className="tm-footer-column tm-footer-contact">
          <h3>GET IN TOUCH</h3>

          <a href={`tel:+91${PHONE}`}>
            <Phone size={17} />
            <span>+91 {PHONE}</span>
          </a>

          <a href={`mailto:${EMAIL}`}>
            <Mail size={17} />
            <span>{EMAIL}</span>
          </a>

          <a href={MAP_URL} target="_blank" rel="noopener noreferrer">
            <MapPin size={17} />
            <span>{ADDRESS}</span>
          </a>

          <Link href="/contact" className="tm-footer-directions">
            FIND OUR WORKSHOP
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="tm-footer-bottom">
        <p>
          © <CurrentYear /> TULJA MOTORS. ALL RIGHTS RESERVED.
        </p>

        <span className="tm-footer-bottom-center">
          REPAIR <i>✳</i> RESTORE <i>✳</i> CUSTOMISE
        </span>

        <div className="tm-footer-socials">
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <Phone size={16} />
          </a>
       
        </div>
      </div>
    </footer>
  );
}
