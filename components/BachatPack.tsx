import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function BachatPack() {
  return (
    <div className="relative w-full max-w-full mx-auto overflow-hidden rounded-none">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_50%,rgba(185,133,59,0.25),transparent_45%),radial-gradient(circle_at_20%_20%,rgba(185,133,59,0.12),transparent_40%)]" />

      <div className="grid md:grid-cols-2 p-4 sm:p-6 lg:p-10 xl:p-14 items-center">
        <div className="flex flex-col justify-center items-center text-center p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">
          <h2 className="text-2xl sm:text-3xl text-center font-light tracking-tight text-white md:text-4xl lg:text-5xl">
            Beauty Essentials{" "}
            <span className="font-serif italic text-[#B9853B]">Value Pack</span>
          </h2>

          <p className="text-center p-2 text-gray-800 font-light leading-relaxed text-xs sm:text-sm lg:text-base max-w-md lg:max-w-xl xl:max-w-2xl">
            A complete beauty essentials value pack from Homy Organic, featuring
            carefully selected hair and skin care essentials along with a
            premium silk scrunchie for an elegant and effortless self-care
            experience.
          </p>

          <div className="pt-2">
            <Link
              href="/products?valuePack=true"
              className="relative inline-flex items-center justify-center px-8 py-3 sm:px-10 sm:py-3.5 border border-[#B9853B]/80 text-[#B9853B] hover:text-white active:text-white font-light text-xs sm:text-sm tracking-widest uppercase rounded-full overflow-hidden shadow-xs transition-colors duration-500 group active:scale-95 cursor-pointer"
            >
              {/* Bottom-to-Top background fill animation on hover and mobile tap */}
              <span className="absolute inset-0 bg-[#B9853B] transform translate-y-full group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="relative z-10 transition-colors duration-500">
                Shop Now
              </span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center overflow-hidden relative">
          <Image
            src="/bachatpack.png"
            alt="bachatpack"
            width={650}
            height={650}
            className="w-full max-w-[543px] xl:max-w-[650px] h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
