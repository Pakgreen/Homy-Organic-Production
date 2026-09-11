"use client";

import { FiX, FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProductSearchSuggest from "@/components/ProductSearchSuggest";

export default function SearchPage() {
  const router = useRouter();

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <main className="fixed inset-0 min-h-screen w-full bg-white z-99999 overflow-y-auto font-[inherit]">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors p-1.5 -ml-1.5 cursor-pointer"
          >
            <FiArrowLeft size={18} strokeWidth={1.5} />
            <span className="font-light">Back</span>
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer rounded-full"
            aria-label="Close search"
            title="Close"
          >
            <FiX size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Search Suggestion Input & Results */}
        <div className="pt-2">
          <ProductSearchSuggest
            autoFocus
            placeholder="Search organic products..."
            onClose={() => router.back()}
          />
        </div>
      </div>
    </main>
  );
}
