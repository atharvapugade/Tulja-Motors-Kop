import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import CurrentYear from "./CurrentYear";
const PHONE = "9130129205";
const EMAIL = "tuljamotors@gmail.com";

const ADDRESS =
  "Pune Bengaluru National Highway NH 48, near Shetimal Petrol Pump, Top Sambhapur, Kolhapur, Maharashtra 416122";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(ADDRESS);

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">

        <div className="footer-brand">
          <Link href="/">
            <Image
              src="/logos/tulja-motors-logo.png"
              alt="Tulja Motors"
              width={200}
              height={95}
            />
          </Link>

          <p>
            Accident repair, denting, painting and vehicle
            restoration solutions in Kolhapur. Bringing
            professional automotive care closer to you.
          </p>

          <a
            href={`https://wa.me/91${PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-whatsapp"
          >
            Chat on WhatsApp <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="footer-column">
          <h4>QUICK LINKS</h4>
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/tulja-motors">Tulja Motors</Link>
          <Link href="/sharvari-motors">Sharvari Motors</Link>
          <Link href="/gallery">Our Work</Link>
          <Link href="/contact">Contact Us</Link>
        </div>

        <div className="footer-column">
          <h4>TULJA MOTORS</h4>
          <Link href="/tulja-motors#accident-repair">Accident Repair</Link>
          <Link href="/tulja-motors#denting-painting">Denting & Painting</Link>
          <Link href="/tulja-motors#restoration">Car Restoration</Link>
          <Link href="/tulja-motors#mechanical">Mechanical Repairs</Link>
          <Link href="/tulja-motors#insurance">Insurance Assistance</Link>
        </div>

        <div className="footer-column footer-contact">
          <h4>CONTACT DETAILS</h4>

          <a href={`tel:+91${PHONE}`}>
            <Phone size={17} />
            +91 {PHONE}
          </a>

          <a href={`mailto:${EMAIL}`}>
            <Mail size={17} />
            {EMAIL}
          </a>

          <a href={MAP_URL} target="_blank" rel="noopener noreferrer">
            <MapPin size={17} />
            {ADDRESS}
          </a>

          <Link href="/contact" className="footer-directions">
            Visit Our Workshop <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
         © <CurrentYear /> Tulja Motors. All rights reserved.
        </p>
        <p>Accident Repair & Automotive Care · Kolhapur</p>
      </div>
    </footer>
  );
}