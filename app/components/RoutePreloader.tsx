
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Preloader from "./preloader";

export default function RoutePreloader() {
  const pathname = usePathname();
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    setShowPreloader(true);

    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2600);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!showPreloader) return null;

  return <Preloader key={pathname} />;
}
