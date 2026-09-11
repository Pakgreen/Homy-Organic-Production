import type { Metadata } from "next";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homyorganic.com";

export const metadata: Metadata = {
  title: "Return & Exchange Policy | Homy Organic Store",
  description:
    "Learn about Homy Organic's return & exchange policy for damaged, wrong, or defective orders.",
  alternates: {
    canonical: `${siteUrl}/return-policy`,
  },
  openGraph: {
    title: "Return & Exchange Policy | Homy Organic Store",
    description:
      "Learn about Homy Organic's return & exchange policy for damaged, wrong, or defective orders.",
    url: `${siteUrl}/return-policy`,
    siteName: "Homy Organic",
    locale: "en_PK",
    type: "website",
  },
};

export default function ReturnPolicyPage() {
  const whatsappNumber = "923023735860";
  const whatsappMessage = encodeURIComponent("Hi Homy Organic Support, I need help with a Return/Exchange for my order.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-[70vh] bg-white py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Simple Clean Heading with Golden Line */}
        <div className="flex items-center justify-center gap-3 text-center">
          <span className="w-10 sm:w-12 h-[2px] bg-[#B9853A] inline-block" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans text-gray-900 tracking-tight">
            Return &amp; Exchange Policy
          </h1>
        </div>

        {/* Content Body - Minimal Clean Typography */}
        <div className="space-y-8 text-gray-700 font-normal leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Eligibility for Return or Exchange
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Because our products are hand-blended, hygiene-sensitive items, returns/exchanges are accepted if:
            </p>
            <ul className="space-y-2 pt-1">
              {[
                "The product arrived damaged, leaking, or broken in transit.",
                "You received a wrong product or different item than ordered.",
                "The product is unopened, unused, and in its original sealed packaging.",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-gray-600">
                  <FiCheckCircle className="w-4 h-4 text-[#B9853A] shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Reporting a Problem
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Please message us on WhatsApp within <strong>3 days of delivery</strong> with your order ID and a photo/video of the issue. Our support team will confirm next steps within 24 to 48 hours.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Refunds &amp; Return Shipping
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Approved refunds for prepaid orders are processed within 3-5 business days. Return shipping for damaged or wrong items is 100% on us.
            </p>
          </section>

          {/* Minimal Contact Footer Line */}
          <div className="pt-6 border-t border-gray-100 text-center text-gray-600">
            <p>
              Report a return or exchange?{" "}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B9853A] font-semibold hover:underline"
              >
                Report on WhatsApp
              </a>{" "}
              or visit our{" "}
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
