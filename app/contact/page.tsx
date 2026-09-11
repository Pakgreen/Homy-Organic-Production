import { Metadata } from "next";
import Setting from "@/models/Setting";
import connectDB from "@/lib/mongodb";

export const metadata: Metadata = {
  title: "Contact Us | Homy Organic",
  description: "Get in touch with Homy Organic.",
};

export const revalidate = 60;

async function getContactData() {
  try {
    await connectDB();
    const siteSettings = await Setting.findOne({ key: "site" });
    const footerSettings = await Setting.findOne({ key: "footer" });
    return {
      text: siteSettings?.value?.contactUsText || "",
      email:
        footerSettings?.value?.contact?.email ||
        siteSettings?.value?.contactEmail ||
        "info@homyorganic.com",
      phone:
        footerSettings?.value?.contact?.phone ||
        siteSettings?.value?.contactPhone ||
        "+92302 3735860",
      address:
        footerSettings?.value?.contact?.address ||
        siteSettings?.value?.contactAddress ||
        "Multan, Pakistan",
    };
  } catch (error) {
    return {
      text: "",
      email: "info@homyorganic.com",
      phone: "+92302 3735860",
      address: "Multan, Pakistan",
    };
  }
}

export default async function ContactPage() {
  const data = await getContactData();

  return (
    <div className="min-h-[70vh] bg-white py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
        
        {/* Simple Clean Heading with Golden Line */}
        <div className="flex items-center justify-center gap-3">
          <span className="w-10 sm:w-12 h-[2px] bg-[#B9853A] inline-block" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans text-gray-900 tracking-tight">
            Contact Us
          </h1>
        </div>

        {data.text && (
          <p className="text-sm sm:text-base md:text-lg text-gray-700 font-normal leading-relaxed text-center whitespace-pre-wrap">
            {data.text}
          </p>
        )}

        {/* Minimal Contact Details - No Heavy Cards */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-8 text-center">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-1">
              Email
            </p>
            <a
              href={`mailto:${data.email}`}
              className="text-sm sm:text-base text-gray-900 hover:text-[#B9853A] font-normal transition-colors"
            >
              {data.email}
            </a>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-1">
              Phone
            </p>
            <a
              href={`tel:${data.phone.replace(/[^0-9+]/g, "")}`}
              className="text-sm sm:text-base text-gray-900 hover:text-[#B9853A] font-normal transition-colors"
            >
              {data.phone}
            </a>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-1">
              Address
            </p>
            <p className="text-sm sm:text-base text-gray-900 font-normal">
              {data.address}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
