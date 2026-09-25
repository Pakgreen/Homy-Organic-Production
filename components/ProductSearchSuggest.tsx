"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

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
              if (inputRef.current) inputRef.current.focus();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer rounded-full"
            title="Clear search"
          >
            <FiX size={18} />
          </button>
        )}
      </form>
    </div>
  );
}
