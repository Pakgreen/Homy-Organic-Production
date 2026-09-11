"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { FiX } from "react-icons/fi";
import TikTokVerifiedTick from "@/components/TikTokVerifiedTick";

// Major, District & Inner Tehsil Cities across Pakistan (70+ Cities)
const PAKISTANI_CITIES = [
  "Mianwali",
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Sialkot",
  "Gujranwala",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sargodha",
  "Bahawalpur",
  "Sukkur",
  "Abbottabad",
  "Isa Khel",
  "Piplan",
  "Khushab",
  "Bhakkar",
  "Layyah",
  "Kot Addu",
  "Kamalia",
  "Gojra",
  "Toba Tek Singh",
  "Burewala",
  "Chishtian",
  "Daska",
  "Pattoki",
  "Muridke",
  "Taxila",
  "Haripur",
  "Swabi",
  "Mansehra",
  "Swat",
  "Mardan",
  "Kohat",
  "Bannu",
  "D.I. Khan",
  "Gujrat",
  "Sahiwal",
  "Jhelum",
  "Wah Cantt",
  "Larkana",
  "Nawabshah",
  "Kasur",
  "Dera Ghazi Khan",
  "Sheikhupura",
  "Chiniot",
  "Muzaffargarh",
  "Rahim Yar Khan",
  "Khanewal",
  "Samundri",
  "Jaranwala",
  "Hafizabad",
  "Narowal",
  "Mandi Bahauddin",
  "Chakwal",
  "Attock",
  "Gujar Khan",
  "Turbat",
  "Khuzdar",
  "Chaman",
  "Gwadar",
  "Shikarpur",
  "Jacobabad",
  "Badin",
  "Thatta",
  "Ghotki",
  "Mirpur",
  "Okara",
  "Bahawalnagar",
  "Vehari",
  "Chak Jhumra",
];

const BUYER_NAMES = [
  "Ayesha",
  "Usman",
  "Fatima",
  "Ali",
  "Zainab",
  "Hamza",
  "Sana",
  "Bilal",
  "Maria",
  "Omer",
  "Sara",
  "Ahmed",
  "Khadija",
  "Zohaib",
  "Tariq",
  "Hania",
  "Haris",
  "Sadia",
  "Saad",
  "Amina",
  "Hassan",
  "Laiba",
  "Adeel",
  "Mariam",
  "Shahzaib",
  "Fiza",
  "Aliza",
  "Danish",
  "Maham",
  "Kashif",
  "Iqra",
  "Nimra",
  "Fawad",
  "Rimsha",
  "Imran",
  "Sidra",
  "Noman",
  "Anum",
  "Arslan",
  "Maryam",
  "Yasir",
  "Tehreem",
  "Farhan",
  "Javaria",
  "Shoaib",
  "Bushra",
  "Asad",
  "Rabia",
  "Waqas",
  "Kiran",
  "Rehan",
  "Hafsa",
  "Naveed",
  "Tayyaba",
  "Salman",
  "Noor",
  "Rizwan",
  "Esha",
  "Kamran",
  "Sundas",
  "Zeeshan",
  "Sobia",
  "Atif",
  "Areeba",
  "Hammad",
  "Bisma",
  "Ahsan",
  "Tooba",
  "Shan",
];

const TIME_AGOS = [
  "Just now",
  "30 secs ago",
  "45 secs ago",
  "1 min ago",
  "2 mins ago",
  "3 mins ago",
  "4 mins ago",
  "5 mins ago",
  "7 mins ago",
  "10 mins ago",
  "12 mins ago",
];

const ORDER_ACTION_TEXTS = [
  "ordered",
  "purchased",
  "bought",
  "placed an order for",
];

const REVIEW_ACTION_TEXTS = [
  "left a 5-star review for",
  "rated 5 stars for",
  "submitted a 5-star review on",
  "reviewed",
];

// Fallback products if API returns empty
const FALLBACK_PRODUCTS = [
  {
    name: "Glass Glow Face Pack",
    slug: "glass-glow-face-pack-1v7o",
    image: "/homyorganic.png",
  },
  {
    name: "Wellness Essentials Value Pack",
    slug: "wellness-essentials-value-pack",
    image: "/homyorganic.png",
  },
];

