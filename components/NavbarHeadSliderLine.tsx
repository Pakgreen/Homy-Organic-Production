"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function NavbarHeadSliderLine({
  isFooter = false,
}: {
  isFooter?: boolean;
}) {
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    axios
      .get("/api/banner")
      .then((res) => {
        if (!mounted) return;
        if (res.data?.enabled) {
          setEnabled(true);
          setText(res.data.text || "");
        } else {
          setEnabled(false);
        }
      })
      .catch(() => {
        // ignore, keep defaults
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!enabled || !text) {
    return null;
  }

  if (!isFooter) {
    return (
      <div className="bg-[#F4EFE8] border-b border-[#E6DDD0] py-2 w-full overflow-hidden text-[#3A2D21]">
        {/* Desktop View: Static Centered Banner */}
        <div className="hidden md:flex w-full items-center justify-center text-center px-4">
          <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-[#3A2D21]">
            {text}
          </span>
        </div>

        {/* Mobile View ONLY: Animated Infinite Sliding Ticker / Marquee */}
        <div className="md:hidden flex items-center overflow-hidden whitespace-nowrap relative w-full">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap shrink-0">
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-medium text-[#3A2D21]">
              {text}
            </span>
            <span className="text-[9px] text-[#8C745E]">✦</span>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-medium text-[#3A2D21]">
              {text}
            </span>
            <span className="text-[9px] text-[#8C745E]">✦</span>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-medium text-[#3A2D21]">
              {text}
            </span>
            <span className="text-[9px] text-[#8C745E]">✦</span>
          </div>

          <div
            className="animate-marquee flex items-center gap-8 whitespace-nowrap shrink-0"
            aria-hidden="true"
          >
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-medium text-[#3A2D21]">
              {text}
            </span>
            <span className="text-[9px] text-[#8C745E]">✦</span>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-medium text-[#3A2D21]">
              {text}
            </span>
            <span className="text-[9px] text-[#8C745E]">✦</span>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-medium text-[#3A2D21]">
              {text}
            </span>
            <span className="text-[9px] text-[#8C745E]">✦</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4EFE8] border-t border-[#E6DDD0] py-3.5 flex items-center justify-center overflow-hidden whitespace-nowrap text-center text-[#3A2D21]">
      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap text-[10.5px] uppercase tracking-[0.22em] font-medium">
        <span>{text}</span>
        <span>✦</span>
        <span>{text}</span>
        <span>✦</span>
        <span>{text}</span>
        <span>✦</span>
        <span>{text}</span>
        <span>✦</span>
      </div>
      <div
        className="animate-marquee flex items-center gap-10 whitespace-nowrap text-[10.5px] uppercase tracking-[0.22em] font-medium"
        aria-hidden="true"
      >
        <span>{text}</span>
        <span>✦</span>
        <span>{text}</span>
        <span>✦</span>
        <span>{text}</span>
        <span>✦</span>
        <span>{text}</span>
        <span>✦</span>
      </div>
    </div>
  );
}
