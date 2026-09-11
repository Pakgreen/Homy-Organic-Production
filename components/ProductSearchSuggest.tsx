"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/image";

type Product = {
  _id: string;
  name: string;
  slug?: string;
  price?: number;
  newPrice?: number;
  image?: string;
  images?: string[];
  category?: any;
};

const POPULAR_SEARCHES = [
  "Signature Hair Oil",
  "Hair Oil",
  "Bachat Pack",
  "Value Pack",
  "Organic Hair Oil",
  "Best Sellers",
  "Special Bundles",
];

export default function ProductSearchSuggest({
  autoFocus = true,
  onClose,
  placeholder = "Search organic products...",
}: {
  autoFocus?: boolean;
  onClose?: () => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const firstImage = (p: Product) => {
    let raw = "";
    if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) {
      raw = p.images[0];
    } else if (typeof p.image === "string" && p.image.trim()) {
      raw = p.image;
    }
    return getOptimizedImageUrl(raw, 120);
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setOpen(true);
    setLoading(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query)}&limit=8`
        );
        const data = await res.json();
        setResults(data?.products || []);
      } catch (err) {
        console.error("Search error", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const goTo = (slugOrId: string) => {
    setOpen(false);
    router.push(`/products/${slugOrId}`);
    onClose?.();
  };

  const handlePillClick = (term: string) => {
    setQuery(term);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full font-[inherit]">
      {/* Modern Search Bar */}
      <div className="relative flex items-center border-b-2 border-gray-100 focus-within:border-black transition-colors pb-1">
        <FiSearch
          className="text-gray-400 shrink-0 ml-1 mr-3"
          size={22}
          strokeWidth={1.5}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full bg-transparent text-gray-900 py-3 text-lg sm:text-2xl font-light placeholder-gray-400 focus:outline-none"
          aria-label="Search products"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              if (inputRef.current) inputRef.current.focus();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer rounded-full"
            title="Clear search"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Results / Popular Tags Container */}
      <div className="mt-4 w-full">
        {/* State 1: Empty Query -> Popular Searches */}
        {!query.trim() && (
          <div className="py-3 space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handlePillClick(term)}
                  className="px-3 py-1 rounded-full bg-gray-50/80 hover:bg-gray-100 border border-gray-200/60 text-[10.5px] text-gray-700 font-light transition-all cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Active Loading Skeleton */}
        {query.trim() && loading && (
          <div className="py-2 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-gray-50 border border-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* State 3: No Results */}
        {query.trim() && !loading && results.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm sm:text-base text-gray-500 font-light">
              No products found matching{" "}
              <span className="font-normal text-gray-900">"{query}"</span>
            </p>
          </div>
        )}

        {/* State 4: Results List */}
        {query.trim() && !loading && results.length > 0 && (
          <div className="space-y-1 max-h-[65vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Products ({results.length})
              </p>
            </div>

            {results.map((p) => {
              const displayPrice =
                typeof p.newPrice === "number" ? p.newPrice : p.price;
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => goTo(p.slug || p._id)}
                  className="w-full text-left flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={firstImage(p)}
                      alt={p.name}
                      className="w-12 h-14 object-contain shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-normal text-gray-800 group-hover:text-black truncate transition-colors">
                        {p.name}
                      </span>
                      {typeof displayPrice === "number" && (
                        <span className="text-xs text-gray-900 font-normal mt-0.5">
                          {formatPrice(displayPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <FiArrowUpRight
                    size={18}
                    className="text-gray-300 group-hover:text-black transition-colors shrink-0 ml-2 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
