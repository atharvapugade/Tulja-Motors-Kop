
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
        <Link href="/" className="nav-logo" onClick={closeMenu}>
          <Image
            src="/logos/tulja-motors-logo.png"
            alt="Tulja Motors"
            width={210}
            height={100}
            priority
          />
        </Link>

        <nav className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
          <Link href="/" onClick={closeMenu}>Home</Link>

          <Link href="/about" onClick={closeMenu}>About Us</Link>

          <div className="nav-dropdown">
            <Link href="/tulja-motors" onClick={closeMenu}>
              Tulja Motors <ChevronDown size={14} />
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

          <div className="nav-dropdown">
            <Link href="/sharvari-motors" onClick={closeMenu}>
              Sharvari Motors <ChevronDown size={14} />
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

          <Link href="/gallery" onClick={closeMenu}>Our Work</Link>

          <Link href="/contact" onClick={closeMenu}>Contact</Link>

          <a
            href={`tel:+91${PHONE}`}
            className="mobile-call-link"
            onClick={closeMenu}
          >
            <Phone size={17} />
            Call +91 {PHONE}
          </a>
        </nav>

        <div className="nav-actions">
          <a href={`tel:+91${PHONE}`} className="nav-call">
            <Phone size={17} />
            <span>+91 {PHONE}</span>
          </a>

          <Link href="/contact" className="nav-cta">
            Get a Quote <ArrowUpRight size={17} />
          </Link>
        </div>

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

      {/* Ambient light below navbar */}
      <div className="nav-ambient-light" aria-hidden="true">
        <div className="nav-ambient-core" />
      </div>
    </header>
  );
}
