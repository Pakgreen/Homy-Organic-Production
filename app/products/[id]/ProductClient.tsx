"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiShare2,
  FiTruck,
  FiShield,
  FiX,
  FiPackage,
  FiEye,
  FiShoppingBag,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import axios from "axios";
import { useSession } from "next-auth/react";
import ProductCard from "@/components/ProductCard";
import { getOptimizedImageUrl } from "@/lib/image";
import TikTokVerifiedTick from "@/components/TikTokVerifiedTick";
import VerifiedBuyerBadge from "@/components/VerifiedBuyerBadge";

function ProductSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white animate-pulse">
      <div className="h-4 w-24 bg-gray-50 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="h-105 sm:h-140 bg-gray-50 border border-gray-100" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-50 border border-gray-100" />
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-5 w-24 bg-gray-50" />
          <div className="h-9 w-4/5 bg-gray-50" />
          <div className="h-6 w-1/3 bg-gray-50" />
          <div className="h-24 w-full bg-gray-50" />
          <div className="h-12 w-full bg-gray-50" />
        </div>
      </div>
    </div>
  );
}

interface ProductClientProps {
  productId: string;
  initialProduct?: any;
}

export default function ProductClient({
  productId,
  initialProduct,
}: ProductClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [product, setProduct] = useState<any>(initialProduct || null);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [valuePacks, setValuePacks] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<any>(
    initialProduct?.sizes?.[0] || null,
  );
  const [selectedOffer, setSelectedOffer] = useState<any>(
    initialProduct?.offers?.[0] || null,
  );
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [sharePopup, setSharePopup] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("923023735860");
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Specification Cards Toggle Accordion State (Collapsed by default, includedItems open)
  const [openSpec, setOpenSpec] = useState<Record<string, boolean>>({
    benefits: false,
    ingredients: false,
    howToUse: false,
    precautions: false,
    quality: false,
    includedItems: true,
  });

  const toggleSpec = (key: string) => {
    setOpenSpec((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Dual Social Proof Badges State (Daily 24h Orders: 3 or 4, Live Viewers: 3 or 4)
  const [boughtCount, setBoughtCount] = useState<number>(3);
  const [liveViewers, setLiveViewers] = useState<number>(4);

  useEffect(() => {
    // Deterministic 24-hour daily hash per product (Values: 2, 3, or 4 for different products)
    const todayStr = new Date().toISOString().slice(0, 10);
    const keyStr = `${product?._id || product?.slug || productId || "homy"}-${todayStr}`;
    let hash = 0;
    for (let i = 0; i < keyStr.length; i++) {
      hash = keyStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const dailyOrders = (Math.abs(hash) % 3) + 2; // 2, 3, or 4 per product
    setBoughtCount(dailyOrders);

    const initialViewers = Math.floor(Math.random() * 2) + 3; // 3 or 4
    setLiveViewers(initialViewers);

    // Periodically fluctuate live viewers count (strictly 3 or 4)
    const interval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const nextCount = prev + delta;
        if (nextCount > 4) return 4;
        if (nextCount < 3) return 3;
        return nextCount;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [product?._id, productId]);

  const includedItems = useMemo(() => {
    if (!Array.isArray(product?.whichIncluded)) return [];
    return product.whichIncluded
      .map((item: any) => {
        if (typeof item === "string") {
          const match = item.match(/^(\d+)\s*x\s*(.*)$/i);
          if (match) {
            return {
              name: match[2].trim(),
              quantity: parseInt(match[1], 10) || 1,
              price: null,
            };
          }
          return { name: item.trim(), quantity: 1, price: null };
        } else if (item && typeof item === "object") {
          const qty =
            typeof item.quantity === "number"
              ? item.quantity
              : parseInt(item.quantity, 10) || 1;
          return {
            name: item.name || item.title || "Item",
            quantity: qty,
            price: item.price ? Number(item.price) : null,
          };
        }
        return null;
      })
      .filter((item: any) => item && item.name);
  }, [product?.whichIncluded]);

  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (Array.isArray(reviews) && reviews.length > 0) {
      reviews.forEach((r: any) => {
        const star = Math.min(
          5,
          Math.max(1, Math.round(Number(r.rating) || 5)),
        );
        counts[star as keyof typeof counts] += 1;
      });
    }
    return counts;
  }, [reviews]);
  const addItem = useCartStore((state) => state.addItem);
  const productImageVariants =
    Array.isArray(product?.imageVariants) && product.imageVariants.length > 0
      ? product.imageVariants.filter(
          (image: any) =>
            image &&
            typeof image.url === "string" &&
            image.url.trim().length > 0,
        )
      : Array.isArray(product?.images) && product.images.length > 0
        ? product.images
            .filter(
              (image: unknown): image is string =>
                typeof image === "string" && image.trim().length > 0,
            )
            .map((url: string, index: number) => ({
              url,
              index,
              name: product?.imageLabels?.[index] || `Design ${index + 1}`,
            }))
        : typeof product?.image === "string" && product.image.trim().length > 0
          ? [{ url: product.image, index: 0, name: "Main Image" }]
          : [];

  useEffect(() => {
    if (showWriteReviewModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showWriteReviewModal]);

  useEffect(() => {
    if (
      !initialProduct ||
      (product && product._id !== productId && product.slug !== productId)
    ) {
      fetchProduct();
    }
    fetchWhatsappSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchWhatsappSetting = async () => {
    try {
      const res = await axios.get("/api/settings/site");
      if (res.data?.whatsappNumber) {
        setWhatsappNumber(res.data.whatsappNumber);
      } else if (res.data?.contact?.phone) {
        setWhatsappNumber(res.data.contact.phone);
      }
    } catch (e) {
      // Keep default
    }
  };

  useEffect(() => {
    setSelectedImage(0);
    if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }
    setSelectedOffer(Array.isArray(product?.offers) && product.offers.length > 0 ? product.offers[0] : null);
  }, [product?._id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const idToFetch = product?._id || productId;
        const res = await axios.get(`/api/products/${idToFetch}/reviews`);
        if (Array.isArray(res.data)) {
          setReviews(res.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [productId, product?._id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      toast.error("Please fill out your name and review comment.");
      return;
    }
    setIsSubmitting(true);
    try {
      const idToSubmit = product?._id || productId;
      const res = await axios.post(`/api/products/${idToSubmit}/reviews`, {
        name: reviewerName,
        rating,
        comment,
      });
      if (res.data.success) {
        toast.success("Review submitted successfully!");
        setShowAllReviews(true);
        setReviewerName("");
        setRating(5);
        setComment("");

        // Re-fetch fresh reviews from server immediately
        try {
          const freshRes = await axios.get(
            `/api/products/${idToSubmit}/reviews`,
          );
          if (Array.isArray(freshRes.data) && freshRes.data.length > 0) {
            setReviews(freshRes.data);
          } else if (res.data.review) {
            setReviews((prev) => [res.data.review, ...prev]);
          }
        } catch {
          if (res.data.review) {
            setReviews((prev) => [res.data.review, ...prev]);
          }
        }

        // Update product ratings locally
        const newReviews = [res.data.review, ...reviews];
        const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = parseFloat(
          (totalRating / newReviews.length).toFixed(1),
        );
        setProduct((prev: any) =>
          prev ? { ...prev, ratings: avgRating } : prev,
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchProduct = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await axios.get(`/api/products/${productId}`);
      setProduct(res.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
      setErrorMessage(
        "Product not found or unavailable right now. Please try again.",
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!product) {
      setRelatedProducts([]);
      setValuePacks([]);
      setSuggestionsLoading(false);
      return;
    }

    const categoryId = product?.category?._id || product?.category;

    const fetchSuggestions = async () => {
      setSuggestionsLoading(true);
      try {
        // 1. Fetch other products (filtered by category if present, or latest products)
        const prodUrl = categoryId
          ? `/api/products?category=${categoryId}&limit=8&sort=-createdAt`
          : `/api/products?limit=8&sort=-createdAt`;

        const prodRes = await axios.get(prodUrl);
        const prodList = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.products || [];

        const filteredProds = prodList.filter(
          (item: any) => item?._id !== product._id,
        );
        setRelatedProducts(filteredProds);

        // 2. Fetch Value Pack suggestions
        const vpRes = await axios.get(
          `/api/products?valuePack=true&limit=6&sort=-createdAt`,
        );
        const vpList = Array.isArray(vpRes.data)
          ? vpRes.data
          : vpRes.data?.products || [];

        const filteredVps = vpList.filter(
          (item: any) => item?._id !== product._id,
        );
        setValuePacks(filteredVps);
      } catch (error) {
        console.error("Error fetching product suggestions:", error);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [product]);

  const calculatedRating = useMemo(() => {
    if (Array.isArray(reviews) && reviews.length > 0) {
      const sum = reviews.reduce(
        (acc: number, r: any) => acc + (Number(r.rating) || 5),
        0,
      );
      return parseFloat((sum / reviews.length).toFixed(1));
    }
    return 0;
  }, [reviews]);

  const ratingCount = Array.isArray(reviews) ? reviews.length : 0;

  const rawHeroImage =
    productImageVariants[selectedImage]?.url ||
    productImageVariants[0]?.url ||
    (typeof product?.image === "string" && product.image.trim().length > 0
      ? product.image
      : null) ||
    (Array.isArray(product?.images) &&
      product.images.find(
        (img: any) => typeof img === "string" && img.trim().length > 0,
      )) ||
    "/logo.png";

  const heroImage = getOptimizedImageUrl(rawHeroImage, 800, "auto");

  const currentPrice = selectedOffer?.price ?? selectedSize?.price ?? product?.price ?? 0;
  const currentOriginalPrice =
    selectedOffer?.originalPrice ?? selectedSize?.originalPrice ?? product?.originalPrice;
  const packOffers = [
    {
      label: "1 pack",
      packQuantity: 1,
      price: product?.price ?? 0,
      originalPrice: product?.originalPrice,
    },
    ...(Array.isArray(product?.offers) ? product.offers : []),
  ];

  const handleSelectImage = (index: number) => {
    if (index < 0 || index >= productImageVariants.length) return;
    setIsMainImageLoaded(false);
    setSelectedImage(index);
  };

  const isOutOfStock =
    product?.inStock === false ||
    (typeof product?.stock === "number" && product.stock <= 0) ||
    (typeof product?.countInStock === "number" && product.countInStock <= 0);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Sorry, this product is currently out of stock!");
      return;
    }
    addItem({
      _id: product._id,
      name: product.name,
      price: currentPrice,
      quantity,
      image:
        productImageVariants[selectedImage]?.url ||
        productImageVariants[0]?.url ||
        "",
      size: selectedOffer?.label || selectedSize?.name,
    });
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("Sorry, this product is currently out of stock!");
      return;
    }
    addItem({
      _id: product._id,
      name: product.name,
      price: currentPrice,
      quantity,
      image:
        productImageVariants[selectedImage]?.url ||
        productImageVariants[0]?.url ||
        "",
      size: selectedOffer?.label || selectedSize?.name,
    });
    router.push("/checkout");
  };

  const handleWhatsAppOrder = () => {
    if (isOutOfStock) {
      toast.error("Sorry, this product is currently out of stock!");
      return;
    }
    const cleanPhone = (whatsappNumber || "923023735860").replace(
      /[^0-9]/g,
      "",
    );
    const priceToUse = selectedOffer?.price || selectedSize?.price
      ? selectedOffer?.price || selectedSize.price
      : typeof product?.newPrice === "number"
        ? product.newPrice
        : product?.price || 0;

    const pageUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://homyorganic.store/products/${product?.slug || product?._id}`;

    let message = `Hello Homy Organic! 👋\n\nI want to place an order for this product:\n\n`;
    message += `🛍️ *Product:* ${product?.name || "Product"}\n`;
    if (selectedOffer?.label || selectedSize?.name) {
      message += `🏷️ *Size / Option:* ${selectedOffer?.label || selectedSize.name}\n`;
    }
    message += `💰 *Unit Price:* ${formatPrice(priceToUse)}\n`;
    message += `🔢 *Quantity:* ${quantity}\n`;
    message += `💵 *Total Amount:* ${formatPrice(priceToUse * quantity)}\n`;
    message += `🔗 *Product Link:* ${pageUrl}\n\n`;
    message += `Please confirm my order. Thank you!`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success("Link copied!");
    } catch (_err) {
      toast.error("Failed to copy link");
    }

    if (shareTimeoutRef.current) {
      clearTimeout(shareTimeoutRef.current);
    }
    setSharePopup("Link copied!");
    shareTimeoutRef.current = setTimeout(() => setSharePopup(null), 2200);
  };

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const benefitsList: string[] = Array.isArray(product?.keyBenefits)
    ? product.keyBenefits.filter(Boolean)
    : typeof product?.keyBenefits === "string"
      ? product.keyBenefits
          .split(/\r?\n/)
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

  const ingredientsList: string[] = Array.isArray(product?.naturalIngredients)
    ? product.naturalIngredients.filter(Boolean)
    : typeof product?.naturalIngredients === "string"
      ? product.naturalIngredients
          .split(/\r?\n/)
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (errorMessage || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-neutral-800">
          {errorMessage || "Product not found."}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={fetchProduct}
            className="px-4 py-2 rounded-full bg-black text-white hover:bg-neutral-900"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/products")}
            className="px-4 py-2 rounded-full border border-neutral-300 text-neutral-800 hover:border-neutral-500"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: productImageVariants.map((v: any) => v.url),
    description: product.description || product.name,
    sku: product._id,
    brand: {
      "@type": "Brand",
      name: product.brand || "Homy Organic",
    },
    offers: {
      "@type": "Offer",
      url: typeof window !== "undefined" ? window.location.href : "",
      priceCurrency: "PKR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Homy Organic",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "PKR",
        },
        shippingDestination: [
          {
            "@type": "DefinedRegion",
            addressCountry: "PK",
          },
        ],
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(product.ratings > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratings,
            reviewCount: reviews.length || 1,
          },
        }
      : {}),
  };

  const handlePrevImage = () => {
    if (productImageVariants.length <= 1) return;
    setSelectedImage((prev) =>
      prev === 0 ? productImageVariants.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    if (productImageVariants.length <= 1) return;
    setSelectedImage((prev) =>
      prev === productImageVariants.length - 1 ? 0 : prev + 1,
    );
  };

  useEffect(() => {
    if (productImageVariants.length <= 1) return;
    const sliderTimer = setInterval(() => {
      setSelectedImage((prev) =>
        prev === productImageVariants.length - 1 ? 0 : prev + 1,
      );
    }, 4500);
    return () => clearInterval(sliderTimer);
  }, [productImageVariants.length]);

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-white text-gray-900">
      {/* Google Rich Snippets SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Main Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Side Gallery Container (Main Image Box + Thumbnails Below) */}
          <div className="lg:col-span-6 flex flex-col space-y-4 w-full">
            {/* Main Product Image Container */}
            <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[480px] md:min-h-[540px] w-full group">
              {/* Main Image */}
              {heroImage && (
                <img
                  src={heroImage}
                  alt={product.name}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-auto max-h-[440px] sm:max-h-[520px] md:max-h-[580px] object-contain rounded-2xl transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {productImageVariants.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous product image"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next product image"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Center Red Outline Out of Stock Badge (Sharp - No rounded corners) */}
              {isOutOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-3">
                  <div className="bg-transparent text-red-600 font-extrabold text-xs sm:text-sm tracking-widest uppercase px-4 py-1.5 rounded-none border-2 border-red-600 text-center shadow-2xs">
                    Out of Stock
                  </div>
                </div>
              )}
            </div>

            {/* Product Thumbnails Placed Below Main Image (Strict 100% Sharp Square Boxes) */}
            {productImageVariants.length > 1 && (
              <div className="flex items-center justify-center gap-3 overflow-x-auto py-1 px-2">
                {productImageVariants.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectImage(idx)}
                    style={{ borderRadius: "0px" }}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 aspect-square !rounded-none overflow-hidden border-2 transition-all cursor-pointer bg-white p-1 shrink-0 ${
                      selectedImage === idx
                        ? " ring-2 ring-black/20 scale-105 shadow-sm opacity-100"
                        : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(img.url, 140, "auto:eco")}
                      alt=""
                      style={{ borderRadius: "0px" }}
                      className="w-full h-full object-contain !rounded-none"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Details & Action Buttons */}
          <div className="lg:col-span-6 flex flex-col space-y-5">
            {/* Brand / Store Header & Weight */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
              <p className="font-semibold text-gray-500 tracking-tight">
                {product.brand || "Homy Organic"}
              </p>
              {product.weight && (
                <span className="text-gray-500 font-medium">
                  Net Vol / Weight:{" "}
                  <span className="font-semibold text-gray-800">{product.weight}</span>
                </span>
              )}
            </div>

            {/* Product Title & Share Button */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tight leading-snug">
                  {product.name}
                </h1>
                {product.subTitle && (
                  <p className="text-sm sm:text-base text-[#9E6B24] font-medium mt-1">
                    {product.subTitle}
                  </p>
                )}
              </div>

              <div className="relative shrink-0 pt-1">
                {sharePopup && (
                  <div className="absolute -top-8 right-0 z-30 bg-black text-white text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                    {sharePopup}
                  </div>
                )}
                <button
                  onClick={handleShare}
                  type="button"
                  title="Share product"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-900 transition-all cursor-pointer text-xs sm:text-sm font-semibold border border-gray-200/80 active:scale-95"
                >
                  <FiShare2 className="w-3.5 h-3.5 text-gray-700" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Ratings from API */}
            {ratingCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400 text-lg gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.round(calculatedRating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-base text-gray-800 font-bold">
                  {calculatedRating.toFixed(1)} ({ratingCount}{" "}
                  {ratingCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Price Tag */}
            <div className="flex items-baseline gap-3.5 pt-1">
              <span
                className="text-4xl sm:text-5xl font-extrabold text-gray-900"
                style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif" }}
              >
                {formatPrice(currentPrice)}
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span
                  className="text-xl sm:text-2xl font-normal text-gray-400 line-through"
                  style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif" }}
                >
                  {formatPrice(currentOriginalPrice)}
                </span>
              )}
            </div>

            {/* Subtext: Shipping */}
            <p className="text-base text-gray-700 font-normal">
              <span className="underline cursor-pointer font-semibold">
                Shipping
              </span>{" "}
              calculated at checkout.
            </p>

            {/* Stock Status (Only shown when Out of Stock) */}
            {isOutOfStock && (
              <div className="flex items-center gap-2 text-base text-red-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Out of stock</span>
              </div>
            )}

            {/* Dual Minimal Social Proof Badges (Full width on mobile) */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 pt-1 w-full">
              {/* Badge 1: Orders Badge (Green Save Banner Style) */}
              <div className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-xl bg-[#BDE1CC]/60 border border-[#A2D3B3] text-xs sm:text-sm text-emerald-950 font-normal">
                <FiShoppingBag className="w-4 h-4 text-[#276749] shrink-0" />
                <span>
                  <span className="font-medium text-emerald-950">{boughtCount} orders</span> in the last 24 hours
                </span>
              </div>

              {/* Badge 2: Live Viewers Badge */}
              <div className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-xl bg-transparent border border-gray-300/80 text-xs sm:text-sm text-gray-700 font-normal">
                <FiEye className="w-4 h-4 text-gray-500 shrink-0" />
                <span>
                  <span className="font-medium text-gray-900">{liveViewers} people</span> viewing right now
                </span>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-base sm:text-lg text-gray-800 font-normal leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Value Pack Included Items */}
            {includedItems.length > 0 && (
              <div className="pt-2">
                <div className="border border-gray-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Items Included in this Pack ({includedItems.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0)}):
                  </p>
                  <div className="space-y-1.5 pt-1 border-t border-gray-100">
                    {includedItems.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 text-sm sm:text-base text-gray-800"
                      >
                        <span className="font-semibold text-gray-900">• {item.name}</span>
                        <span className="font-extrabold text-black shrink-0">
                          {item.quantity}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {packOffers.length > 1 && (
              <div className="pt-2 space-y-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Buy more, save more</h2>
                <div className="space-y-2">
                  {packOffers.map((offer: any, idx: number) => {
                    const isSelected = idx === 0
                      ? !selectedOffer
                      : selectedOffer?.label === offer.label;
                    const offerOriginalPrice = idx === 0
                      ? offer.originalPrice
                      : offer.originalPrice ?? ((product?.originalPrice ?? product?.price ?? 0) * (offer.packQuantity || idx + 1));
                    return (
                      <button key={`${offer.label}-${idx}`} type="button" onClick={() => setSelectedOffer(idx === 0 ? null : offer)} className={`relative w-full text-left border-2 rounded-xl px-4 py-3 transition-all ${isSelected ? "border-[#687b63] bg-[#f0eee8]" : "border-gray-300 bg-white hover:border-gray-500"}`}>
                        {offer.isPopular && <span className="absolute -top-3 right-4 bg-[#B9853A] text-white text-xs font-extrabold px-3 py-1 rounded-md">Most popular</span>}
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#687b63]" : "border-gray-300"}`}>{isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#687b63]" />}</span>
                          <span className="font-extrabold text-lg flex-1">{offer.label}</span>
                          <span className="font-extrabold text-lg text-[#687b63]">{formatPrice(offer.price)}</span>
                        </div>
                        {(offer.freeShipping || offer.savingText) && <div className="ml-8 mt-2 text-sm text-gray-600">{offer.freeShipping && <span className="inline-block bg-[#adb5a9] text-gray-800 px-3 py-1 rounded-full mr-2">Free shipping</span>}{offer.savingText}</div>}
                        {offerOriginalPrice > 0 && <span className="ml-8 text-sm text-gray-400 line-through">{formatPrice(offerOriginalPrice)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size / Option Selector */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wider">
                    Select Option / Variant:
                  </span>
                  {selectedSize?.name && (
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      Selected: {selectedSize.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((s: any, idx: number) => {
                    const isSelected = selectedSize?.name === s.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2.5 rounded-none text-sm sm:text-base font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "border-black bg-black text-white shadow-xs"
                            : "border-gray-300 bg-white text-gray-800 hover:border-gray-500"
                        }`}
                      >
                        <span>{s.name}</span>
                        {s.price && (
                          <span
                            className={
                              isSelected
                                ? "text-gray-300 font-normal"
                                : "text-gray-600 font-normal"
                            }
                          >
                            ({formatPrice(s.price)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart Row */}
            <div className="pt-3 space-y-3">
              {/* Simple Clean Discount Banner */}
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <div className="text-sm sm:text-base font-bold text-black flex items-center justify-between bg-[#BDE1CC] px-4 py-2.5 rounded-none border border-[#A2D3B3]">
                  <span className="text-black font-bold">
                    Save {formatPrice(currentOriginalPrice - currentPrice)} on
                    this item
                  </span>
                  <span
                    className="bg-[#276749] text-white text-xs sm:text-sm font-extrabold px-3 py-0.5 rounded-none uppercase"
                  >
                    {Math.round(
                      ((currentOriginalPrice - currentPrice) /
                        currentOriginalPrice) *
                        100,
                    )}
                    % OFF
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* Quantity Box */}
                  <div className="flex items-center justify-between border border-black rounded-xl px-4 py-3.5 w-32 shrink-0 bg-white text-lg font-bold">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-gray-600 hover:text-black font-bold text-xl cursor-pointer"
                    >
                      −
                    </button>
                    <span className="font-bold text-gray-900 text-lg">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-gray-600 hover:text-black font-bold text-xl cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3.5 sm:py-4 px-6 rounded-xl border border-black font-extrabold text-lg sm:text-xl transition-all duration-200 text-center ${
                      isOutOfStock
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-50 text-black active:scale-[0.98] cursor-pointer shadow-xs"
                    }`}
                  >
                    {isOutOfStock ? "Out of stock" : "Add to cart"}
                  </button>
                </div>

                {/* Buy it now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-extrabold text-lg sm:text-xl transition-all duration-200 text-center ${
                    isOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-neutral-800 text-white active:scale-[0.98] cursor-pointer shadow-xs"
                  }`}
                >
                  {isOutOfStock ? "Out of stock" : "Buy it now"}
                </button>

                {/* Order via WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 px-6 rounded-xl border border-gray-300 font-bold text-base sm:text-lg transition-all text-center flex items-center justify-center gap-2.5 ${
                    isOutOfStock
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "text-gray-900 hover:bg-gray-50 active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  <svg viewBox="0 0 100 100" className="w-6 h-6 shrink-0">
                    <defs>
                      <linearGradient
                        id="wa-btn-green-grad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#25D366" />
                        <stop offset="100%" stopColor="#128C7E" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#wa-btn-green-grad)"
                      d="M 50,4 C 24.6,4 4,24.6 4,50 C 4,58.5 6.3,66.4 10.3,73.2 L 4,96 L 27.4,89.9 C 34,93.6 41.7,95.7 50,95.7 C 75.4,95.7 96,75.1 96,49.7 C 96,24.4 75.4,4 50,4 Z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M 68.2,62.8 C 66.9,62.1 60.5,59.0 59.3,58.6 C 58.1,58.1 57.3,58.1 56.4,59.3 C 55.6,60.5 53.2,63.4 52.5,64.2 C 51.7,65.0 51.0,65.1 49.7,64.4 C 48.4,63.8 44.2,62.4 39.2,57.9 C 35.3,54.4 32.7,50.2 31.9,48.9 C 31.2,47.6 31.8,47.0 32.5,46.3 C 33.1,45.7 33.8,44.7 34.4,44.0 C 35.0,43.3 35.3,42.7 35.7,41.9 C 36.1,41.1 35.9,40.4 35.6,39.7 C 35.3,39.0 32.3,31.6 31.1,28.7 C 29.9,25.9 28.7,26.3 27.8,26.2 C 27.0,26.2 26.0,26.2 25.0,26.2 C 24.1,26.2 22.6,26.6 21.3,28.0 C 20.0,29.4 16.4,32.8 16.4,39.7 C 16.4,46.6 21.4,53.3 22.1,54.2 C 22.8,55.2 32.0,69.3 46.2,75.4 C 49.6,76.9 52.3,77.8 54.4,78.5 C 57.8,79.6 61.0,79.4 63.4,79.0 C 66.2,78.6 71.9,75.6 73.1,72.2 C 74.3,68.8 74.3,65.9 73.9,65.3 C 73.5,64.6 72.6,64.2 71.3,63.5 Z"
                    />
                  </svg>
                  <span>
                    {isOutOfStock ? "Out of stock" : "Order via WhatsApp"}
                  </span>
                </button>
              </div>

              {/* 15-Day Risk-Free Money Back Guarantee */}
              <div className="border border-[#EADBCC] rounded-xl p-3 sm:p-3.5 space-y-1 text-left bg-[#FAF6F0]/30">
                <p className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                  15-Day Risk-Free Money Back Guarantee
                </p>
                <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed">
                  Try our product 100% risk-free. If you are not completely
                  satisfied with your purchase within 15 days of delivery,
                  simply contact our support for a hassle-free full refund.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Specifications Section (Full Width Below) */}
        {!product.isValuePack &&
          (benefitsList.length > 0 ||
            ingredientsList.length > 0 ||
            (typeof product.howToUse === "string" &&
              product.howToUse.trim().length > 0) ||
            (typeof product.precautions === "string" &&
              product.precautions.trim().length > 0) ||
            (typeof product.ourQuality === "string" &&
              product.ourQuality.trim().length > 0)) && (
            <div className="pt-10 border-t border-gray-200 text-left w-full space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight text-left">
                Product Details &amp; Specifications
              </h2>

              <div className="space-y-4 w-full">
                {/* 01. Key Benefits */}
                {benefitsList.length > 0 && (
                  <div className="rounded-none border border-gray-200 hover:border-gray-400 bg-white transition-all duration-200 overflow-hidden text-left shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleSpec("benefits")}
                      className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-colors bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          style={{ borderRadius: "9999px" }}
                          className="w-5 h-5 !rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0"
                        >
                          ✓
                        </span>
                        <h3 className="text-lg sm:text-xl text-gray-900 tracking-tight text-left font-bold">
                          Key Benefits
                        </h3>
                      </div>
                      <span className="text-lg sm:text-xl font-light text-gray-500 ml-2 shrink-0">
                        {openSpec.benefits ? "−" : "+"}
                      </span>
                    </button>

                    {openSpec.benefits && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 text-left border-t border-dashed border-gray-200">
                        <ul className="space-y-3.5 text-left">
                          {benefitsList.map((b: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-base sm:text-lg text-gray-800 font-normal leading-relaxed text-left"
                            >
                              <span
                                style={{ borderRadius: "9999px" }}
                                className="w-5 h-5 !rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0 mt-1"
                              >
                                ✓
                              </span>
                              <span className="text-left">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 02. Natural Ingredients */}
                {ingredientsList.length > 0 && (
                  <div className="rounded-none border border-gray-200 hover:border-gray-400 bg-white transition-all duration-200 overflow-hidden text-left shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleSpec("ingredients")}
                      className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-colors bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          style={{ borderRadius: "9999px" }}
                          className="w-5 h-5 !rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0"
                        >
                          ✓
                        </span>
                        <h3 className="text-lg sm:text-xl text-gray-900 tracking-tight text-left font-bold">
                          Natural Ingredients
                        </h3>
                      </div>
                      <span className="text-lg sm:text-xl font-light text-gray-500 ml-2 shrink-0">
                        {openSpec.ingredients ? "−" : "+"}
                      </span>
                    </button>

                    {openSpec.ingredients && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 text-left border-t border-dashed border-gray-200 space-y-3">
                        {ingredientsList.map((ing: string, i: number) => (
                          <p
                            key={i}
                            className="text-base sm:text-lg text-gray-800 font-normal leading-relaxed text-left"
                          >
                            {ing}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 03. How to Use */}
                {typeof product.howToUse === "string" &&
                  product.howToUse.trim().length > 0 && (
                    <div className="rounded-none border border-gray-200 hover:border-gray-400 bg-white transition-all duration-200 overflow-hidden text-left shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleSpec("howToUse")}
                        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-colors bg-white hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            style={{ borderRadius: "9999px" }}
                            className="w-5 h-5 !rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0"
                          >
                            ✓
                          </span>
                          <h3 className="text-lg sm:text-xl text-gray-900 tracking-tight text-left font-bold">
                            How to Use
                          </h3>
                        </div>
                        <span className="text-lg sm:text-xl font-light text-gray-500 ml-2 shrink-0">
                          {openSpec.howToUse ? "−" : "+"}
                        </span>
                      </button>

                      {openSpec.howToUse && (
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 text-left border-t border-dashed border-gray-200">
                          <p className="text-base sm:text-lg text-gray-800 font-normal leading-relaxed whitespace-pre-line text-left">
                            {product.howToUse}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {/* 04. Precautions */}
                {typeof product.precautions === "string" &&
                  product.precautions.trim().length > 0 && (
                    <div className="rounded-none border border-[#A2D3B3] hover:border-[#276749] bg-[#BDE1CC] transition-all duration-200 overflow-hidden text-left shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleSpec("precautions")}
                        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-colors bg-[#BDE1CC] hover:bg-[#B0D9C1]"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            style={{ borderRadius: "9999px" }}
                            className="w-5 h-5 !rounded-full bg-[#276749]/20 text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0"
                          >
                            ✓
                          </span>
                          <h3 className="text-lg sm:text-xl text-gray-900 tracking-tight text-left font-bold">
                            Precautions &amp; Safety
                          </h3>
                        </div>
                        <span className="text-lg sm:text-xl font-light text-[#1c4d36] ml-2 shrink-0">
                          {openSpec.precautions ? "−" : "+"}
                        </span>
                      </button>

                      {openSpec.precautions && (
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 text-left border-t border-dashed border-[#A2D3B3]">
                          <p className="text-base sm:text-lg text-gray-900 font-normal leading-relaxed whitespace-pre-line text-left">
                            {product.precautions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {/* 05. Quality Assurance */}
                {typeof product.ourQuality === "string" &&
                  product.ourQuality.trim().length > 0 && (
                    <div className="rounded-none border border-gray-200 hover:border-gray-400 bg-white transition-all duration-200 overflow-hidden text-left shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleSpec("quality")}
                        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-colors bg-white hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            style={{ borderRadius: "9999px" }}
                            className="w-5 h-5 !rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0"
                          >
                            ✓
                          </span>
                          <h3 className="text-lg sm:text-xl text-gray-900 tracking-tight text-left font-bold">
                            Our Quality Assurance
                          </h3>
                        </div>
                        <span className="text-lg sm:text-xl font-light text-gray-500 ml-2 shrink-0">
                          {openSpec.quality ? "−" : "+"}
                        </span>
                      </button>

                      {openSpec.quality && (
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 text-left border-t border-dashed border-gray-200">
                          <p className="text-base sm:text-lg text-gray-800 font-normal leading-relaxed whitespace-pre-line text-left">
                            {product.ourQuality}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          )}

        {/* Customer Review Section (Clean Normal Font Weights) */}
        <section className="pt-10 border-t border-gray-100 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 text-center tracking-tight">
            Customer{" "}
            <span className="font-serif italic text-[#B9853B]">Reviews</span>
          </h2>

          {/* Top Summary Card Container */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Column 1: Rating Score */}
            <div className="text-center md:text-left space-y-1 shrink-0 md:pr-8 md:border-r md:border-gray-100">
              <div className="text-3xl sm:text-4xl font-medium text-gray-900 tracking-tight">
                {calculatedRating > 0 ? calculatedRating.toFixed(1) : "5.0"}/5.0
              </div>
              <div className="flex text-amber-400 text-sm justify-center md:justify-start gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.round(calculatedRating) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 font-normal">
                {ratingCount} {ratingCount === 1 ? "Review" : "Reviews"}
              </p>
            </div>

            {/* Column 2: Rating Distribution & See All Reviews */}
            <div className="flex-1 max-w-md w-full space-y-1.5 text-center">
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  ratingDistribution[star as keyof typeof ratingDistribution] ||
                  0;
                const percent =
                  ratingCount > 0 ? (count / ratingCount) * 100 : 0;
                return (
                  <div
                    key={star}
                    className="flex items-center gap-2 text-xs text-gray-600"
                  >
                    <span className="w-16 text-right font-normal shrink-0 flex items-center justify-end gap-0.5">
                      {[...Array(star)].map((_, i) => (
                        <span key={i} className="text-black text-[10px]">
                          ★
                        </span>
                      ))}
                      {[...Array(5 - star)].map((_, i) => (
                        <span key={i} className="text-gray-300 text-[10px]">
                          ☆
                        </span>
                      ))}
                    </span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-4 text-right font-normal text-gray-700 text-xs shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="text-xs font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  {showAllReviews ? "Hide Reviews" : "See All Reviews"}
                </button>
              </div>
            </div>

            {/* Column 3: Write A Review Button */}
            <div className="shrink-0 md:pl-8 md:border-l md:border-gray-100 text-center">
              <button
                type="button"
                onClick={() => setShowWriteReviewModal(true)}
                className="bg-[#181818] hover:bg-black text-white text-xs sm:text-sm font-medium px-7 py-3 rounded-2xl transition-all cursor-pointer shadow-sm active:scale-98"
              >
                Write A Review
              </button>
            </div>
          </div>

          {/* Customer Reviews Cards Grid (Hidden by default, shown when 'See All Reviews' clicked) */}
          {showAllReviews && (
            <div className="space-y-4 pt-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-gray-500">
                  Showing {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-normal text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-2xs hover:bg-gray-50 cursor-pointer"
                >
                  <span>⇆ Sort</span>
                </button>
              </div>

              {reviews.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-6">
                  No reviews submitted yet. Be the first to write a review!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                  {reviews.map((rev: any) => {
                    return (
                      <div
                        key={rev._id}
                        className="relative bg-white p-5 rounded-3xl border border-gray-100 space-y-3 shadow-xs hover:shadow-md transition-shadow"
                      >
                        <div className="text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <h4 className="text-xs font-semibold text-gray-900">
                              {rev.name}
                            </h4>
                            {rev.isVerified && <VerifiedBuyerBadge />}
                          </div>

                          <div className="flex justify-center text-amber-400 text-xs gap-0.5 pt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 font-normal leading-relaxed text-center">
                          {rev.comment}
                        </p>

                        <p className="text-[10px] text-gray-400 text-center pt-1 font-normal">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Write A Review Modal Popup (Centered, No Page Scroll, High Z-Index) */}
        {showWriteReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200 my-auto max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Write A Review
                </h3>
                <button
                  type="button"
                  onClick={() => setShowWriteReviewModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Review Form */}
              <form
                onSubmit={async (e) => {
                  await handleReviewSubmit(e);
                  setShowWriteReviewModal(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewerName || session?.user?.name || ""}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-transform hover:scale-110 cursor-pointer ${
                          star <= rating ? "text-amber-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-gray-600 ml-2">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Review Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:border-black focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWriteReviewModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold transition-colors disabled:bg-gray-300 cursor-pointer"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recommended Value Packs Suggestions */}
        {!suggestionsLoading && valuePacks.length > 0 && (
          <section className="pt-8 border-t border-gray-100 space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="mt-0.5 text-xl sm:text-2xl font-light text-gray-900 tracking-tight">
                  Recommended{" "}
                  <span className="font-serif italic text-[#B9853B]">
                    Value Packs
                  </span>
                </h2>
              </div>
              <Link
                href="/products?valuePack=true"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-black text-gray-800 hover:text-white transition-all text-xs font-medium border border-gray-200/80 active:scale-95 shrink-0"
              >
                <span>View All Packs</span>
                <span className="text-xs">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {valuePacks.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* Other Organic Products Suggestions */}
        {!suggestionsLoading && relatedProducts.length > 0 && (
          <section className="pt-8 border-t border-gray-100 space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-light text-gray-900 tracking-tight">
                  You May{" "}
                  <span className="font-serif italic text-[#B9853B]">
                    Also Like
                  </span>
                </h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-black text-gray-800 hover:text-white transition-all text-xs font-medium border border-gray-200/80 active:scale-95 shrink-0"
              >
                <span>Explore Shop</span>
                <span className="text-xs">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
