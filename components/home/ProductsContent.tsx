"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import axios from "axios";

interface ProductsContentProps {
  initialProducts?: any[];
}

export default function ProductsContent({
  initialProducts,
}: ProductsContentProps = {}) {
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts || initialProducts.length === 0);
  const sortBy = "order";

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      fetchProducts();
    }
  }, [initialProducts]);

  const fetchWithRetry = async (url: string, attempts = 2) => {
    let lastError: unknown = null;
    for (let i = 0; i < attempts; i++) {
      try {
        return await axios.get(url);
      } catch (error) {
        lastError = error;
        if (i === attempts - 1) throw error;
      }
    }
    throw lastError;
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch all active regular products continuously sorted by order
      const url = `/api/products?regularOnly=true&sort=${sortBy}&limit=100`;
      const res = await fetchWithRetry(url, 2);
      const payload = Array.isArray(res.data)
        ? res.data
        : res.data?.products || [];

      const sorted = [...payload].sort(
        (a: any, b: any) => (a.order ?? 1) - (b.order ?? 1),
      );
      setProducts(sorted);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <h2 className="text-2xl sm:text-3xl text-center md:px-2 font-light tracking-tight text-white md:text-4xl lg:text-5xl">
            Our{" "}
            <span className="font-serif italic text-[#B9853B]">
              Premium Collection
            </span>
          </h2>
          <p className="text-center text-xs sm:text-sm text-gray-400 mt-2 max-w-xl font-light">
            Explore our handcrafted organic hair, skin, and wellness essentials for your daily routine.
          </p>
        </div>

        {isLoading ? (
          <ProductSkeleton count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product: any, idx: number) => (
              <div key={product._id} className="w-full">
                <ProductCard product={product} priority={idx < 2} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        )}
      </div>
    </section>
  );
}
