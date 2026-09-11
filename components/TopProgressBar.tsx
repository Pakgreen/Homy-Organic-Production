"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // When route finishes changing, complete to 100% and fade out
  useEffect(() => {
    if (loading || progress > 0) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        const resetTimer = setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 300);
        return () => clearTimeout(resetTimer);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept clicks on internal links
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");

      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        target.getAttribute("target") !== "_blank"
      ) {
        const currentPath = window.location.pathname;
        if (href !== currentPath) {
          setLoading(true);
          setVisible(true);
          setProgress(15);

          clearInterval(interval);
          interval = setInterval(() => {
            setProgress((prev) => (prev < 85 ? prev + Math.floor(Math.random() * 12 + 5) : prev));
          }, 120);

          setTimeout(() => clearInterval(interval), 4000);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      clearInterval(interval);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-99999 h-[2.5px] bg-transparent pointer-events-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-[#B9853B] via-[#276749] to-[#B9853B] transition-all duration-200 ease-out shadow-[0_0_10px_rgba(185,133,59,0.7)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
