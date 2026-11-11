
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
  const [tuljaOpen, setTuljaOpen] = useState(false);
  const [sharvariOpen, setSharvariOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setTuljaOpen(false);
    setSharvariOpen(false);
  };

  // Close menu when clicking outside or pressing Escape.
  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Preserve the current scroll position while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen || window.innerWidth > 1050) return;

    const scrollY = window.scrollY;

    const previousStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = previousStyles.position;
      document.body.style.top = previousStyles.top;
      document.body.style.left = previousStyles.left;
      document.body.style.right = previousStyles.right;
      document.body.style.width = previousStyles.width;
      document.body.style.overflow = previousStyles.overflow;

      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  return (
    <header
      className="site-header"
      id="main-site-header"
      ref={headerRef}
    >
      <div className="nav-container">

        {/* BRAND LOGOS */}

        <Link
          href="/"
          className="nav-brand-lockup"
          onClick={closeMenu}
          aria-label="Tulja Motors and Sharvari Motors Home"
        >
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

        {/* MAIN NAVIGATION */}

        <nav
          className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}
          id="mobile-navigation"
          aria-label="Main navigation"
        >
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>

          <Link href="/about" onClick={closeMenu}>
            About Us
          </Link>

          {/* TULJA MOTORS */}

          <div
            className={`nav-dropdown ${
              tuljaOpen ? "nav-dropdown-open" : ""
            }`}
          >
            <div className="nav-dropdown-heading">
              <Link href="/tulja-motors" onClick={closeMenu}>
                Tulja Motors
              </Link>

              <button
                type="button"
                className="nav-dropdown-toggle"
                aria-label="Toggle Tulja Motors submenu"
                aria-expanded={tuljaOpen}
                onClick={() => {
                  setTuljaOpen((prev) => !prev);
                  setSharvariOpen(false);
                }}
              >
                <ChevronDown size={17} />
              </button>
            </div>

            <div className="nav-dropdown-menu">
              <Link href="/tulja-motors#accident-repair" onClick={closeMenu}>
                Accident Repair
              </Link>

              <Link href="/tulja-motors#denting-painting" onClick={closeMenu}>
                Denting &amp; Painting
              </Link>

              <Link href="/tulja-motors#restoration" onClick={closeMenu}>
                Restoration
              </Link>

              <Link href="/tulja-motors#insurance" onClick={closeMenu}>
                Insurance Assistance
              </Link>
            </div>
          </div>

          {/* SHARVARI MOTORS */}

          <div
            className={`nav-dropdown ${
              sharvariOpen ? "nav-dropdown-open" : ""
            }`}
          >
            <div className="nav-dropdown-heading">
              <Link href="/sharvari-motors" onClick={closeMenu}>
                Sharvari Motors
              </Link>

              <button
                type="button"
                className="nav-dropdown-toggle"
                aria-label="Toggle Sharvari Motors submenu"
                aria-expanded={sharvariOpen}
                onClick={() => {
                  setSharvariOpen((prev) => !prev);
                  setTuljaOpen(false);
                }}
              >
                <ChevronDown size={17} />
              </button>
            </div>

            <div className="nav-dropdown-menu">
              <Link href="/sharvari-motors#exterior" onClick={closeMenu}>
                Exterior Modification
              </Link>

              <Link href="/sharvari-motors#interior" onClick={closeMenu}>
                Interior Modification
              </Link>

              <Link href="/sharvari-motors#detailing" onClick={closeMenu}>
                Ceramic Coating &amp; Detailing
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

        {/* DESKTOP ACTIONS */}

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
          aria-controls="mobile-navigation"
          onClick={() => {
            setMenuOpen((prev) => !prev);
            setTuljaOpen(false);
            setSharvariOpen(false);
          }}
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
