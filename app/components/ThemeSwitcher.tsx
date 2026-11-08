
"use client";

import { useEffect, useState } from "react";
import { Palette, X, Check } from "lucide-react";
import "./theme-switcher.css";

const themes = [
  {
    id: "orange",
    name: "Black + Orange",
    accent: "#ff7417",
    light: "#ff9145",
    ambient: "255, 116, 23",
  },
  {
    id: "gold",
    name: "Black + Gold",
    accent: "#d6ad60",
    light: "#f0cf83",
    ambient: "214, 173, 96",
  },
  {
    id: "yellow",
    name: "Black + Yellow",
    accent: "#f5d51d",
    light: "#ffe85c",
    ambient: "245, 213, 29",
  },
  {
    id: "red",
    name: "Black + Red",
    accent: "#ed3939",
    light: "#ff6666",
    ambient: "237, 57, 57",
  },
];

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("orange");

  const applyTheme = (themeId: string) => {
    const selected = themes.find((theme) => theme.id === themeId);

    if (!selected) return;

    const root = document.documentElement;

    // Main theme colours
    root.style.setProperty("--tm-orange", selected.accent);
    root.style.setProperty("--tm-orange-light", selected.light);

    // Ambient navbar light colour
    root.style.setProperty("--tm-ambient-rgb", selected.ambient);

    // Apply colours to homepage too, if it uses scoped variables
    const home = document.querySelector(".tm-new-home");

    if (home) {
      (home as HTMLElement).style.setProperty(
        "--tm-orange",
        selected.accent
      );

      (home as HTMLElement).style.setProperty(
        "--tm-orange-light",
        selected.light
      );

      (home as HTMLElement).style.setProperty(
        "--tm-ambient-rgb",
        selected.ambient
      );
    }

    root.dataset.tmTheme = themeId;

    setActiveTheme(themeId);

    localStorage.setItem("tulja-theme-preview", themeId);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("tulja-theme-preview");

    if (savedTheme && themes.some((theme) => theme.id === savedTheme)) {
      applyTheme(savedTheme);
    }
  }, []);

  const selectedTheme = themes.find(
    (theme) => theme.id === activeTheme
  );

  return (
    <div className="tm-theme-switcher">
      <button
        type="button"
        className="tm-theme-toggle"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="Preview website themes"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={19} /> : <Palette size={19} />}
        <span>{isOpen ? "Close Themes" : "Preview Themes"}</span>
      </button>

      {isOpen && (
        <div className="tm-theme-panel">
          <div className="tm-theme-panel-header">
            <div>
              <span className="tm-theme-eyebrow">
                DESIGN PREVIEW
              </span>

              <h3>Choose Your Theme</h3>

              <p>
                Explore different colour combinations.
              </p>
            </div>

            <button
              type="button"
              className="tm-theme-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close theme selector"
            >
              <X size={18} />
            </button>
          </div>

          <div className="tm-theme-options">
            {themes.map((theme) => (
              <button
                type="button"
                key={theme.id}
                className={`tm-theme-option ${
                  activeTheme === theme.id ? "active" : ""
                }`}
                onClick={() => applyTheme(theme.id)}
              >
                <span className="tm-theme-colours">
                  <span className="tm-theme-black" />

                  <span
                    className="tm-theme-accent"
                    style={{ background: theme.accent }}
                  />
                </span>

                <span className="tm-theme-name">
                  {theme.name}
                </span>

                {activeTheme === theme.id && (
                  <Check
                    size={17}
                    className="tm-theme-check"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="tm-theme-panel-footer">
            <span>
              Selected: {selectedTheme?.name}
            </span>

            <button
              type="button"
              onClick={() => applyTheme("orange")}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
