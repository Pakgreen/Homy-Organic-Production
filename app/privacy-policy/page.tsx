import type { Metadata } from "next";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Privacy Policy | Homy Organic",
  description: "How Homy Organic collects, uses and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[70vh] bg-white py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Simple Clean Header with Golden Line */}
        <div className="flex items-center justify-center gap-3 text-center">
          <span className="w-10 sm:w-12 h-[2px] bg-[#B9853A] inline-block" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
        </div>

        {/* Content Body - Minimal Clean Typography */}
        <div className="space-y-8 text-gray-700 font-normal leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Information We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed">
              When you place an order or contact us, we collect the details you provide directly: your name, phone number, delivery address, city, and any order notes. We do not require an account or password to shop with us.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              How We Use Your Information
            </h2>
            <ul className="space-y-2 pt-1">
              {[
                "To process, confirm and deliver your order",
                "To contact you on WhatsApp about your order status",
                "To respond to questions sent through our contact form",
                "To improve our products and customer experience",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-gray-600">
                  <FiCheckCircle className="w-4 h-4 text-[#B9853A] shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              How We Share Your Information
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We never sell your personal information. Your name, phone number, and address are shared only with our delivery/courier partner to fulfill your order, and never with unrelated third parties.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Payment Information
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We do not store card or account numbers. For manual bank transfers (Easypaisa/JazzCash), payment confirmation screenshots are used only to verify your order and are not shared further.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-sans">
              Data Storage
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your cart is stored locally in your own browser so items stay saved between visits. Order details you submit at checkout are sent directly to us via WhatsApp and are not stored on a public database.
            </p>
          </section>

          {/* Minimal Contact Footer Line */}
          <div className="pt-6 border-t border-gray-100 text-center text-gray-600">
            <p>
              Questions about this policy? Contact us at{" "}
              <a
                href="mailto:info@homyorganic.com"
                className="text-[#B9853A] font-semibold hover:underline"
              >
                info@homyorganic.com
              </a>{" "}
              or via{" "}
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
