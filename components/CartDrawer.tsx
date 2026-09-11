"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiX, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { isCloudinaryUrl } from "@/lib/image";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    isOpen,
    closeCart,
  } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-999999 transition-opacity cursor-pointer"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-999999 transform transition-transform duration-300 ease-in-out flex flex-col font-[inherit] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100/60">
          <h2 className="text-base sm:text-lg font-light tracking-wide text-gray-900">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-gray-300 stroke-[1.5]" />
              </div>
              <div>
                <p className="text-base font-normal text-gray-800">
                  Your cart is empty
                </p>
                <p className="text-xs text-gray-400 font-light mt-1">
                  Looks like you haven't added any items yet.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-normal tracking-wide mt-3 cursor-pointer hover:bg-black transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item._id} className="flex gap-4">
                  <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                    <Image
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      fill
                      sizes="80px"
                      unoptimized={isCloudinaryUrl(item.image)}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs sm:text-sm font-normal text-gray-800 line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-gray-300 hover:text-red-500 p-0.5 cursor-pointer shrink-0 transition-colors"
                          title="Remove item"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                      {item.size && (
                        <span className="text-[10px] font-light text-[#B9853B] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 inline-block mt-1">
                          Size: {item.size}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200/80 rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="px-2 py-1 text-gray-400 hover:text-gray-900 disabled:opacity-30 cursor-pointer transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="px-1.5 text-xs font-normal w-7 text-center cursor-default text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="px-2 py-1 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>

                      <div className="text-xs sm:text-sm font-normal text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-normal text-gray-600">
                Subtotal
              </span>
              <span className="text-sm sm:text-base font-normal text-gray-900">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-light mb-4">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
              className="w-full py-3 bg-gray-900 text-white text-xs sm:text-sm font-normal tracking-wider rounded-xl uppercase hover:bg-black transition-colors cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
