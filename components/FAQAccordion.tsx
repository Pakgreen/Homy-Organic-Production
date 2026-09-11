"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function FAQAccordion() {
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    axios
      .get("/api/settings/faq")
      .then((res) => {
        setFaqs(res.data || []);
      })
      .catch(console.error);
  }, []);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-4 pb-4 sm:pb-6 font-[inherit]">
      <div className="mb-2 tracking-wide text-center flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-gray-900 mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-400 font-light text-xs sm:text-sm max-w-md">
          Everything you need to know about our organic products and services.
        </p>
      </div>
      <div className="border border-gray-100 bg-transparent rounded-2xl px-4 sm:px-6 mt-6 divide-y divide-gray-100">
        {faqs.map((faq, index) => (
          <div key={index} className="group">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-center py-4 sm:py-4.5 text-left font-light text-gray-800 cursor-pointer focus:outline-none"
            >
              <span className="text-sm sm:text-base font-light text-gray-800 pr-4 md:pr-10 max-w-[90%] leading-relaxed">
                {faq.question}
              </span>
              <span className="text-gray-400 group-hover:text-black transition-colors flex-shrink-0">
                {openIndex === index ? (
                  <FiChevronUp size={18} strokeWidth={1.5} />
                ) : (
                  <FiChevronDown size={18} strokeWidth={1.5} />
                )}
              </span>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openIndex === index
                  ? "max-h-[500px] opacity-100 mb-4"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="text-gray-500 font-light leading-relaxed pr-6 sm:pr-8 break-words text-xs sm:text-sm">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