export default function SalesNotificationToast() {
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<any[]>(FALLBACK_PRODUCTS);
  const productsRef = useRef<any[]>(FALLBACK_PRODUCTS);

  const [currentNotification, setCurrentNotification] = useState<{
    buyerName: string;
    city: string;
    productName: string;
    productSlug: string;
    productImage: string;
    timeAgo: string;
    actionText: string;
    isReview: boolean;
    hasVerifiedTick: boolean;
  } | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  const lastBuyerRef = useRef<string>("");
  const lastCityRef = useRef<string>("");

  const isAdminPage = pathname?.startsWith("/admin");
  const isAuthPage = pathname?.startsWith("/auth");
  const isCheckoutPage = pathname?.startsWith("/checkout");

  // Keep productsRef updated
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Fetch real active in-stock products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products?limit=50");
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.products || [];
        if (list.length > 0) {
          const formatted = list
            .filter((p: any) => {
              const isOutOfStock =
                p.inStock === false ||
                (typeof p.stock === "number" && p.stock <= 0);
              return !isOutOfStock;
            })
            .map((p: any) => {
              const rawImg = p.images?.[0] || p.image;
              return {
                name: p.name,
                slug: p.slug || p._id,
                image:
                  rawImg && typeof rawImg === "string" && rawImg.trim()
                    ? rawImg
                    : "/bachatpack.png",
              };
            })
            .filter(
              (p: any) =>
                p.image && !p.image.toLowerCase().includes("homyorganic"),
            );

          if (formatted.length > 0) {
            setProducts(formatted);
            productsRef.current = formatted;
          }
        }
      } catch (err) {
        // keep fallback
      }
    };
    fetchProducts();
  }, []);

  // Pick a random non-repeating notification item (Orders or Reviews)
  const getNextNotification = () => {
    const availableProducts =
      productsRef.current.length > 0
        ? productsRef.current
        : FALLBACK_PRODUCTS;

    const product =
      availableProducts[Math.floor(Math.random() * availableProducts.length)];

    let buyerName =
      BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
    while (buyerName === lastBuyerRef.current && BUYER_NAMES.length > 1) {
      buyerName = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
    }
    lastBuyerRef.current = buyerName;

    let city =
      PAKISTANI_CITIES[Math.floor(Math.random() * PAKISTANI_CITIES.length)];
    while (city === lastCityRef.current && PAKISTANI_CITIES.length > 1) {
      city =
        PAKISTANI_CITIES[Math.floor(Math.random() * PAKISTANI_CITIES.length)];
    }
    lastCityRef.current = city;

    const timeAgo =
      TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)];

    const isReview = Math.random() > 0.65; // ~35% chance to show a Review notification
    const actionText = isReview
      ? REVIEW_ACTION_TEXTS[
          Math.floor(Math.random() * REVIEW_ACTION_TEXTS.length)
        ]
      : ORDER_ACTION_TEXTS[
          Math.floor(Math.random() * ORDER_ACTION_TEXTS.length)
        ];

    const hasVerifiedTick = Math.random() > 0.35; // 65% chance for verified tick

    return {
      buyerName,
      city,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.image,
      timeAgo,
      actionText,
      isReview,
      hasVerifiedTick,
    };
  };

  // Instant fast continuous infinite loop effect
  useEffect(() => {
    if (isAdminPage || isAuthPage || isCheckoutPage) return;

    let activeTimeout: NodeJS.Timeout;

    const runCycle = () => {
      // Pick fresh new buyer & product details
      const nextNotif = getNextNotification();
      setCurrentNotification(nextNotif);
      setIsVisible(true);

      // Visible on screen for 30 seconds (30,000 ms)
      activeTimeout = setTimeout(() => {
        setIsVisible(false);

        // Short gap (800ms) before popping up next buyer notification
        activeTimeout = setTimeout(() => {
          runCycle();
        }, 800);
      }, 30000);
    };

    // Initial trigger after 1.5 seconds
    activeTimeout = setTimeout(runCycle, 1500);

    return () => {
      clearTimeout(activeTimeout);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminPage, isAuthPage, isCheckoutPage]);

  if (isAdminPage || isAuthPage || isCheckoutPage || !currentNotification) {
    return null;
  }

  const handleCardClick = () => {
    if (currentNotification.productSlug) {
      router.push(`/products/${currentNotification.productSlug}`);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    <div
      className={`fixed bottom-20 left-3 sm:bottom-6 sm:left-6 z-[9990] max-w-[250px] sm:max-w-[340px] w-auto transition-all duration-400 transform ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div
        onClick={handleCardClick}
        className="relative bg-white border border-gray-200 rounded-2xl p-2.5 sm:p-3 shadow-lg transition-all cursor-pointer group overflow-hidden"
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-1.5 right-1.5 p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors z-10"
          title="Dismiss notification"
        >
          <FiX size={13} />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Product Thumbnail */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 p-0.5">
            <img
              src={currentNotification.productImage}
              alt={currentNotification.productName}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Details Column */}
          <div className="flex-1 min-w-0 pr-3 space-y-0.5 text-left">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[11px] sm:text-xs font-extrabold text-gray-900 truncate">
                {currentNotification.buyerName} from {currentNotification.city}
              </span>
              {currentNotification.hasVerifiedTick && (
                <TikTokVerifiedTick className="w-3 h-3 shrink-0" />
              )}
            </div>

            <p className="text-[10px] sm:text-xs text-gray-600 font-normal truncate">
              {currentNotification.actionText}{" "}
              <span className="font-semibold text-gray-900">
                {currentNotification.productName}
              </span>
            </p>

            <div className="flex items-center gap-1.5 pt-0.5">
              {currentNotification.isReview && (
                <span className="text-amber-400 text-[10px] font-bold tracking-tighter">
                  ★★★★★
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">
                {currentNotification.timeAgo}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
