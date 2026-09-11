"use client";

import React, { useState, useRef, useEffect } from "react";
import TikTokVerifiedTick from "./TikTokVerifiedTick";

interface VerifiedBuyerBadgeProps {
  className?: string;
  badgeBg?: string;
  badgeText?: string;
  badgeBorder?: string;
  tickColor?: string;
}

export default function VerifiedBuyerBadge({
  className = "",
  badgeText = "text-gray-900",
  tickColor = "#000000",
}: VerifiedBuyerBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center gap-1 cursor-pointer select-none ${className}`}
      onClick={toggleTooltip}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <TikTokVerifiedTick className="w-3.5 h-3.5" color={tickColor} checkColor="#FFFFFF" />
      <span className={`text-[10.5px] font-medium tracking-tight ${badgeText}`}>
        Verified Buyer
      </span>

      {/* Upwork Style Tooltip Popup (Opens on mobile tap & desktop hover) */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-neutral-900 text-white text-[11px] font-normal leading-tight rounded-xl shadow-2xl z-50 text-center animate-in fade-in zoom-in-95 duration-150 border border-gray-800 pointer-events-auto">
          <p className="font-semibold text-amber-400 mb-0.5">Verified Buyer</p>
          <p className="text-gray-300 text-[10px]">
            This customer&apos;s purchase and order delivery have been verified by the Homy Organic Team.
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
        </div>
      )}
    </div>
  );
}
