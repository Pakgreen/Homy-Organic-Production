"use client";

import React from "react";

interface AboutProps {
  text?: string;
}

export default function About({ text }: AboutProps) {
  const defaultText =
    "Homy Organic is a premium organic beauty and wellness brand, offering hand-blended products made from natural ingredients. Each product is pure, natural, and premium — designed to care for both your inner wellness and outer beauty. No compromise is ever made on cleanliness, hygiene, or quality standards in the crafting of any product.";

  const displayText = text || defaultText;

  return (
    <section className="w-full bg-[#F6EDE0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-y border-[#E8DAC8]">
      <div className="max-w-4xl mx-auto text-center space-y-3.5">
        
        {/* Simple Clean Heading with Golden Line */}
        <div className="flex items-center justify-center gap-3">
          <span className="w-9 sm:w-12 h-[2px] bg-[#B9853A] inline-block" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-sans tracking-wide">
            About Us
          </h2>
        </div>

        {/* Simple Clean Paragraph */}
        <p className="text-sm sm:text-base md:text-lg text-gray-700 font-normal leading-relaxed max-w-3xl mx-auto text-center">
          {displayText}
        </p>

      </div>
    </section>
  );
}
