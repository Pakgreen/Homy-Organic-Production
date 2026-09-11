import { Metadata } from "next";
import Setting from "@/models/Setting";
import connectDB from "@/lib/mongodb";

export const metadata: Metadata = {
  title: "About Us | Homy Organic",
  description: "Learn more about Homy Organic's mission, natural ingredients, and commitment to pure organic beauty.",
};

export const revalidate = 60; // Revalidate every minute

async function getAboutData() {
  try {
    await connectDB();
    const settings = await Setting.findOne({ key: "site" });
    return settings?.value?.aboutUsText || "";
  } catch (error) {
    console.error("Error fetching about text:", error);
    return "";
  }
}

export default async function AboutPage() {
  const backendAboutText = await getAboutData();

  const defaultText =
    "Homy Organic is a premium organic beauty and wellness brand, offering hand-blended products made from natural ingredients. Each product is pure, natural, and premium — designed to care for both your inner wellness and outer beauty. No compromise is ever made on cleanliness, hygiene, or quality standards in the crafting of any product.";

  const displayText = backendAboutText || defaultText;

  return (
    <div className="min-h-[70vh] bg-white py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-5 sm:space-y-6">
        
        {/* Simple Clean Heading with Golden Line */}
        <div className="flex items-center justify-center gap-3">
          <span className="w-10 sm:w-12 h-[2px] bg-[#B9853A] inline-block" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans text-gray-900 tracking-tight">
            About Us
          </h1>
        </div>

        {/* Minimal Clean Text (No Cards, No Shadow Boxes) */}
        <p className="text-sm sm:text-base md:text-lg text-gray-700 font-normal leading-relaxed text-center whitespace-pre-wrap pt-2">
          {displayText}
        </p>

      </div>
    </div>
  );
}
