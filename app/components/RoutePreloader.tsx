
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Preloader from "./preloader";

export default function RoutePreloader() {
  const pathname = usePathname();
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Hide navbar while preloader is active
    document.body.classList.add("is-loading");
    setShowPreloader(true);

    const timer = setTimeout(() => {
      setShowPreloader(false);
      document.body.classList.remove("is-loading");
    }, 2600);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("is-loading");
    };
  }, [pathname]);

  if (!showPreloader) return null;

  return <Preloader key={pathname} />;
}
