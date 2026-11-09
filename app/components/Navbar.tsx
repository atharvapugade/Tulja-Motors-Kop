
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

import "./navbar-ambient.css";

const PHONE = "9130129205";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="nav-container">

        {/* COMBINED TULJA × SHARVARI BRANDING */}
        <Link
          href="/"
          className="nav-brand-lockup"
          onClick={closeMenu}
          aria-label="Tulja Motors and Sharvari Motors Home"
        >
          {/* TULJA MOTORS — EXISTING NAVBAR LOGO */}
          <span className="nav-logo">
            <Image
              src="/logos/tulja-motors-logo.png"
              alt="Tulja Motors"
              width={210}
              height={100}
              priority
            />
          </span>

          {/* BRAND SEPARATOR */}
          <span className="nav-brand-cross">×</span>

          {/* SHARVARI MOTORS — SVG LOGO */}
          <span className="nav-sharvari-logo">
            <svg
              viewBox="0 0 235 78"
              role="img"
              aria-label="Sharvari Motors"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="4"
                y="43"
                className="sharvari-wordmark"
              >
                SHARVARI
              </text>

              {/* Red diagonal slash */}
              <path
                d="M151 3 L174 3 L157 48 L134 48 Z"
                fill="#e50920"
              />

              {/* White-style underline recreated in dark */}
              <path
                d="M145 53 H228 V61 H145 Z"
                fill="currentColor"
              />

              <text
                x="7"
                y="74"
                className="sharvari-motors-text"
              >
                M O T O R S
              </text>
            </svg>
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>

          <Link href="/" onClick={closeMenu}>
            Home
          </Link>

          <Link href="/about" onClick={closeMenu}>
            About Us
          </Link>

          {/* TULJA DROPDOWN */}
          <div className="nav-dropdown">
            <Link href="/tulja-motors" onClick={closeMenu}>
              Tulja Motors
              <ChevronDown size={14} />
            </Link>

            <div className="nav-dropdown-menu">
              <Link href="/tulja-motors#accident-repair" onClick={closeMenu}>
                Accident Repair
              </Link>

              <Link href="/tulja-motors#denting-painting" onClick={closeMenu}>
                Denting & Painting
              </Link>

              <Link href="/tulja-motors#restoration" onClick={closeMenu}>
                Restoration
              </Link>

              <Link href="/tulja-motors#insurance" onClick={closeMenu}>
                Insurance Assistance
              </Link>
            </div>
          </div>

          {/* SHARVARI DROPDOWN */}
          <div className="nav-dropdown">
            <Link href="/sharvari-motors" onClick={closeMenu}>
              Sharvari Motors
              <ChevronDown size={14} />
            </Link>

            <div className="nav-dropdown-menu">
              <Link href="/sharvari-motors#exterior" onClick={closeMenu}>
                Exterior Modification
              </Link>

              <Link href="/sharvari-motors#interior" onClick={closeMenu}>
                Interior Modification
              </Link>

              <Link href="/sharvari-motors#detailing" onClick={closeMenu}>
                Ceramic Coating & Detailing
              </Link>

              <Link href="/sharvari-motors#accessories" onClick={closeMenu}>
                Accessories
              </Link>
            </div>
          </div>

          <Link href="/gallery" onClick={closeMenu}>
            Our Work
          </Link>

          <Link href="/contact" onClick={closeMenu}>
            Contact
          </Link>

          {/* MOBILE CALL */}
          <a
            href={`tel:+91${PHONE}`}
            className="mobile-call-link"
            onClick={closeMenu}
          >
            <Phone size={17} />
            Call +91 {PHONE}
          </a>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="nav-actions">

          <a href={`tel:+91${PHONE}`} className="nav-call">
            <Phone size={17} />
            <span>+91 {PHONE}</span>
          </a>

          <Link
            href="/contact"
            className="nav-cta"
            onClick={closeMenu}
          >
            Get a Quote
            <ArrowUpRight size={17} />
          </Link>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="nav-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

      </div>

      {/* AMBIENT LIGHT */}
      <div className="nav-ambient-light" aria-hidden="true">
        <div className="nav-ambient-core" />
      </div>
    </header>
  );
}
