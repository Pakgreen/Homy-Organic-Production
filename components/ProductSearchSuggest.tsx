"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiLoader, FiSearch, FiX } from "react-icons/fi";

type SearchProduct = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  images?: string[];
};

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
  const [suggestions, setSuggestions] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(searchTerm)}&limit=6&available=true`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Failed to fetch suggestions");

        const data = await response.json();
        setSuggestions(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = query.trim();
    if (!search) return;
    router.push(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="relative w-full font-[inherit]">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center border-b-2 border-gray-100 focus-within:border-black transition-colors pb-1"
      >
        <button
          type="submit"
          className="text-gray-400 hover:text-gray-900 shrink-0 ml-1 mr-3 cursor-pointer"
          aria-label="Search products"
          title="Search products"
        >
          <FiSearch size={22} strokeWidth={1.5} />
        </button>
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
              setSuggestions([]);
              if (inputRef.current) inputRef.current.focus();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer rounded-full"
            title="Clear search"
          >
            <FiX size={18} />
          </button>
        )}
      </form>

      {(isLoading || suggestions.length > 0 || (query.trim() && !isLoading)) && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-500">
              <FiLoader className="animate-spin" /> Searching products...
            </div>
          ) : suggestions.length > 0 ? (
            <ul aria-label="Product suggestions">
              {suggestions.map((product) => (
                <li key={product._id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    onClick={() => router.push(`/products/${product.slug || product._id}`)}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                    <span className="shrink-0 text-sm text-gray-500">
                      Rs. {product.price.toLocaleString("en-PK")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-gray-500">No available products found.</p>
          )}
        </div>
      )}
    </div>
  );
}
