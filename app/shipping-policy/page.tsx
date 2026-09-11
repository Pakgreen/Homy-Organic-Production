import type { Metadata } from "next";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homyorganic.com";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Homy Organic Store",
  description:
    "Everything you need to know about delivery charges, timelines, cash on delivery (COD), and tracking your Homy Organic order across Pakistan.",
  alternates: {
    canonical: `${siteUrl}/shipping-policy`,
  },
  openGraph: {
    title: "Shipping & Delivery Policy | Homy Organic Store",
    description:
      "Delivery charges, timelines, cash on delivery (COD), and order tracking across Pakistan.",
    url: `${siteUrl}/shipping-policy`,
    siteName: "Homy Organic",
    locale: "en_PK",
    type: "website",
  },
};

export default function ShippingPolicyPage() {
  const whatsappNumber = "923023735860";
  const whatsappMessage = encodeURIComponent("Hi Homy Organic Support, I have a query about my shipping/delivery.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-[70vh] bg-white py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Simple Clean Heading with Golden Line */}
        <div className="flex items-center justify-center gap-3 text-center">
          <span className="w-10 sm:w-12 h-[2px] bg-[#B9853A] inline-block" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans text-gray-900 tracking-tight">
            Shipping &amp; Delivery Policy
          </h1>
        </div>

        {/* Content Body - Minimal Clean Typography */}
        <div className="space-y-8 text-gray-700 font-normal leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Delivery Charges
            </h2>
            <p className="text-gray-600 leading-relaxed">
              A flat delivery charge of <strong>Rs. 250</strong> applies to all orders across Pakistan.
            </p>
            <p className="text-[#9E6B24] font-semibold flex items-center gap-2 pt-1">
              <FiCheckCircle className="w-4 h-4 text-[#B9853A] shrink-0" />
              <span>Orders above <strong>Rs. 5,000</strong> qualify for FREE Delivery nation-wide!</span>
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Delivery Timelines
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li>
                <strong>Major Cities:</strong> 2 – 4 Business Days (Lahore, Karachi, Islamabad, Rawalpindi, Multan, etc.)
              </li>
              <li>
                <strong>Other Cities &amp; Towns:</strong> 3 – 6 Business Days
              </li>
            </ul>
            <p className="text-gray-500 text-xs sm:text-sm italic pt-1">
              * Orders are dispatched within 24–48 hours after WhatsApp order confirmation.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Order Confirmation &amp; COD
            </h2>
            <p className="text-gray-600 leading-relaxed">
              <strong>Cash on Delivery (COD)</strong> is available nationwide. Every order is confirmed with you over WhatsApp before dispatch. You may also pay in advance via Easypaisa or JazzCash.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Tracking &amp; Support
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If your order hasn’t arrived within the expected timeline, message us on WhatsApp with your order ID and we will track it immediately.
            </p>
          </section>

          {/* Minimal Contact Footer Line */}
          <div className="pt-6 border-t border-gray-100 text-center text-gray-600">
            <p>
              Need help with your shipment?{" "}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B9853A] font-semibold hover:underline"
              >
                Message on WhatsApp
              </a>{" "}
              or view our{" "}
              <Link href="/contact" className="text-gray-900 font-semibold hover:underline">
                Contact Page
              </Link>
              .
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
