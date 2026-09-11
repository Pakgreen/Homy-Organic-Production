import type { Metadata } from "next";
import HeroSlider from "@/components/HeroSlider";
import BestSellingProducts from "@/components/home/BestSellingProducts";
import ProductsContent from "@/components/home/ProductsContent";
import ValuePacksContent from "@/components/home/ValuePacksContent";
import FAQAccordion from "@/components/FAQAccordion";
import About from "@/components/About";
import Testimonials from "@/components/Testimonial";
import BachatPack from "@/components/BachatPack";
import InstagramFeed from "@/components/IntagramComp";
import connectDB from "@/lib/mongodb";
import Slider from "@/models/Slider";
import { getHomeProductsData } from "@/lib/productService";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homyorganic.com";

export const metadata: Metadata = {
  title: {
    absolute: "Homy Organic | Pakistan's Trusted Online Organic Store",
  },
  description:
    "Explore Homy Organic Store for premium organic wellness products, ladies lawn suits, men's fashion, and bachat value packs in Pakistan.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Homy Organic | Pakistan's Trusted Online Organic Store",
    description:
      "Homy Organic | Pakistan's Trusted Online Organic Store",
    url: siteUrl,
    siteName: "Homy Organic",
    locale: "en_PK",
    type: "website",
  },
};

async function getSliders() {
  try {
    const fetchSlidersPromise = (async () => {
      await connectDB();
      const sliders = await Slider.find({ isActive: true }).sort("order").lean();
      return JSON.parse(JSON.stringify(sliders)).filter(
        (slider: any) => slider.image && slider.image.trim() !== ""
      );
    })();

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve([]), 400)
    );

    return (await Promise.race([fetchSlidersPromise, timeoutPromise])) as any[];
  } catch (error) {
    console.error("Home slider direct DB fetch error:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const instagramReels = [
    "https://www.instagram.com/p/DR6x3pajHLu/",
    "https://www.instagram.com/p/DR6x3pajHLu/",
    "https://www.instagram.com/p/DR6x3pajHLu/",
  ];
  
  const [allSliders, homeProducts] = await Promise.all([
    getSliders(),
    getHomeProductsData(),
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What products are available on Homy Organic Store?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Homy Organic Store offers organic wellness items, clothing, lawn suits, men's fashion, and special value packs.",
        },
      },
      {
        "@type": "Question",
        name: "How can I place an order?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Select your desired items, add them to your cart, proceed to checkout, and complete your order with Cash on Delivery or Prepaid payment.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <h1 className="sr-only">Homy Organic Store - Premium Organic Products & Clothing Collection</h1>
      <HeroSlider initialSliders={allSliders} />
    
      <About />
      <BestSellingProducts initialProducts={homeProducts.bestSellers} />
      <ProductsContent initialProducts={homeProducts.regularProducts} />

      <ValuePacksContent initialProducts={homeProducts.valuePacks} />

      <BachatPack />
      
      <InstagramFeed urls={instagramReels} />

      <Testimonials />
      <FAQAccordion />
    </>
  );
}
