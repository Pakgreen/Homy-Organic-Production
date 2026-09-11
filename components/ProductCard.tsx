"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { isCloudinaryUrl, getOptimizedImageUrl } from "@/lib/image";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug?: string;
    price: number;
    newPrice?: number;
    oldPrice?: number;
    originalPrice?: number;
    images: string[];
    ratings?: number;
    category?: any;
    brand?: string;
    badge?: string;
    subTitle?: string;
    isBestSeller?: boolean;
    isFeatured?: boolean;
    isValuePack?: boolean;
    inStock?: boolean;
    stock?: number;
    weight?: string;
  };
  priority?: boolean;
  isBestSellerSection?: boolean;
}

export default function ProductCard({
  product,
  priority = false,
  isBestSellerSection = false,
}: ProductCardProps) {
  const [isPrimaryLoaded, setIsPrimaryLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const rawPrimary = product.images?.[0] || "";
  const rawHover = product.images?.[1] || rawPrimary;
  const primaryImage = getOptimizedImageUrl(rawPrimary, 380);
  const hoverImage = getOptimizedImageUrl(rawHover, 380);
  const hasHoverImage = Boolean(product.images?.[1]);

  const currentPrice =
    typeof product.newPrice === "number" ? product.newPrice : product.price;
  const previousPrice =
    typeof product.oldPrice === "number"
      ? product.oldPrice
      : typeof product.originalPrice === "number"
        ? product.originalPrice
        : undefined;

  const hasSizes = Array.isArray((product as any).sizes) && (product as any).sizes.length > 0;
  const firstSize = hasSizes ? (product as any).sizes[0] : null;
  const cardPrice = firstSize && typeof firstSize.price === "number" ? firstSize.price : currentPrice;
  const cardOriginalPrice =
    firstSize && typeof firstSize.originalPrice === "number" && firstSize.originalPrice > 0
      ? firstSize.originalPrice
      : previousPrice;

  const showOldPrice =
    typeof cardOriginalPrice === "number" && cardOriginalPrice > cardPrice;

  const discountPercent =
    showOldPrice && cardOriginalPrice && cardOriginalPrice > cardPrice
      ? Math.round(((cardOriginalPrice - cardPrice) / cardOriginalPrice) * 100)
      : 0;

  const rawCategoryName =
    typeof product.category === "object" && product.category?.name
      ? product.category.name
      : typeof product.category === "string" && product.category
      ? product.category
      : product.badge && !["value pack", "value packs", "valuepack"].includes(product.badge.trim().toLowerCase())
      ? product.badge
      : "";

  // If category name matches "ORGANIC", "HOMY ORGANIC", "VALUE PACK", or empty, don't show it
  const isExcludedCategory =
    !rawCategoryName ||
    ["organic", "homy organic", "homyorganic", "value pack", "value packs", "valuepack"].includes(
      rawCategoryName.trim().toLowerCase()
    );

  const categoryName = isExcludedCategory ? "" : rawCategoryName;

  const customBadge = product.badge?.trim() || "";

  let badgeText = "";
  if (
    Boolean(product.isValuePack) ||
    ["value pack", "value packs", "valuepack"].includes(customBadge.toLowerCase())
  ) {
    badgeText = customBadge || "Value Pack";
  } else if (isBestSellerSection) {
    badgeText = (customBadge || "BEST SELLER").toUpperCase();
  } else if (customBadge) {
    badgeText = customBadge;
  }

  const isOutOfStock =
    (product as any).inStock === false ||
    (typeof (product as any).stock === "number" && (product as any).stock <= 0);

  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Sorry, this item is currently out of stock!");
      return;
    }
    addItem({
      _id: product._id,
      name: product.name,
      price: cardPrice,
      quantity: 1,
      image: product.images[0] || "",
      size: firstSize ? firstSize.name : undefined,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Sorry, this item is currently out of stock!");
      return;
    }
    addItem({
      _id: product._id,
      name: product.name,
      price: cardPrice,
      quantity: 1,
      image: product.images[0] || "",
      size: firstSize ? firstSize.name : undefined,
    });
    router.push("/checkout");
  };

  return (
    <article className="group flex h-full flex-col bg-white border-0 rounded-none shadow-none">
      
      {/* Image Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-[#F4F1EA]">
        
        {/* Top-Left Badge (Best Seller, Value Pack, etc. - Original White Glass Styling) */}
        {badgeText ? (
          <div
            style={{ borderRadius: "9999px" }}
            className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs text-gray-900 font-serif italic font-medium text-[10.5px] tracking-wide px-2.5 py-0.5 !rounded-full border border-gray-200/70 shadow-2xs"
          >
            {badgeText}
          </div>
        ) : null}

        {/* Top-Right Out of Stock / Minimal Discount Tag (Original Orange & Gradient Styling) */}
        {isOutOfStock ? (
          <div
            style={{ borderRadius: "9999px" }}
            className="absolute top-2.5 right-2.5 z-10 bg-gradient-to-r from-[#EA6925] to-[#E55353] text-white font-extrabold text-[9.5px] uppercase tracking-wider px-2.5 py-0.5 !rounded-full shadow-xs border border-white/30"
          >
            OUT OF STOCK
          </div>
        ) : showOldPrice && discountPercent > 0 ? (
          <div
            className="absolute top-2.5 right-2.5 z-10 bg-gradient-to-r from-[#EA6925] to-[#E55353] text-white font-extrabold text-[10.5px] px-2.5 py-0.5 !rounded-full shadow-xs border border-white/30 tracking-tight font-price-syne"
            style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontStyle: "italic", borderRadius: "9999px" }}
          >
            -{discountPercent}%
          </div>
        ) : null}

        <Link href={`/products/${product.slug || product._id}`} className="absolute inset-0">
          {primaryImage && (
            <>
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 rounded-xl ${
                  hasHoverImage
                    ? "group-hover:opacity-0"
                    : "group-hover:scale-105"
                }`}
              />
              {hasHoverImage && hoverImage !== primaryImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} alternate view`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="hidden sm:block object-cover opacity-0 transition-all duration-500 rounded-xl group-hover:scale-105 group-hover:opacity-100"
                />
              )}
            </>
          )}
        </Link>

        {/* Bottom-Right Quick Add to Cart Icon Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          style={{ borderRadius: "9999px" }}
          className={`absolute bottom-2.5 right-2.5 z-10 flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 !rounded-full bg-white text-gray-900 shadow-md border border-gray-200/80 transition-all duration-200 ${
            isOutOfStock
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-900 hover:text-white active:scale-90 cursor-pointer"
          }`}
          title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
          aria-label={`Add ${product.name} to cart`}
        >
          <FiShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

      </div>

      {/* Content Details Below Image (Minimal Clean Layout) */}
      <div className="flex flex-1 flex-col pt-2.5 pb-0.5 px-0.5 text-left justify-between space-y-1.5">
        
        <div className="space-y-1">
          {/* Category Label */}
          {categoryName && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 leading-none">
              {categoryName}
            </p>
          )}

          {/* Title & Rating Row */}
          <div className="flex items-start justify-between gap-1.5">
            <Link href={`/products/${product.slug || product._id}`} className="flex-1 min-w-0">
              <h3 className="line-clamp-2 text-xs sm:text-sm font-medium uppercase tracking-tight text-gray-800 leading-snug hover:text-[#B9853A] transition-colors">
                {product.name}
              </h3>
              {product.subTitle && (
                <p className="line-clamp-1 text-[11px] sm:text-xs text-gray-500 font-normal mt-0.5">
                  {product.subTitle}
                </p>
              )}
            </Link>
            <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
              <span className="text-amber-400 text-xs">★</span>
              <span className="text-[11px] text-gray-500 font-medium">
                {(() => {
                  const ratingVal =
                    typeof product.ratings === "number" && product.ratings > 0
                      ? product.ratings
                      : 5.0;
                  return Number(ratingVal).toFixed(1);
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Prices & Buy Now Button (Direct Checkout) */}
        <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
          
          {/* Prices Side-by-Side */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className="text-[#E55353] text-sm sm:text-base font-price-syne"
              style={{
                fontFamily: "var(--font-lora), 'Lora', serif",
                fontWeight: 600,
                fontStyle: "italic",
              }}
            >
              {formatPrice(cardPrice)}
            </span>
            {cardOriginalPrice && cardOriginalPrice > cardPrice && (
              <span
                className="text-[11px] text-gray-400 line-through font-normal font-price-syne"
                style={{ fontFamily: "var(--font-lora), 'Lora', serif" }}
              >
                {formatPrice(cardOriginalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}