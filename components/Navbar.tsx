"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiSearch,
  FiChevronDown,
  FiLogOut,
  FiPackage,
  FiCornerDownRight,
} from "react-icons/fi";

import { MdKeyboardArrowDown } from "react-icons/md";

import NavbarHeadSliderLine from "./NavbarHeadSliderLine";

import { useCartStore } from "@/store/cartStore";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";

interface Category {
  _id: string;
  name: string;
  showInNav?: boolean;
}

export default function Navbar() {
  const { data: session } = useSession();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteLogo, setSiteLogo] = useState("/homyorganic.png");
  const [tagline, setTagline] = useState("Where Beauty Meets Wellness");
  const totalItems = useCartStore((state) => state.getTotalItems());
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminPage = pathname?.startsWith("/admin");
  const isSearchPage = pathname?.startsWith("/search");
  const isCheckoutPage = pathname?.startsWith("/checkout");

  useEffect(() => {
    setIsMounted(true);
    fetchCategories();
    fetchSiteLogo();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.categories)
          ? res.data.categories
          : [];
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchSiteLogo = async () => {
    try {
      const { data } = await axios.get("/api/settings/site");
      if (data) {
        if (data.logo) setSiteLogo(data.logo);
        if (data.tagline) setTagline(data.tagline);
      }
    } catch (error) {
      console.error("Error fetching site logo:", error);
    }
  };

  if (isAdminPage || isSearchPage || isAuthPage || isCheckoutPage) return null;

  const flatCategories = categories
    .filter((c) => c.showInNav !== false)
    .slice(0, 10);

  return (
    <>
      <NavbarHeadSliderLine />
      <nav
        className="sticky top-0 z-9991 w-full bg-white border-b border-gray-100 font-[inherit]"
        style={{
          backgroundColor: "var(--navbar-bg, rgba(255, 255, 255, 0.88))",
          color: "var(--navbar-text, #111827)",
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-22 sm:h-24 py-2">
            {/* Left items */}
            <div className="flex items-center gap-4 shrink-0 z-10">
              <div className="relative hidden md:block group">
                <button className="inline-flex items-center gap-1 text-[15px] font-medium text-black hover:text-gray-600 transition-colors cursor-pointer">
                  Categories
                  <FiChevronDown size={16} />
                </button>

                <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 min-w-56">
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-2xl p-2">
                    <Link
                      href="/products"
                      className="block rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      All Products
                    </Link>
                    {flatCategories.map((cat) => (
                      <Link
                        key={cat._id}
                        href={`/products?category=${cat._id}`}
                        className="block rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden opacity-80 hover:opacity-100"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => router.push("/search")}
                className="text-black hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Search products"
              >
                <FiSearch size={20} className="stroke-[1.5]" />
              </button>
            </div>

            {/* Exact Centered Logo & Tagline */}
            <Link
              href="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 group"
            >
              <Image
                src={siteLogo}
                alt="Homy Organic"
                width={200}
                height={100}
                priority
                loading="eager"
                // @ts-ignore
                fetchPriority="high"
                sizes="(max-width: 768px) 160px, 200px"
                className="max-h-14 sm:max-h-16 md:max-h-18 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.14em] sm:tracking-[0.18em] font-medium text-[#B9853A] uppercase mt-0.5 whitespace-nowrap">
                {tagline}
              </span>
            </Link>

            {/* Right items */}
            <div className="flex items-center gap-4 shrink-0 z-10">
              <Link
                href="/track-order"
                className="hidden md:inline-flex items-center text-[15px] font-medium text-[#B9853A] hover:text-black transition-colors"
              >
                Track Order
              </Link>

              <Link
                href="/about"
                className="hidden md:inline-flex items-center text-[15px] font-medium text-black hover:text-gray-600 transition-colors"
              >
                About Us
              </Link>

              <Link
                href="/contact"
                className="hidden md:inline-flex items-center text-[15px] font-medium text-black hover:text-gray-600 transition-colors"
              >
                Contact Us
              </Link>

              {/* Cart Drawer Icon */}
              <button
                onClick={() => useCartStore.getState().openCart()}
                className="relative inline-flex items-center justify-center text-black hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Open cart"
              >
                <FiShoppingBag size={21} className="stroke-[1.5]" />
                {isMounted && totalItems > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-white text-[10px] !rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-semibold"
                    style={{ backgroundColor: "#111827", borderRadius: "9999px" }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Sign In / Account Icon (Lightweight FiUser Icon) */}
              {session?.user?.email ? (
                <div className="relative hidden md:block group">
                  <button className="flex items-center space-x-2 text-black hover:text-gray-600 transition-colors cursor-pointer">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        style={{ borderRadius: "9999px" }}
                        className="w-9 h-9 !rounded-full object-cover"
                      />
                    ) : (
                      <div
                        style={{ borderRadius: "9999px" }}
                        className="w-9 h-9 !rounded-full bg-gray-100 flex items-center justify-center border border-gray-200"
                      >
                        <FiUser size={19} className="text-black stroke-[1.5]" />
                      </div>
                    )}
                  </button>

                  <div className="absolute right-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 origin-top-right text-gray-900">
                    <div className="absolute right-4 top-1.5 w-3.5 h-3.5 bg-white border-t border-l border-gray-100 transform rotate-45 rounded-tl-xs z-10"></div>

                    <div className="relative bg-white border border-gray-100 rounded-2xl py-2 w-64 overflow-hidden z-20">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 text-gray-900">
                        <p className="text-sm font-semibold truncate">
                          {session.user.name || "My Account"}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="py-2 flex flex-col gap-1 px-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl"
                        >
                          <FiUser className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl"
                        >
                          <FiPackage className="w-4 h-4" />
                          My Orders
                        </Link>
                      </div>

                      <div className="border-t border-gray-50 pt-2 px-2 pb-1">
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="hidden md:inline-flex items-center justify-center text-black hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Sign In"
                  title="Sign In"
                >
                  <FiUser size={20} className="stroke-[1.5]" />
                </Link>
              )}
              
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-9999 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Slide-in Drawer */}
      <div
        className={`fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out rounded-r-3xl overflow-hidden w-[85vw] max-w-sm bg-white shadow-2xl z-999999 flex flex-col md:hidden font-[inherit] ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 bg-gray-50/50">
          {session?.user?.email ? (
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-11 h-11 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <FiUser size={22} className="text-gray-600" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-normal text-gray-900 text-sm">
                  {session.user.name || "User"}
                </span>
                <span className="text-xs text-gray-500 font-light">
                  {session.user.email}
                </span>
              </div>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm font-normal text-gray-900 hover:text-[#B9853B] transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <FiUser size={18} className="stroke-[1.5] text-gray-700" />
              </div>
              <span>Sign In</span>
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200/80 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Categories Toggle */}
          <div className="flex flex-col pb-1">
            <div
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="flex items-center justify-between py-2.5 px-3.5 text-gray-800 font-normal rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <span className="text-sm font-normal">Categories</span>
              <MdKeyboardArrowDown
                size={20}
                className={`transition-transform duration-300 text-gray-700 ${
                  isCategoriesOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Categories List */}
            {isCategoriesOpen && (
              <div className="flex flex-col gap-0.5 pl-4 pt-1 pb-2">
                {flatCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/products?category=${cat._id}`}
                    className="flex hover:bg-gray-50 items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-light text-gray-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiCornerDownRight className="text-gray-400 text-xs shrink-0 stroke-[1.5]" />
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/products?bestSeller=true"
            className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-black font-normal hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>Best Selling</span>
          </Link>

          <Link
            href="/products"
            className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-black font-normal hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>Premium Collection</span>
          </Link>

          <Link
            href="/products?valuePack=true"
            className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-black font-normal hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>Bundles &amp; Deals</span>
          </Link>

          <button
            onClick={() => {
              useCartStore.getState().openCart();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center w-full text-left px-3.5 py-2.5 text-sm text-gray-800 hover:text-black font-normal hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
          >
            <span>Cart {totalItems > 0 && `(${totalItems})`}</span>
          </button>

          <Link
            href="/track-order"
            className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-black font-normal hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>Track your Order</span>
          </Link>

          <Link
            href="/about"
            className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-gray-600 font-normal hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>About Us</span>
          </Link>

          <Link
            href="/contact"
            className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-gray-600 font-normal hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>Contact Us</span>
          </Link>

          {session?.user.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-gray-600 font-normal hover:bg-gray-50 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Admin</span>
            </Link>
          )}

          {session && (
            <>
              <Link
                href="/profile"
                className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-gray-600 font-normal hover:bg-gray-50 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Profile</span>
              </Link>
              <Link
                href="/orders"
                className="flex items-center px-3.5 py-2.5 text-sm text-gray-800 hover:text-gray-600 font-normal hover:bg-gray-50 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>My Orders</span>
              </Link>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full text-left px-3.5 py-2.5 text-sm text-red-500 font-normal hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
