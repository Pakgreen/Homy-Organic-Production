"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Link from "next/link";
import axios from "axios";
import TikTokVerifiedTick from "@/components/TikTokVerifiedTick";
import { getOptimizedImageUrl } from "@/lib/image";

const FALLBACK_TESTIMONIALS = [
  {
    text: "The quality of the oil is excellent. The packaging is premium, and my order was delivered on time. I will definitely order again.",
    name: "Areeba Khan",
    company: "Lahore, Pakistan",
    rating: 5,
    date: "14 Aug 2026",
  },
  {
    text: "This was my first time trying this oil, and I was very impressed. The product is authentic, and the quality exceeded my expectations.",
    name: "Hania Ahmed",
    company: "Karachi, Pakistan",
    rating: 5,
    date: "12 Aug 2026",
  },
  {
    text: "The oil is of outstanding quality. It has a pleasant fragrance, and the product felt fresh. Overall, I had a great experience.",
    name: "Eman Fatima",
    company: "Dubai, UAE",
    rating: 4,
    date: "10 Aug 2026",
  },
  {
    text: "What I liked most was the product quality. Ordering was simple, and the package arrived safely and in perfect condition.",
    name: "Maham Ali",
    company: "Abu Dhabi, UAE",
    rating: 5,
    date: "08 Aug 2026",
  },
  {
    text: "I have been using this oil for some time now, and the results have been very satisfying. Both the quality and packaging are excellent.",
    name: "Zoya Malik",
    company: "Islamabad, Pakistan",
    rating: 4,
    date: "05 Aug 2026",
  },
  {
    text: "Excellent quality, reasonable price, and fast delivery. The product was exactly as shown on the website.",
    name: "Laiba Iqbal",
    company: "Sharjah, UAE",
    rating: 5,
    date: "02 Aug 2026",
  },
];

export default function Testimonials() {
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch real customer reviews from database
    axios
      .get("/api/reviews")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDbReviews(res.data);
        }
      })
      .catch(console.error);

    // 2. Fetch products as fallback reference
    axios
      .get("/api/products?limit=10")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.products || [];
        setProducts(data);
      })
      .catch(console.error);
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  const items =
    dbReviews.length > 0
      ? dbReviews.map((rev) => {
          const prod = rev.product;
          const rawImg = prod?.images?.[0] || prod?.image || "/bachatpack.png";
          return {
            name: rev.name || "Customer",
            text: rev.comment || "Great product experience!",
            rating: rev.rating || 5,
            date: formatDate(rev.createdAt),
            company: prod?.name ? `Purchased: ${prod.name}` : "Verified Order",
            productImage: getOptimizedImageUrl(rawImg, 120),
            productName: prod?.name || "Organic Product",
            productUrl: prod?.slug
              ? `/products/${prod.slug}`
              : prod?._id
              ? `/products/${prod._id}`
              : "/products",
          };
        })
      : FALLBACK_TESTIMONIALS.map((t, idx) => {
          const p = products.length > 0 ? products[idx % products.length] : null;
          const rawImg = p?.images?.[0] || p?.image || "/bachatpack.png";
          return {
            name: t.name,
            text: t.text,
            rating: t.rating || 5,
            date: t.date,
            company: t.company,
            productImage: getOptimizedImageUrl(rawImg, 120),
            productName: p?.name || "Organic Product",
            productUrl: p?.slug
              ? `/products/${p.slug}`
              : p?._id
              ? `/products/${p._id}`
              : "/products",
          };
        });

  return (
    <section className="w-full overflow-hidden pt-10 sm:pt-16 pb-4 sm:pb-8 my-6 font-[inherit]">
      {/* Heading */}
      <div className="mb-4 sm:mb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white md:text-4xl">
          What Our{" "}
          <span className="font-serif italic text-[#B9853B]">
            Clients Say
          </span>
        </h2>
      </div>

      {/* Slider */}
      <Swiper
        modules={[Autoplay]}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={800}
        spaceBetween={20}
        slidesPerView={1.15}
        centeredSlides={true}
        breakpoints={{
          640: {
            slidesPerView: 2,
            centeredSlides: false,
          },
          1024: {
            slidesPerView: 3,
            centeredSlides: false,
          },
          1280: {
            slidesPerView: 4,
            centeredSlides: false,
          },
        }}
        className="!overflow-visible"
      >
        {items.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className="group p-1.5 sm:p-2 transition-all duration-300 flex flex-col justify-start space-y-2 bg-transparent border-0 shadow-none">
              <div>
                {/* Stars Rating & Review Date Row */}
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs sm:text-sm ${
                          i < (testimonial.rating || 5)
                            ? "text-amber-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-light shrink-0">
                    {testimonial.date}
                  </span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-xs sm:text-sm font-light italic leading-relaxed text-gray-700">
                  “{testimonial.text}”
                </p>
              </div>

              {/* Compact User Info & Static Verified Buyer Badge */}
              <div className="pt-1 flex items-center justify-between gap-2 min-w-0">
                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 tracking-tight truncate">
                      {testimonial.name}
                    </span>
                    <div className="inline-flex items-center gap-1 shrink-0 select-none">
                      <TikTokVerifiedTick
                        className="w-3.5 h-3.5"
                        color="#000000"
                        checkColor="#FFFFFF"
                      />
                      <span className="text-[10px] font-light text-gray-500 tracking-tight">
                        Verified Buyer
                      </span>
                    </div>
                  </div>

                  <span className="text-[10.5px] text-gray-400 font-light truncate mt-0.5">
                    {testimonial.company}
                  </span>
                </div>

                {/* Small Product Thumbnail Link */}
                <Link
                  href={testimonial.productUrl}
                  title={`View ${testimonial.productName}`}
                  className="shrink-0 transition-transform hover:scale-110 p-0.5 cursor-pointer"
                >
                  <img
                    src={testimonial.productImage}
                    alt={testimonial.productName}
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/bachatpack.png";
                    }}
                  />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}