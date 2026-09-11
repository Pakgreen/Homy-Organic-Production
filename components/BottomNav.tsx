"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FiHome, FiGrid, FiShoppingCart, FiUser } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";

export default function BottomNav() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminPage = pathname?.startsWith("/admin");
  const isSearchPage = pathname?.startsWith("/search");
  const isCheckoutPage = pathname?.startsWith("/checkout");
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isAuthPage || isAdminPage || isSearchPage || isCheckoutPage) return null;

  const isHomeActive = pathname === "/";
  const isShopActive = pathname?.startsWith("/products");
  const isProfileActive = pathname?.startsWith("/profile") || pathname?.startsWith("/auth");

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-100 z-9998 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)] font-[inherit]">
        <div className="flex justify-around items-center h-14">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-1/4 h-full transition-colors cursor-pointer ${
              isHomeActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <FiHome size={20} className={`stroke-[1.3] ${isHomeActive ? "stroke-[1.8]" : ""}`} />
            <span className={`text-[10.5px] mt-1 tracking-tight ${isHomeActive ? "font-medium text-gray-900" : "font-light"}`}>
              Home
            </span>
          </Link>

          {/* Shop */}
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center w-1/4 h-full transition-colors cursor-pointer ${
              isShopActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <FiGrid size={20} className={`stroke-[1.3] ${isShopActive ? "stroke-[1.8]" : ""}`} />
            <span className={`text-[10.5px] mt-1 tracking-tight ${isShopActive ? "font-medium text-gray-900" : "font-light"}`}>
              Shop
            </span>
          </Link>

          {/* Cart */}
          <button
            onClick={() => useCartStore.getState().openCart()}
            className="relative flex flex-col items-center justify-center w-1/4 h-full text-gray-400 hover:text-gray-700 transition-colors cursor-pointer border-none bg-transparent"
          >
            <div className="relative">
              <FiShoppingCart size={20} className="stroke-[1.3]" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-2.5 text-white text-[9px] font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none"
                  style={{ backgroundColor: "#111827" }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10.5px] font-light mt-1 tracking-tight">Cart</span>
          </button>

          {/* Profile / Sign In */}
          <Link
            href={session ? "/profile" : "/auth/signin"}
            className={`flex flex-col items-center justify-center w-1/4 h-full transition-colors cursor-pointer ${
              isProfileActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <FiUser size={20} className={`stroke-[1.3] ${isProfileActive ? "stroke-[1.8]" : ""}`} />
            <span className={`text-[10.5px] mt-1 tracking-tight ${isProfileActive ? "font-medium text-gray-900" : "font-light"}`}>
              {session ? "Profile" : "Sign In"}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
