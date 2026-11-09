"use client";

import { useEffect } from "react";
import { Languages } from "lucide-react";
import "./google-translate.css";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    const initializeGoogleTranslate = () => {
      const google = (window as any).google;

      if (!google?.translate?.TranslateElement) return;

      const container = document.getElementById(
        "google_translate_element"
      );

      if (!container || container.children.length > 0) return;

      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,mr,hi,te,kn,ta",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    window.googleTranslateElementInit = initializeGoogleTranslate;

    if ((window as any).google?.translate?.TranslateElement) {
      initializeGoogleTranslate();
    } else if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");

      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;

      document.body.appendChild(script);
    }

    return () => {
      window.googleTranslateElementInit = undefined;
    };
  }, []);

  return (
    <div className="language-switcher">
      <Languages size={17} />
      <div
        id="google_translate_element"
        className="google-translate-widget"
      />
    </div>
  );
}