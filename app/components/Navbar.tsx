
"use client";

import Link from "next/link";
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

        {/* BRAND LOGOS */}
        <Link
          href="/"
          className="nav-brand-lockup"
          onClick={closeMenu}
          aria-label="Tulja Motors and Sharvari Motors Home"
        >
          {/* TULJA MOTORS */}
          <span className="nav-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 513 307"
              role="img"
              aria-label="Tulja Motors"
              className="tulja-navbar-svg"
            >
              <g>
                <path fill="#89161A" d="M62 68 H167 L176 93 H83 Z" />
                <path fill="#F9C31D" d="M89 101 H176 L184 126 H111 Z" />
                <path fill="#0B5F61" d="M116 134 H194 L201 159 H139 Z" />

                <path fill="#89161A" d="M451 68 H346 L337 93 H430 Z" />
                <path fill="#F9C31D" d="M424 101 H337 L329 126 H402 Z" />
                <path fill="#0B5F61" d="M397 134 H319 L312 159 H374 Z" />
              </g>

              <path
                fill="#0B5F61"
                d="M151 37 H370 L350 66 L334 166 L260.5 214 L187 166 L171 66 Z"
              />

              <path
                fill="#FFFFFF"
                d="M174 50 H348 L332 72 L318 157 L260.5 199 L202 157 L188 72 Z"
              />

              <path
                fill="#0B5F61"
                d="M202 76 H274 L267 94 H246 L227 157 H205 L224 94 H196 Z"
              />

              <path
                fill="#F9C31D"
                d="M247 157 L263 111 H280 L288 132 L309 111 H326 L310 157 H290 L300 130 L285 144 L278 130 L269 157 Z"
              />

              <text
                x="256.5"
                y="274"
                textAnchor="middle"
                fill="#0B5F61"
                fontFamily="Arial Black, Arial, sans-serif"
                fontSize="59"
                fontWeight="900"
                letterSpacing="-1.8"
              >
                TULJA MOTORS
              </text>
            </svg>
          </span>

          <span className="nav-brand-cross">×</span>

          {/* SHARVARI MOTORS */}
          <span className="nav-sharvari-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 250 110"
              role="img"
              aria-label="Sharvari Motors"
              className="sharvari-navbar-svg"
            >
              <rect width="250" height="110" fill="#0A0A12" />

              <text
                x="14"
                y="62"
                fontFamily="Arial Black, Arial, Helvetica, sans-serif"
                fontSize="40"
                fontWeight="900"
                textLength="113"
                lengthAdjust="spacingAndGlyphs"
                fill="#FFFFFF"
              >
                SHAR
              </text>

              <polygon
                points="127,33 137.5,33 146,62 135.5,62"
                fill="#FFFFFF"
              />

              <polygon
                points="146.6,23 157.1,23 146,62 135.5,62"
                fill="#E10600"
              />

              <text
                x="150"
                y="62"
                fontFamily="Arial Black, Arial, Helvetica, sans-serif"
                fontSize="40"
                fontWeight="900"
                textLength="69"
                lengthAdjust="spacingAndGlyphs"
                fill="#FFFFFF"
              >
                ARI
              </text>

              <text
                x="16"
                y="84"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="10"
                fontWeight="700"
                letterSpacing="7"
                fill="#FFFFFF"
              >
                MOTORS
              </text>

              <path d="M112 80H236" stroke="#FFFFFF" strokeWidth="3" />
            </svg>
          </span>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          className="nav-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        {/* MAIN NAVIGATION */}
        <nav
          id="main-navigation"
          className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}
        >
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

        {/* DESKTOP ACTIONS */}
        <div className="nav-actions">
          <a href={`tel:+91${PHONE}`} className="nav-call">
            <Phone size={17} />
            <span>+91 {PHONE}</span>
          </a>

          <Link href="/contact" className="nav-cta" onClick={closeMenu}>
            Get a Quote
            <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>

      {/* AMBIENT LIGHT */}
      <div className="nav-ambient-light" aria-hidden="true">
        <div className="nav-ambient-core" />
      </div>
    </header>
  );
}
