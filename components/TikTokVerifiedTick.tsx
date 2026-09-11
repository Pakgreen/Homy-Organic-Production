import React from "react";

interface TikTokVerifiedTickProps {
  className?: string;
  size?: number;
  color?: string;
  checkColor?: string;
}

export default function TikTokVerifiedTick({
  className = "w-4 h-4",
  size,
  color = "#000000",
  checkColor = "#FFFFFF",
}: TikTokVerifiedTickProps) {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      className={`inline-block shrink-0 ${className}`}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Verified Customer"
    >
      <title>Verified Customer</title>
      {/* Scalloped Badge Background */}
      <path
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z"
        fill={color}
      />
      {/* Checkmark */}
      <path
        d="M7.2 12.2L10.4 15.4L16.8 8.6"
        stroke={checkColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
