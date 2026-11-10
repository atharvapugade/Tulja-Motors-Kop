
"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const selector = "main > section";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    const observeSections = () => {
      document.querySelectorAll(selector).forEach((section) => {
        if (!section.classList.contains("scroll-revealed")) {
          observer.observe(section);
        }
      });
    };

    observeSections();

    const mutationObserver = new MutationObserver(observeSections);

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
