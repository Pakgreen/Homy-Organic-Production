"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

export default function WhatsAppWidget() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    setIsMounted(true);
    const fetchSiteSettings = async () => {
      try {
        const { data } = await axios.get("/api/settings/site");
        const num = data.whatsappNumber || data.contactPhone || "+923023735860";
        setWhatsappNumber(num);
      } catch (error) {
        console.error("Failed to load WhatsApp settings:", error);
        setWhatsappNumber("+923023735860");
      }
    };
    fetchSiteSettings();
  }, []);

  if (!isMounted || isAdminPage || isAuthPage) return null;

  // Clean phone number for wa.me link
  const cleanPhone = (whatsappNumber || "923023735860").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9999] pointer-events-auto">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="block w-13 h-13 sm:w-16 sm:h-16 bg-transparent p-0 m-0 cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95 group"
      >
        {/* Single WhatsApp Speech-Bubble SVG (No White Border, No Extra Layers) */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.25)] group-hover:drop-shadow-[0_8px_24px_rgba(37,211,102,0.5)] transition-all"
        >
          <defs>
            <linearGradient id="wa-green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#25D366" />
              <stop offset="100%" stopColor="#128C7E" />
            </linearGradient>
          </defs>

          {/* WhatsApp Green Speech-Bubble Body & Tail */}
          <path
            fill="url(#wa-green-gradient)"
            d="M 50,4 C 24.6,4 4,24.6 4,50 C 4,58.5 6.3,66.4 10.3,73.2 L 4,96 L 27.4,89.9 C 34,93.6 41.7,95.7 50,95.7 C 75.4,95.7 96,75.1 96,49.7 C 96,24.4 75.4,4 50,4 Z"
          />

          {/* Centered Pure White Phone Handset (NO White Border) */}
          <path
            fill="#FFFFFF"
            d="M 68.2,62.8 C 66.9,62.1 60.5,59.0 59.3,58.6 C 58.1,58.1 57.3,58.1 56.4,59.3 C 55.6,60.5 53.2,63.4 52.5,64.2 C 51.7,65.0 51.0,65.1 49.7,64.4 C 48.4,63.8 44.2,62.4 39.2,57.9 C 35.3,54.4 32.7,50.2 31.9,48.9 C 31.2,47.6 31.8,47.0 32.5,46.3 C 33.1,45.7 33.8,44.7 34.4,44.0 C 35.0,43.3 35.3,42.7 35.7,41.9 C 36.1,41.1 35.9,40.4 35.6,39.7 C 35.3,39.0 32.3,31.6 31.1,28.7 C 29.9,25.9 28.7,26.3 27.8,26.2 C 27.0,26.2 26.0,26.2 25.0,26.2 C 24.1,26.2 22.6,26.6 21.3,28.0 C 20.0,29.4 16.4,32.8 16.4,39.7 C 16.4,46.6 21.4,53.3 22.1,54.2 C 22.8,55.2 32.0,69.3 46.2,75.4 C 49.6,76.9 52.3,77.8 54.4,78.5 C 57.8,79.6 61.0,79.4 63.4,79.0 C 66.2,78.6 71.9,75.6 73.1,72.2 C 74.3,68.8 74.3,65.9 73.9,65.3 C 73.5,64.6 72.6,64.2 71.3,63.5 Z"
          />
        </svg>
      </a>
    </div>
  );
}
