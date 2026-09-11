"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/navigation";
import Link from "next/link";
import axios from "axios";
import { isCloudinaryUrl, getOptimizedImageUrl } from "@/lib/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface SliderItem {
  _id: string;
  title: string;
  image: string;
  desktopImage?: string;
  buttonText: string;
  buttonLink: string;
}

interface HeroSliderProps {
  initialSliders?: SliderItem[];
}

export default function HeroSlider({
  initialSliders = [],
}: HeroSliderProps) {
  const [sliders, setSliders] = useState<SliderItem[]>(initialSliders);

  useEffect(() => {
    if (initialSliders.length > 0) {
      setSliders(initialSliders);
      return;
    }

    let isMounted = true;

    const fetchSliders = async () => {
      try {
        const res = await axios.get("/api/sliders");
        let data = Array.isArray(res.data) ? res.data : res.data.sliders || [];
        data = data.filter(
          (slider: any) => slider.image && slider.image.trim() !== ""
        );

        if (isMounted) {
          setSliders(data);
        }
      } catch (error) {
        console.error("Error fetching sliders:", error);
      }
    };

    fetchSliders();

    return () => {
      isMounted = false;
    };
  }, [initialSliders]);

  if (sliders.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full p-0 m-0">
      <div className="relative group rounded-none overflow-hidden border-0 bg-gray-50">
        
        {/* Desktop & Tablet Left/Right Navigation Buttons */}
        {sliders.length > 1 && (
          <>
            <button
              type="button"
              style={{ borderRadius: "9999px" }}
              className="hero-prev-btn hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 !rounded-full bg-white/90 hover:bg-white text-gray-900 border border-gray-200/80 shadow-lg items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Previous Banner"
            >
              <FiChevronLeft className="w-7 h-7 lg:w-8 lg:h-8 text-gray-900 -ml-0.5" />
            </button>

            <button
              type="button"
              style={{ borderRadius: "9999px" }}
              className="hero-next-btn hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 !rounded-full bg-white/90 hover:bg-white text-gray-900 border border-gray-200/80 shadow-lg items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Next Banner"
            >
              <FiChevronRight className="w-7 h-7 lg:w-8 lg:h-8 text-gray-900 -mr-0.5" />
            </button>
          </>
        )}

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={{
            prevEl: ".hero-prev-btn",
            nextEl: ".hero-next-btn",
          }}
          loop={sliders.length > 1}
          key={sliders.map((s) => s._id).join("-")}
          className="w-full h-auto rounded-none overflow-hidden"
          slidesPerView={1}
          spaceBetween={0}
        >
          {sliders.map((slider, idx) => {
            const mobileImg = getOptimizedImageUrl(slider.image, 800, "auto");
            const desktopImg = getOptimizedImageUrl(slider.desktopImage || slider.image, 2560, "auto");

            return (
              <SwiperSlide key={slider._id}>
                <div className="relative w-full overflow-hidden rounded-none">
                  <picture>
                    <source media="(min-width: 768px)" srcSet={desktopImg} />
                    <img
                      src={mobileImg}
                      alt={slider.title || "Banner"}
                      loading={idx === 0 ? "eager" : "lazy"}
                      // @ts-ignore
                      fetchPriority={idx === 0 ? "high" : "auto"}
                      decoding="async"
                      className="w-full h-auto block object-contain md:h-[480px] lg:h-[560px] xl:h-[650px] 2xl:h-[760px] 3xl:h-[860px] md:object-cover rounded-none"
                    />
                  </picture>

                  <Link
                    href={slider.buttonLink || "#"}
                    aria-label={slider.title || "Slide"}
                    className="absolute inset-0 z-10"
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          width: 12px;
          height: 12px;
        }

        .swiper-pagination-bullet-active {
          background: #000000;
          width: 32px;
          border-radius: 6px;
        }

        .swiper-pagination {
          width: auto;
          left: auto;
          right: 1rem;
          bottom: 0.75rem;
          text-align: right;
        }
        @media (min-width: 640px) {
          .swiper-pagination {
            right: 1.25rem;
            bottom: 1rem;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </section>
  );
}