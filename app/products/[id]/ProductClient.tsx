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
  FiCheck,
  FiPlay,
  FiPause,
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
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [sharePopup, setSharePopup] = useState<string | null>(null);
  const [isBuyNowAnimating, setIsBuyNowAnimating] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("923023735860");
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const dialogVideoRef = useRef<HTMLVideoElement | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement | null>(null);
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
    if (showWriteReviewModal || activeVideoIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showWriteReviewModal, activeVideoIndex]);

  const productVideos: string[] = useMemo(() => {
    if (Array.isArray(product?.videos)) {
      return product.videos
        .map((v: any) => (typeof v === "string" ? v.trim() : v?.url || ""))
        .filter((v: string) => typeof v === "string" && v.length > 0);
    }
    if (typeof product?.video === "string" && product.video.trim().length > 0) {
      return [product.video.trim()];
    }
    return [];
  }, [product?.videos, product?.video]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeVideoIndex === null) return;
      if (e.key === "Escape") {
        setActiveVideoIndex(null);
      } else if (e.key === "ArrowLeft") {
        if (productVideos.length > 1) {
          setActiveVideoIndex((prev) =>
            prev === null || prev === 0 ? productVideos.length - 1 : prev - 1,
          );
        }
      } else if (e.key === "ArrowRight") {
        if (productVideos.length > 1) {
          setActiveVideoIndex((prev) =>
            prev === null || prev === productVideos.length - 1 ? 0 : prev + 1,
          );
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideoIndex, productVideos]);

  useEffect(() => {
    if (activeVideoIndex !== null) {
      setIsVideoPlaying(true);
    }
  }, [activeVideoIndex]);

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
    if (mainSwiper && !mainSwiper.destroyed) {
      mainSwiper.slideTo(0);
    }
    if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }
    setSelectedOffer(null);
  }, [product?._id]);

  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeThumb = thumbnailContainerRef.current.children[selectedImage] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedImage]);

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
    if (mainSwiper && !mainSwiper.destroyed) {
      mainSwiper.slideTo(index);
    }
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

  const handleDeviceShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    if (!navigator.share) {
      await handleShare();
      return;
    }

    try {
      await navigator.share({
        title: product?.name || "Homy Organic product",
        text: "Check out this product",
        url,
      });
    } catch {
      // The user may close the native share sheet without choosing an option.
    }
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
    if (mainSwiper && !mainSwiper.destroyed) {
      mainSwiper.slidePrev();
    } else {
      setSelectedImage((prev) =>
        prev === 0 ? productImageVariants.length - 1 : prev - 1,
      );
    }
  };

  const handleNextImage = () => {
    if (mainSwiper && !mainSwiper.destroyed) {
      mainSwiper.slideNext();
    } else {
      setSelectedImage((prev) =>
        prev === productImageVariants.length - 1 ? 0 : prev + 1,
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-6 text-stone-900 sm:py-10">
      {/* Google Rich Snippets SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* Subtle Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-stone-900 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Main Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Side Gallery Container (Swiper Slider + Thumbnails Below) */}
          <div className="lg:col-span-6 flex flex-col space-y-3 sm:space-y-4 w-full">
            {/* Main Product Image Swiper Container */}
            <div className="relative mx-auto flex aspect-square w-full max-w-[600px] select-none items-center justify-center overflow-hidden rounded-2xl bg-transparent group">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={12}
                slidesPerView={1}
                onSwiper={setMainSwiper}
                onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
                initialSlide={selectedImage}
                grabCursor={true}
                speed={350}
                resistanceRatio={0.7}
                className="w-full h-full rounded-2xl bg-transparent"
              >
                {productImageVariants.map((img: any, idx: number) => (
                  <SwiperSlide
                    key={idx}
                    className="relative flex aspect-square w-full items-center justify-center bg-transparent"
                  >
                    <img
                      src={getOptimizedImageUrl(img.url, 800, "auto")}
                      alt={`${product.name} - view ${idx + 1}`}
                      loading={idx === 0 ? "eager" : "lazy"}
                      fetchPriority={idx === 0 ? "high" : "auto"}
                      className="h-full w-full scale-[1.02] rounded-2xl object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {productImageVariants.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous product image"
                    className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm transition-all hover:bg-white sm:flex sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next product image"
                    className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm transition-all hover:bg-white sm:flex sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  >
                    <FiChevronRight size={20} />
                  </button>

                  {/* Mobile floating index pill */}
                  <div className="absolute bottom-3 right-3 z-10 sm:hidden bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full pointer-events-none">
                    {selectedImage + 1} / {productImageVariants.length}
                  </div>
                </>
              )}

              {/* Center Out of Stock Badge */}
              {isOutOfStock && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-3 bg-white/60 backdrop-blur-[1px] rounded-2xl">
                  <div className="bg-white text-red-600 font-bold text-xs sm:text-sm tracking-widest uppercase px-5 py-2 rounded-lg border border-red-400 shadow-sm text-center">
                    Out of Stock
                  </div>
                </div>
              )}
            </div>

            {/* Product image previews below the main image (visible on mobile and desktop) */}
            {productImageVariants.length > 1 && (
              <div
                ref={thumbnailContainerRef}
                className="hide-scrollbar flex flex-nowrap items-center justify-start gap-2 sm:gap-3 overflow-x-auto px-1 py-1 w-full"
              >
                {productImageVariants.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectImage(idx)}
                    aria-label={`View product image ${idx + 1}`}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border bg-transparent p-1 transition-all ${
                      selectedImage === idx
                        ? "border-black ring-1 ring-black shadow-xs opacity-100"
                        : "border-[#E8E4DC] opacity-60 hover:opacity-100 hover:border-stone-400"
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(img.url, 180, "auto:eco")}
                      alt=""
                      className="h-full w-full rounded-lg object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Details & Action Buttons */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            {/* Category / Subtitle */}
            <div className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
              {product.brand || "Homy Organic"}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Ratings from API */}
            {ratingCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex text-[#D99A26] text-sm gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.round(calculatedRating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-800">
                  {calculatedRating.toFixed(1)}
                </span>
                <span className="text-xs text-stone-500">
                  ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Price Tag */}
            <div className="flex items-baseline gap-3 pt-1">
              <span
                className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight"
                style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif" }}
              >
                {formatPrice(currentPrice)}
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span
                  className="text-lg sm:text-xl font-normal text-stone-400 line-through"
                  style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif" }}
                >
                  {formatPrice(currentOriginalPrice)}
                </span>
              )}
            </div>

            {/* Product Weight & Shipping */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
              {product.weight && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black text-white text-[11px] font-medium tracking-wide">
                  Net Weight: <span className="font-semibold text-white">{product.weight}</span>
                </span>
              )}
              {product.weight && <span className="text-stone-300">•</span>}
              <span>
                Shipping calculated at checkout.
              </span>
            </div>

            {/* Stock Status */}
            {isOutOfStock && (
              <div className="text-xs text-red-600 font-semibold">
                Currently out of stock
              </div>
            )}

            {/* Minimal Social Proof (Inline, No Cards) */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <FiShoppingBag className="w-3.5 h-3.5 text-stone-700" />
                <span>
                  <strong className="text-stone-900 font-semibold">{boughtCount} orders</strong> in last 24h
                </span>
              </span>
              <span className="text-stone-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <FiEye className="w-3.5 h-3.5 text-stone-700" />
                <span>
                  <strong className="text-stone-900 font-semibold">{liveViewers} people</strong> viewing
                </span>
              </span>
            </div>

            {/* Buy More, Save More (Bundle Tiers) */}
            {packOffers.length > 1 && (
              <div className="w-full space-y-2.5 pt-2">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-stone-200" />
                  <h2 className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-stone-700">
                    Buy More, Save More
                  </h2>
                  <span className="h-px flex-1 bg-stone-200" />
                </div>
                <div className="space-y-2.5">
                  {packOffers.map((offer: any, idx: number) => {
                    const isSelected =
                      offer.packQuantity === 1
                        ? !selectedOffer
                        : selectedOffer?.packQuantity === offer.packQuantity;

                    const baseUnitPrice = product?.price || 0;
                    const qty = offer.packQuantity || idx + 1;
                    const offerOriginalPrice =
                      idx === 0
                        ? offer.originalPrice ||
                          (product?.originalPrice && product.originalPrice > product.price
                            ? product.originalPrice
                            : 0)
                        : offer.originalPrice ?? baseUnitPrice * qty;

                    const totalOriginalForCalc =
                      offerOriginalPrice > offer.price
                        ? offerOriginalPrice
                        : baseUnitPrice * qty;

                    let savePercent = 0;
                    if (totalOriginalForCalc > offer.price && totalOriginalForCalc > 0) {
                      savePercent = Math.round(
                        ((totalOriginalForCalc - offer.price) / totalOriginalForCalc) * 100,
                      );
                    } else if (offer.savingText) {
                      const match = offer.savingText.match(/(\d+)%/);
                      if (match) savePercent = parseInt(match[1], 10);
                    }

                    const displayLabel = offer.label
                      ? offer.label.toLowerCase().includes("pack")
                        ? `Buy ${qty}`
                        : offer.label
                      : `Buy ${qty}`;

                    const isBestValue = offer.isPopular || idx >= 2;

                    return (
                      <button
                        key={`${offer.packQuantity}-${idx}`}
                        type="button"
                        onClick={() =>
                          setSelectedOffer(offer.packQuantity === 1 ? null : offer)
                        }
                        className={`relative flex w-full cursor-pointer items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-black bg-white shadow-2xs"
                            : "border-stone-300 bg-white hover:border-stone-400"
                        }`}
                      >
                        {/* Top-right Best value badge */}
                        {isBestValue && (
                          <span className="absolute -top-2.5 right-3 rounded bg-stone-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                            Best value
                          </span>
                        )}

                        {/* Left Side: Radio + Label + Save Badge + Free Gift Badge */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all ${
                              isSelected ? "border-black" : "border-stone-300"
                            }`}
                          >
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-black" />
                            )}
                          </span>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm sm:text-base font-bold text-stone-900">
                              {displayLabel}
                            </span>

                            {/* Save % badge */}
                            {savePercent > 0 && (
                              <span className="inline-flex items-center rounded bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-800">
                                Save {savePercent}%
                              </span>
                            )}

                            {/* Only + Free gift if gift exists */}
                            {offer.gift && (
                              <span className="inline-flex items-center rounded bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-800">
                                + Free gift
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Price + Strikethrough Price */}
                        <div className="shrink-0 pl-3 text-right">
                          <span className="block text-sm sm:text-base font-bold text-stone-900">
                            {formatPrice(offer.price)}
                          </span>
                          {offerOriginalPrice > offer.price && (
                            <span className="block text-[11px] font-normal text-stone-400 line-through">
                              {formatPrice(offerOriginalPrice)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Value Pack Included Items (Minimal List) */}
            {includedItems.length > 0 && (
              <div className="pt-2 text-xs text-stone-700 space-y-1.5 border-t border-stone-200">
                <p className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  Included in this Pack ({includedItems.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0)} items):
                </p>
                <div className="space-y-1">
                  {includedItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-stone-700"
                    >
                      <span>• {item.name}</span>
                      <span className="font-bold text-black">{item.quantity}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size / Option Selector */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Select Option:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((s: any, idx: number) => {
                    const isSelected = selectedSize?.name === s.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-stone-300 bg-white text-stone-800 hover:border-stone-400"
                        }`}
                      >
                        <span>{s.name}</span>
                        {s.price && (
                          <span className={isSelected ? "text-stone-300 ml-1 font-normal" : "text-stone-500 ml-1 font-normal"}>
                            ({formatPrice(s.price)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-1 pb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Quantity
              </span>
              <div className="inline-flex items-center rounded-xl border border-stone-300 bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-100 hover:text-black active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiMinus size={13} />
                </button>
                <span className="w-9 text-center font-bold text-sm text-stone-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  disabled={isOutOfStock}
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-100 hover:text-black active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiPlus size={13} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 space-y-2.5">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-6 rounded-xl border-2 border-black font-bold text-base transition-all text-center ${
                  isOutOfStock
                    ? "border-stone-300 text-stone-400 cursor-not-allowed"
                    : "bg-white hover:bg-stone-50 text-black active:scale-[0.99] cursor-pointer"
                }`}
              >
                {isOutOfStock ? "Out of stock" : "Add to cart"}
              </button>

              {/* Buy it now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                onTouchStart={() => setIsBuyNowAnimating(true)}
                onAnimationEnd={(event) => {
                  if (event.target === event.currentTarget) {
                    setIsBuyNowAnimating(false);
                  }
                }}
                disabled={isOutOfStock}
                className={`buy-now-button relative w-full overflow-hidden rounded-xl px-6 py-3.5 text-base font-bold transition-all text-center ${
                  isBuyNowAnimating ? "is-buy-now-animating" : ""
                } ${
                  isOutOfStock
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : "border-2 border-black bg-black hover:bg-stone-900 text-white active:scale-[0.99] cursor-pointer"
                }`}
              >
                {!isOutOfStock && <span className="buy-now-shine" aria-hidden="true" />}
                <span className="relative z-10">
                  {isOutOfStock ? "Out of stock" : "Buy it now"}
                </span>
              </button>

              {/* Share Button */}
              <div className="relative flex justify-center pt-0.5">
                {sharePopup && (
                  <div className="absolute -top-7 right-0 z-30 bg-black px-2.5 py-0.5 text-xs font-medium text-white rounded-full whitespace-nowrap">
                    {sharePopup}
                  </div>
                )}
                <button
                  onClick={handleDeviceShare}
                  type="button"
                  title="Share product"
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium text-stone-600 hover:text-black transition-colors"
                >
                  <FiShare2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Order via WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                disabled={isOutOfStock}
                className={`w-full py-3 px-6 rounded-xl border border-stone-300 font-semibold text-sm transition-all text-center flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? "border-stone-200 text-stone-400 cursor-not-allowed"
                    : "text-stone-900 bg-white hover:bg-stone-50 active:scale-[0.99] cursor-pointer"
                }`}
              >
                <svg viewBox="0 0 100 100" className="w-5 h-5 shrink-0">
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

              {/* Minimal 3 Features Row (Clean Lines, No Clunky Cards) */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-b border-stone-200 py-3 text-center text-xs text-stone-700">
                <div className="flex flex-col items-center gap-0.5">
                  <FiTruck className="w-4 h-4 text-stone-800 mb-0.5" />
                  <span className="font-semibold text-stone-900">Fast Delivery</span>
                  <span className="text-[11px] text-stone-500">Across Pakistan</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 border-x border-stone-200 px-1">
                  <FiPackage className="w-4 h-4 text-stone-800 mb-0.5" />
                  <span className="font-semibold text-stone-900">100% Pure</span>
                  <span className="text-[11px] text-stone-500">Chemical Free</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <FiShield className="w-4 h-4 text-stone-800 mb-0.5" />
                  <span className="font-semibold text-stone-900">15-Day Return</span>
                  <span className="text-[11px] text-stone-500">Money Back</span>
                </div>
              </div>

              {/* Product Description - Minimal Editorial Layout */}
              {product.description && (
                <div className="pt-2 text-stone-800 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details & Specifications (Minimal Editorial Divider Rows, No Cards) */}
        {!product.isValuePack &&
          (benefitsList.length > 0 ||
            ingredientsList.length > 0 ||
            (typeof product.howToUse === "string" &&
              product.howToUse.trim().length > 0) ||
            (typeof product.precautions === "string" &&
              product.precautions.trim().length > 0) ||
            (typeof product.ourQuality === "string" &&
              product.ourQuality.trim().length > 0)) && (
            <div className="pt-6 border-t border-stone-200 text-left w-full space-y-1">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 pb-2">
                Product Details &amp; Specifications
              </h2>

              <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
                {/* 01. Key Benefits */}
                {benefitsList.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSpec("benefits")}
                      className="w-full py-4 flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0">
                          ✓
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-black">
                          Key Benefits
                        </span>
                      </div>
                      <span className="text-base font-light text-stone-500">
                        {openSpec.benefits ? "−" : "+"}
                      </span>
                    </button>

                    {openSpec.benefits && (
                      <div className="pb-4 pt-1 text-left">
                        <ul className="space-y-2 text-left">
                          {benefitsList.map((b: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 leading-relaxed"
                            >
                              <span className="w-4 h-4 rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                ✓
                              </span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 02. Natural Ingredients */}
                {ingredientsList.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSpec("ingredients")}
                      className="w-full py-4 flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0">
                          ✓
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-black">
                          Natural Ingredients
                        </span>
                      </div>
                      <span className="text-base font-light text-stone-500">
                        {openSpec.ingredients ? "−" : "+"}
                      </span>
                    </button>

                    {openSpec.ingredients && (
                      <div className="pb-4 pt-1 text-left space-y-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {ingredientsList.map((ing: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span>{ing}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 03. How to Use */}
                {typeof product.howToUse === "string" &&
                  product.howToUse.trim().length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSpec("howToUse")}
                        className="w-full py-4 flex items-center justify-between text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0">
                            ✓
                          </span>
                          <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-black">
                            How to Use
                          </span>
                        </div>
                        <span className="text-base font-light text-stone-500">
                          {openSpec.howToUse ? "−" : "+"}
                        </span>
                      </button>

                      {openSpec.howToUse && (
                        <div className="pb-4 pt-1 text-left text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                          {product.howToUse}
                        </div>
                      )}
                    </div>
                  )}

                {/* 04. Precautions */}
                {typeof product.precautions === "string" &&
                  product.precautions.trim().length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSpec("precautions")}
                        className="w-full py-4 flex items-center justify-between text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0">
                            ✓
                          </span>
                          <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-black">
                            Precautions &amp; Safety
                          </span>
                        </div>
                        <span className="text-base font-light text-stone-500">
                          {openSpec.precautions ? "−" : "+"}
                        </span>
                      </button>

                      {openSpec.precautions && (
                        <div className="pb-4 pt-1 text-left text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                          {product.precautions}
                        </div>
                      )}
                    </div>
                  )}

                {/* 05. Quality Assurance */}
                {typeof product.ourQuality === "string" &&
                  product.ourQuality.trim().length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSpec("quality")}
                        className="w-full py-4 flex items-center justify-between text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#BDE1CC] text-[#1c4d36] flex items-center justify-center text-xs font-bold shrink-0">
                            ✓
                          </span>
                          <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-black">
                            Quality Assurance
                          </span>
                        </div>
                        <span className="text-base font-light text-stone-500">
                          {openSpec.quality ? "−" : "+"}
                        </span>
                      </button>

                      {openSpec.quality && (
                        <div className="pb-4 pt-1 text-left text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                          {product.ourQuality}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          )}

        {/* Customer Review Section */}
        <section className="pt-8 border-t border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-2 pt-1 text-xs text-stone-600">
                <div className="flex text-[#D99A26] gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.round(calculatedRating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span>
                  {calculatedRating > 0 ? calculatedRating.toFixed(1) : "5.0"} out of 5 ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWriteReviewModal(true)}
              className="bg-black hover:bg-stone-900 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-all cursor-pointer self-start sm:self-auto"
            >
              Write a Review
            </button>
          </div>

          {/* Rating Breakdown Bars */}
          <div className="max-w-md space-y-1.5 pt-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count =
                ratingDistribution[star as keyof typeof ratingDistribution] || 0;
              const percent = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-2 text-xs text-stone-600"
                >
                  <span className="w-12 text-right font-medium shrink-0">
                    {star} star
                  </span>
                  <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-900 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-stone-500 text-xs shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="text-xs font-semibold text-stone-900 underline underline-offset-4 hover:text-stone-600 cursor-pointer"
            >
              {showAllReviews ? "Hide Reviews" : "See All Reviews"}
            </button>
          </div>

          {/* Customer Reviews Cards Grid */}
          {showAllReviews && (
            <div className="space-y-4 pt-2 border-t border-stone-200 animate-in fade-in duration-300">
              {reviews.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-4">
                  No reviews submitted yet. Be the first to write a review.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {reviews.map((rev: any) => {
                    return (
                      <div
                        key={rev._id}
                        className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-stone-900">
                              {rev.name}
                            </h4>
                            {rev.isVerified && <VerifiedBuyerBadge />}
                          </div>

                          <div className="flex text-[#D99A26] text-xs gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">
                          {rev.comment}
                        </p>

                        <p className="text-[10px] text-stone-400">
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

        {/* Write A Review Modal Popup */}
        {showWriteReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-stone-200 space-y-4 my-auto max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-base font-bold text-stone-900">
                  Write a Review
                </h3>
                <button
                  type="button"
                  onClick={() => setShowWriteReviewModal(false)}
                  className="p-1 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
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
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewerName || session?.user?.name || ""}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-900 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-xl transition-transform hover:scale-110 cursor-pointer ${
                          star <= rating ? "text-[#D99A26]" : "text-stone-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-stone-600 ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Review Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-900 focus:border-black focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowWriteReviewModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-black hover:bg-stone-900 text-white text-xs font-bold transition-colors disabled:bg-stone-300 cursor-pointer"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Watch & Purchase Video Grid */}
        {productVideos.length > 0 && (
          <section className="w-full space-y-5 pt-8 border-t border-stone-200">
            <div className="flex flex-col items-center text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold uppercase tracking-wider">
                Real Customer Reviews
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Watch & Purchase
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md">
                Tap any video to watch demonstrations and real results.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 pt-1">
              {productVideos.map((videoUrl: string, index: number) => (
                <div
                  key={`${videoUrl}-${index}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-stone-200 bg-black shadow-2xs hover:border-black hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-stone-900 rounded-xl sm:rounded-2xl">
                    {/* Desktop: Play directly right here in the grid (No Dialog) */}
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="hidden md:block h-full w-full object-cover"
                    />

                    {/* Mobile: Tap to open Centered Dialog Player */}
                    <div
                      onClick={() => setActiveVideoIndex(index)}
                      className="md:hidden relative h-full w-full cursor-pointer"
                    >
                      <video
                        src={videoUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover pointer-events-none"
                      />
                      {/* Mobile Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20 pointer-events-none" />

                      {/* Mobile Center Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-md backdrop-blur-xs">
                          <FiPlay size={16} className="ml-0.5 fill-current" />
                        </div>
                      </div>

                      {/* Mobile Bottom Indicator */}
                      <div className="absolute bottom-2 left-1.5 right-1.5 text-center pointer-events-none">
                        <span className="inline-block rounded-full bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[9px] font-semibold text-white tracking-wide">
                          Watch Clip
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Video Centered Dialog (Clean Video-Only with Full Controls) */}
        {activeVideoIndex !== null && productVideos[activeVideoIndex] && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
            {/* Dark Backdrop Overlay (Click outside to close) */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
              onClick={() => setActiveVideoIndex(null)}
              aria-hidden="true"
            />

            {/* Centered Video Dialog Box */}
            <div
              className="relative z-[130] flex flex-col items-center justify-center w-full max-w-[340px] sm:max-w-[380px] max-h-[85vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video Player Container */}
              <div className="relative aspect-[9/16] w-full max-h-[82vh] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-stone-800 flex items-center justify-center">
                {/* Top Video Counter */}
                <div className="absolute top-3 left-3 z-30 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold tracking-wider backdrop-blur-sm pointer-events-none">
                  {activeVideoIndex + 1} / {productVideos.length}
                </div>

                {/* Top-Right Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveVideoIndex(null)}
                  aria-label="Close dialog"
                  className="absolute top-3 right-3 z-30 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-sm shadow-md"
                >
                  <FiX size={18} />
                </button>

                {/* Main Video */}
                <video
                  ref={dialogVideoRef}
                  key={productVideos[activeVideoIndex]}
                  src={productVideos[activeVideoIndex]}
                  autoPlay
                  controls
                  playsInline
                  loop
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onClick={() => {
                    if (dialogVideoRef.current) {
                      if (dialogVideoRef.current.paused) {
                        dialogVideoRef.current.play();
                      } else {
                        dialogVideoRef.current.pause();
                      }
                    }
                  }}
                  className="h-full w-full object-cover cursor-pointer"
                />

                {/* Center Start / Stop (Play / Pause) Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dialogVideoRef.current) {
                      if (dialogVideoRef.current.paused) {
                        dialogVideoRef.current.play();
                      } else {
                        dialogVideoRef.current.pause();
                      }
                    }
                  }}
                  aria-label={isVideoPlaying ? "Stop / Pause video" : "Start / Play video"}
                  className={`absolute inset-0 m-auto z-20 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black/60 text-white shadow-2xl backdrop-blur-xs transition-all duration-300 hover:scale-110 hover:bg-black/80 cursor-pointer pointer-events-auto ${
                    isVideoPlaying
                      ? "opacity-0 hover:opacity-100"
                      : "opacity-100 scale-100 ring-2 ring-white/60"
                  }`}
                >
                  {isVideoPlaying ? (
                    <FiPause size={26} className="fill-current" />
                  ) : (
                    <FiPlay size={26} className="ml-1 fill-current" />
                  )}
                </button>

                {/* Previous Video Arrow */}
                {productVideos.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoIndex((prev) =>
                        prev === null || prev === 0 ? productVideos.length - 1 : prev - 1,
                      );
                    }}
                    aria-label="Previous video"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-sm shadow-sm"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                )}

                {/* Next Video Arrow */}
                {productVideos.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoIndex((prev) =>
                        prev === null || prev === productVideos.length - 1 ? 0 : prev + 1,
                      );
                    }}
                    aria-label="Next video"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-sm shadow-sm"
                  >
                    <FiChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recommended Value Packs Suggestions */}
        {!suggestionsLoading && valuePacks.length > 0 && (
          <section className="pt-8 border-t border-stone-200 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                  Recommended Value Packs
                </h2>
              </div>
              <Link
                href="/products?valuePack=true"
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 underline underline-offset-4 hover:text-stone-600"
              >
                <span>View All</span>
                <span>→</span>
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
          <section className="pt-8 border-t border-stone-200 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 underline underline-offset-4 hover:text-stone-600"
              >
                <span>Explore Shop</span>
                <span>→</span>
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
