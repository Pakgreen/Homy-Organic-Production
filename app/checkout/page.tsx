"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import axios from "axios";
import LocalImageUpload from "@/components/LocalImageUpload";
import { useSession } from "next-auth/react";
import { FiCheckCircle, FiX, FiDownload, FiCopy, FiTag, FiShoppingBag, FiLock, FiArrowLeft } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import CountryPhoneInput from "@/components/CountryPhoneInput";
import Link from "next/link";
import { event as trackPixelEvent } from "@/lib/metaPixel";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("+923000000000");
  const [siteLogo, setSiteLogo] = useState<string>("/homyorganic.png");
  const [storeContact, setStoreContact] = useState<{ phone: string; email: string }>({ phone: "", email: "" });
  const [allowedPaymentMethods, setAllowedPaymentMethods] = useState<"both" | "cod" | "prepaid">("both");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentAccountTitle, setPaymentAccountTitle] = useState("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState("");
  const [paymentDetailsCopied, setPaymentDetailsCopied] = useState(false);
  const [deliveryData, setDeliveryData] = useState<{
    enabled: boolean;
    amount: number;
  }>({ enabled: false, amount: 0 });
  const [prepaidDiscountData, setPrepaidDiscountData] = useState({ enabled: false, amount: 0 });
  const [selectedCountryCode, setSelectedCountryCode] = useState("+92");
  const [saveDetails, setSaveDetails] = useState(true);
  const trackedCheckout = useRef("");

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    phone: "",
    alternatePhone: "",
    paymentReference: "",
    paymentProofUrl: "",
    newsOffers: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
    influencerName?: string;
  } | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCopyPaymentDetails = async () => {
    if (!paymentAccountNumber && !paymentDetails) return;

    try {
      await navigator.clipboard.writeText(paymentAccountNumber || paymentDetails);
      setPaymentDetailsCopied(true);
      toast.success("Payment number/details copied");
      window.setTimeout(() => setPaymentDetailsCopied(false), 2000);
    } catch {
      toast.error("Unable to copy payment details");
    }
  };

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && !showSuccessPopup) {
      router.push("/cart");
    } else if (items.length > 0) {
      const checkoutKey = items
        .map((item) => `${item._id}:${item.quantity}`)
        .sort()
        .join("|");
      if (trackedCheckout.current !== checkoutKey) {
        trackedCheckout.current = checkoutKey;
        trackPixelEvent("InitiateCheckout", {
          content_ids: items.map((item) => item._id),
          content_type: "product",
          contents: items.map((item) => ({
            id: item._id,
            quantity: item.quantity,
          })),
          num_items: items.reduce((sum, item) => sum + item.quantity, 0),
          value: getTotalPrice(),
          currency: "PKR",
        });
      }
    }
  }, [items, router, showSuccessPopup]);

  // Load saved details
  useEffect(() => {
    try {
      const saved = localStorage.getItem("homy_saved_checkout_details");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.saveDetails === "boolean") {
          setSaveDetails(parsed.saveDetails);
        }
        setFormData((prev) => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          email: parsed.email || prev.email,
          address: parsed.address || prev.address,
          city: parsed.city || prev.city,
          phone: parsed.phone || prev.phone,
          alternatePhone: parsed.alternatePhone || prev.alternatePhone,
        }));
        if (parsed.countryCode) {
          setSelectedCountryCode(parsed.countryCode);
        }
      }
    } catch (e) {
      console.error("Failed to load saved checkout details:", e);
    }
  }, []);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await axios.get("/api/settings/site");
        if (res.data?.logo) {
          setSiteLogo(res.data.logo);
        }
        if (res.data?.contactPhone) {
          setStoreContact((prev) => ({ ...prev, phone: res.data.contactPhone }));
        }
        if (res.data?.contactEmail) {
          setStoreContact((prev) => ({ ...prev, email: res.data.contactEmail }));
        }
        if (res.data?.paymentAccountDetails) {
          setPaymentDetails(res.data.paymentAccountDetails);
        }
        setPaymentAccountTitle(res.data?.paymentAccountTitle || "");
        setPaymentAccountNumber(res.data?.paymentAccountNumber || "");
        if (res.data?.deliveryChargesEnabled) {
          setDeliveryData({
            enabled: true,
            amount: res.data.deliveryChargeAmount || 0,
          });
        }
        if (res.data?.whatsappNumber) {
          setWhatsappNumber(res.data.whatsappNumber);
        }
        if (res.data?.allowedPaymentMethods) {
          const mode = res.data.allowedPaymentMethods as "both" | "cod" | "prepaid";
          setAllowedPaymentMethods(mode);
          if (mode === "prepaid") {
            setPaymentMethod("Prepaid");
          } else if (mode === "cod") {
            setPaymentMethod("Cash on Delivery");
          }
        }
        if (res.data?.prepaidDiscountEnabled) {
          setPrepaidDiscountData({
            enabled: true,
            amount: Number(res.data.prepaidDiscountAmount) || 0,
          });
        }
      } catch (error) {
        console.error("Site settings fetch error:", error);
      }
    };

    const fetchFooterSettings = async () => {
      try {
        const res = await axios.get("/api/settings/footer");
        if (res.data?.contact?.phone) {
          setWhatsappNumber(res.data.contact.phone);
        }
      } catch (error) {
        console.error("Footer settings fetch error:", error);
      }
    };

    fetchSiteSettings();
    fetchFooterSettings();
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user/profile");
        const profile = res.data || {};
        const addr = profile.address || {};
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || profile.name || session.user.name || "",
          email: prev.email || profile.email || session.user.email || "",
          phone: prev.phone || profile.phone || "",
          address: prev.address || addr.street || "",
          city: prev.city || addr.city || "",
        }));
      } catch (e) {
        console.error("Failed to fetch user profile:", e);
      }
    };

    fetchProfile();
  }, [session]);

  const subtotal = getTotalPrice();
  const deliveryPrice = deliveryData.enabled ? deliveryData.amount : 0;
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const availablePrepaidDiscount = prepaidDiscountData.enabled
    ? Math.min(prepaidDiscountData.amount, subtotal + deliveryPrice)
    : 0;
  const prepaidDiscountAmount = paymentMethod === "Prepaid" && prepaidDiscountData.enabled
    ? availablePrepaidDiscount
    : 0;
  const discountAmount = couponDiscountAmount + prepaidDiscountAmount;
  const total = Math.max(0, subtotal + deliveryPrice - discountAmount);

  // Apply Coupon Code Handler
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponCodeInput.trim()) {
      const msg = "Please enter a discount code";
      setCouponError(msg);
      toast.error(msg);
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await axios.post("/api/coupons/validate", {
        code: couponCodeInput,
        subtotal: subtotal,
      });

      if (res.data.valid) {
        setAppliedCoupon({
          code: res.data.code,
          discountAmount: res.data.discountAmount,
          discountType: res.data.discountType,
          discountValue: res.data.discountValue,
          influencerName: res.data.influencerName,
        });
        setCouponError(null);
        toast.success(res.data.message || "Token applied successfully!");
      } else {
        const errMsg = res.data.error || "Invalid discount code or token";
        setCouponError(errMsg);
        toast.error(errMsg);
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || "Invalid discount code or token";
      setCouponError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError(null);
    toast.success("Token code removed");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const trimmedName = formData.fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = "Full name is required";
    }

    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    const trimmedAddress = formData.address.trim();
    if (!trimmedAddress) {
      newErrors.address = "Delivery address is required";
    } else if (trimmedAddress.length < 8) {
      newErrors.address = "Please enter a complete delivery address";
    }

    const rawPhone = formData.phone.trim();
    const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
    const alternateDigits = formData.alternatePhone.replace(/[^0-9]/g, "");

    if (!rawPhone) {
      newErrors.phone = "Phone number is required";
    } else if (selectedCountryCode === "+92") {
      const cleanPhone = rawPhone.replace(/[\s-]/g, "");
      const is03Format = /^03[0-9]{9}$/.test(cleanPhone);
      const is3Format = /^3[0-9]{9}$/.test(cleanPhone);
      const is923Format = /^923[0-9]{9}$/.test(cleanPhone);
      const isPlus923Format = /^\+923[0-9]{9}$/.test(cleanPhone);

      if (!is03Format && !is3Format && !is923Format && !isPlus923Format) {
        newErrors.phone = "Invalid Pakistani phone number (e.g. 0300 1234567)";
      }
    } else {
      if (cleanDigits.length < 6 || cleanDigits.length > 15) {
        newErrors.phone = `Invalid phone number for ${selectedCountryCode}`;
      }
    }

    if (formData.alternatePhone.trim() && (alternateDigits.length < 6 || alternateDigits.length > 15)) {
      newErrors.alternatePhone = "Enter a valid alternate phone number";
    }

    if (paymentMethod === "Prepaid") {
      const reference = formData.paymentReference.trim();
      if (!reference) {
        newErrors.paymentReference = "Transaction ID is required";
      } else if (reference.length < 5) {
        newErrors.paymentReference = "Invalid Transaction ID";
      }

      if (!formData.paymentProofUrl) {
        newErrors.paymentProofUrl = "Please upload payment screenshot proof";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!items || items.length === 0) {
        toast.error("Your cart is empty");
        setIsSubmitting(false);
        return;
      }

      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const fullAddress = [
        formData.address,
        formData.city,
      ]
        .filter(Boolean)
        .join(", ");

      const orderData = {
        orderItems: items.map((item) => ({
          product: item._id,
          name: item.size ? `${item.name} (${item.size})` : item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          size: item.size,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          address: fullAddress,
          city: formData.city || "",
          phone: formData.phone.startsWith("+")
            ? formData.phone
            : `${selectedCountryCode} ${formData.phone.replace(/^0/, "")}`,
          alternatePhone: formData.alternatePhone.trim()
          ? formData.alternatePhone.startsWith("+")
            ? formData.alternatePhone.trim()
            : `${selectedCountryCode} ${formData.alternatePhone.replace(/^0/, "").trim()}`
          : "",
        },
        contactEmail: formData.email,
        paymentMethod,
        paymentReference: formData.paymentReference,
        paymentProofUrl: formData.paymentProofUrl,
        itemsPrice: subtotal,
        shippingPrice: deliveryPrice,
        discountAmount: discountAmount,
        couponCode: appliedCoupon?.code || undefined,
        influencerName: appliedCoupon?.influencerName || undefined,
        taxPrice: 0,
        totalPrice: total,
      };

      const res = await axios.post("/api/orders", orderData);

      if (saveDetails) {
        try {
          localStorage.setItem(
            "homy_saved_checkout_details",
            JSON.stringify({
              saveDetails: true,
              fullName: formData.fullName,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              phone: formData.phone,
              alternatePhone: formData.alternatePhone,
              countryCode: selectedCountryCode,
            })
          );
        } catch (e) {
          console.error("Failed to save checkout details:", e);
        }
      }

      toast.success("Order placed successfully!");
      setPlacedOrder(res.data);
      const orderId = String(res.data._id || res.data.id || "");
      setPlacedOrderId(orderId || null);

      try {
        trackPixelEvent("Purchase", {
          value: total,
          currency: "PKR",
          content_type: "product",
          content_ids: items.map((item) => item._id),
          contents: items.map((item) => ({
            id: item._id,
            quantity: item.quantity,
          })),
          num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        }, orderId || undefined);
      } catch (e) {
        // ignore tracking error
      }

      clearCart();
      setShowSuccessPopup(true);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || error.message || "Failed to place order";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdfSlip = () => {
    const orderDataToPrint = placedOrder || {
      _id: placedOrderId,
      createdAt: new Date().toISOString(),
      shippingAddress: {
        fullName: formData.fullName,
        address: formData.address,
        phone: formData.phone,
      },
      contactEmail: formData.email,
      paymentMethod,
      orderItems: items,
      itemsPrice: subtotal,
      shippingPrice: deliveryPrice,
      totalPrice: total,
    };

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to download slip");
      return;
    }

    const itemsListHtml = (orderDataToPrint.orderItems || [])
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${
                item.image
                  ? `<img src="${item.image.startsWith("http") ? item.image : window.location.origin + item.image}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; flex-shrink: 0;" />`
                  : ""
              }
              <div>
                <div style="font-weight: 600; color: #111827; font-size: 13px;">${item.name || "Item"}</div>
                ${item.size ? `<div style="font-size: 11px; color: #6b7280; font-weight: 500;">Size: ${item.size}</div>` : ""}
              </div>
            </div>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-weight: 600; font-size: 13px;">${item.quantity || 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; font-size: 13px;">PKR ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const logoSrc = siteLogo ? (siteLogo.startsWith("http") ? siteLogo : window.location.origin + siteLogo) : "";

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${orderDataToPrint._id || "Invoice"}</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 25px; color: #1f2937; max-width: 600px; margin: 0 auto; line-height: 1.5; background: #fff; }
            .top-bar { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #B9853A; margin-bottom: 20px; }
            .logo-img { max-height: 52px; max-width: 200px; object-fit: contain; display: block; margin-bottom: 4px; }
            .receipt-heading { font-size: 18px; font-weight: 800; color: #111827; text-transform: uppercase; }
            .details-box { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background: #f9fafb; padding: 14px; border-radius: 10px; border: 1px solid #f3f4f6; font-size: 12px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th { background: #F8F5EE; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6b7280; text-align: left; }
            .summary-card { width: 220px; margin-left: auto; background: #F8F5EE; padding: 12px 14px; border-radius: 10px; border: 1px solid #EFEAE0; font-size: 12px; }
            .summary-row { display: flex; justify-content: space-between; padding: 3px 0; color: #4b5563; }
            .summary-total { display: flex; justify-content: space-between; padding-top: 6px; margin-top: 6px; border-top: 1px dashed #d1d5db; font-weight: 800; font-size: 14px; color: #111827; }
            .footer-note { margin-top: 28px; padding-top: 14px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="top-bar">
            <div>
              ${logoSrc ? `<img src="${logoSrc}" class="logo-img" alt="Homy Organic" />` : `<div style="font-size:24px; font-weight:bold; color:#B9853A;">Homy Organic</div>`}
            </div>
            <div style="text-align: right;">
              <div class="receipt-heading">ORDER RECEIPT</div>
              <div style="font-family: monospace; font-size: 12px; font-weight: bold; color: #B9853A;">#${orderDataToPrint._id || "N/A"}</div>
            </div>
          </div>

          <div class="details-box">
            <div>
              <strong>Customer:</strong> ${orderDataToPrint.shippingAddress?.fullName || formData.fullName || "Customer"}<br/>
              Phone: ${orderDataToPrint.shippingAddress?.phone || formData.phone}<br/>
              Email: ${orderDataToPrint.contactEmail || formData.email}
            </div>
            <div>
              <strong>Payment Method:</strong> ${orderDataToPrint.paymentMethod || paymentMethod}<br/>
              Address: ${orderDataToPrint.shippingAddress?.address || formData.address}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>

          <div class="summary-card">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>PKR ${(orderDataToPrint.itemsPrice || subtotal).toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Delivery</span>
              <span>${(orderDataToPrint.shippingPrice || deliveryPrice) === 0 ? "Free" : "PKR " + (orderDataToPrint.shippingPrice || deliveryPrice).toLocaleString()}</span>
            </div>
            ${
              discountAmount > 0
                ? `<div class="summary-row" style="color: #059669;">
                    <span>Discount</span>
                    <span>- PKR ${discountAmount.toLocaleString()}</span>
                  </div>`
                : ""
            }
            <div class="summary-total">
              <span>Total</span>
              <span style="color: #B9853A;">PKR ${(orderDataToPrint.totalPrice || total).toLocaleString()}</span>
            </div>
          </div>

          <div class="footer-note">
            Thank you for shopping with Homy Organic!
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  if (!mounted || (items.length === 0 && !showSuccessPopup)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 font-sans">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-[var(--font-roboto)] font-light text-gray-900">
      <div className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        {/* LEFT COLUMN: Logo, Contact, Delivery, Payment Form */}
        <div className="order-2 space-y-7 bg-white px-4 py-7 sm:px-10 lg:order-1 lg:px-14 lg:py-10">
          {/* Store Branding Header with Back Button */}
          <div className="border-b border-gray-200 pb-5">
            <div className="flex items-center justify-between">
            <Link href="/" className="inline-block">
              {siteLogo ? (
                <img src={siteLogo} alt="Homy Organic" className="h-9 w-auto object-contain" />
              ) : (
                <span className="text-xl font-semibold tracking-tight text-black">Homy Organic</span>
              )}
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-1.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 cursor-pointer"
            >
              <FiArrowLeft size={14} />
              <span>Back to Cart</span>
            </Link>
            </div>
            <p className="mt-4 text-[11px] tracking-wide text-gray-500">
              Secure checkout &nbsp;•&nbsp; Fast delivery across Pakistan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-9">
            {/* Contact Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold tracking-tight text-gray-950">Contact information</h2>
                {!session && (
                  <Link
                    href="/auth/signin"
                    className="text-xs text-gray-600 hover:text-black underline font-medium"
                  >
                    Log in
                  </Link>
                )}
              </div>

              <div>
                <input
                  type="email"
                  required
                  placeholder="Email address *"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white transition-colors ${
                    errors.email
                      ? "border-red-500 bg-red-50/20"
                      : "border-gray-300 focus:border-black focus:outline-none"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
                )}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={formData.newsOffers}
                  onChange={(e) => handleInputChange("newsOffers", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                />
                <span>Email me with news and offers</span>
              </label>
            </div>

            {/* Delivery Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-semibold tracking-tight text-gray-950">Delivery details</h2>

              <div>
                <label className="block text-[11px] text-gray-500 font-medium mb-1">
                  Country/Region
                </label>
                <select
                  disabled
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800 bg-gray-50 cursor-not-allowed"
                >
                  <option value="PK">Pakistan</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white transition-colors ${
                    errors.fullName
                      ? "border-red-500 bg-red-50/20"
                      : "border-gray-300 focus:border-black focus:outline-none"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Address (House / Street / Area) *"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white transition-colors ${
                    errors.address
                      ? "border-red-500 bg-red-50/20"
                      : "border-gray-300 focus:border-black focus:outline-none"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="City *"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 bg-white focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <CountryPhoneInput
                  value={formData.phone}
                  countryCode={selectedCountryCode}
                  onCountryCodeChange={(code) => {
                    setSelectedCountryCode(code);
                    if (errors.phone) handleInputChange("phone", formData.phone);
                  }}
                  onPhoneChange={(val) => handleInputChange("phone", val)}
                  error={errors.phone}
                />
              </div>

              <div>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="Alternate phone number (optional)"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white transition-colors ${
                    errors.alternatePhone
                      ? "border-red-500 bg-red-50/20"
                      : "border-gray-300 focus:border-black focus:outline-none"
                  }`}
                />
                <p className="mt-1.5 text-[11px] text-gray-500">
                  Add a second number for delivery coordination (optional).
                </p>
                {errors.alternatePhone && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.alternatePhone}</p>
                )}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 select-none pt-1">
                <input
                  type="checkbox"
                  checked={saveDetails}
                  onChange={(e) => setSaveDetails(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                />
                <span>Save this information for next time</span>
              </label>
            </div>

            {/* Delivery Method Section */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base font-semibold tracking-tight text-gray-950">Delivery</h2>
              <div className="flex items-center justify-between border-y border-gray-200 px-1 py-4">
                <div>
                  <span className="block text-sm font-semibold text-gray-950">Standard delivery</span>
                  <span className="mt-0.5 block text-[11px] text-gray-500">Reliable delivery across Pakistan</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {deliveryData.enabled && deliveryData.amount > 0
                    ? `PKR ${deliveryData.amount.toLocaleString()}`
                    : "Free"}
                </span>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="space-y-3 pt-2">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-gray-950">Payment</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <FiLock size={12} /> All transactions are secure and encrypted.
                </p>
              </div>

              {availablePrepaidDiscount > 0 &&
                (allowedPaymentMethods === "both" || allowedPaymentMethods === "prepaid") && (
                  <div className="rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2.5 text-center text-xs font-semibold text-white shadow-sm">
                    Get PKR {availablePrepaidDiscount.toLocaleString()} off with advance payment via Bank Deposit, EasyPaisa, JazzCash or other available methods
                  </div>
                )}

              <div className="divide-y divide-gray-200 border-y border-gray-200 bg-transparent">
                {/* COD Option */}
                {(allowedPaymentMethods === "both" || allowedPaymentMethods === "cod") && (
                  <div
                    onClick={() => setPaymentMethod("Cash on Delivery")}
                    className={`p-4 cursor-pointer transition-colors ${
                      paymentMethod === "Cash on Delivery" ? "bg-gray-50/80" : "hover:bg-gray-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "Cash on Delivery"}
                        onChange={() => setPaymentMethod("Cash on Delivery")}
                        className="w-4 h-4 text-black focus:ring-black accent-black cursor-pointer"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                  </div>
                )}

                {/* Prepaid Option */}
                {(allowedPaymentMethods === "both" || allowedPaymentMethods === "prepaid") && (
                  <div
                    onClick={() => setPaymentMethod("Prepaid")}
                    className={`p-4 cursor-pointer transition-colors ${
                      paymentMethod === "Prepaid" ? "bg-gray-50/80" : "hover:bg-gray-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "Prepaid"}
                        onChange={() => setPaymentMethod("Prepaid")}
                        className="w-4 h-4 text-black focus:ring-black accent-black cursor-pointer"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        Advance Payment: Bank Deposit / EasyPaisa / JazzCash
                      </span>
                    </div>
                    <p className="mt-2 pl-7 text-[11px] leading-relaxed text-gray-500">
                      After placing your order, our team will contact you to
                      verify your advance payment before processing the order.
                    </p>

                    {paymentMethod === "Prepaid" && (
                      <div className="mt-4 pl-7 space-y-4 animate-in fade-in">
                        {(paymentAccountTitle || paymentAccountNumber || paymentDetails) && (
                          <div className="flex items-start justify-between gap-3 border-y border-amber-200 bg-amber-50/60 px-1 py-3">
                            <div className="min-w-0 space-y-1 text-xs text-amber-900">
                              <img
                                src="https://res.cloudinary.com/qmgjj5vu/image/upload/v1791659931/allied-bank-limited-logo_xrtuvq.png"
                                alt="Allied Bank Limited"
                                className="mb-3 h-14 w-auto object-contain object-left"
                              />
                              {paymentAccountTitle && (
                                <p>
                                  <span className="font-semibold">Account title:</span>{" "}
                                  {paymentAccountTitle}
                                </p>
                              )}
                              {paymentAccountNumber && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-mono">
                                    <span className="font-sans font-semibold">Account number:</span>{" "}
                                    {paymentAccountNumber}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyPaymentDetails();
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-[11px] font-bold text-amber-900 transition hover:bg-amber-100 cursor-pointer"
                                    aria-label="Copy account number"
                                  >
                                    <FiCopy size={13} />
                                    {paymentDetailsCopied ? "Copied" : "Copy account number"}
                                  </button>
                                </div>
                              )}
                              {paymentDetails && (
                                <p className="whitespace-pre-line pt-1 text-[11px]">
                                  {paymentDetails}
                                </p>
                              )}
                            </div>
                            {!paymentAccountNumber && <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPaymentDetails();
                              }}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-[11px] font-bold text-amber-900 transition hover:bg-amber-100 cursor-pointer"
                              aria-label="Copy payment account number"
                            >
                              <FiCopy size={13} />
                              {paymentDetailsCopied ? "Copied" : "Copy"}
                            </button>
                            }
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                              Transaction ID *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. TXN987654"
                              value={formData.paymentReference}
                              onChange={(e) =>
                                handleInputChange("paymentReference", e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 bg-white focus:border-black focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                              Screenshot Proof *
                            </label>
                            <div onClick={(e) => e.stopPropagation()}>
                              <LocalImageUpload
                                value={formData.paymentProofUrl}
                                onChange={(url) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    paymentProofUrl: url,
                                  }))
                                }
                                onRemove={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    paymentProofUrl: "",
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Complete Order Submit Button */}
            <div className="pt-8 pb-20 sm:pt-4 sm:pb-4">
              <button
                type="submit"
                id="checkout-submit-button"
                disabled={isSubmitting}
                className="checkout-submit-button w-full rounded-xl bg-blue-600 py-4 text-sm font-medium uppercase tracking-widest text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing order...
                  </span>
                ) : (
                  "Complete order"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Cart Items, Coupon Input & Summary */}
        <div className="order-1 space-y-6 border-b border-gray-200 bg-white px-4 py-7 sm:px-10 lg:sticky lg:top-0 lg:order-2 lg:min-h-screen lg:border-b-0 lg:border-l lg:px-10 lg:py-12">
          {/* Cart Items List */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0 pt-1 pr-1">
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400">Item</span>
                      )}
                    </div>
                    <span className="absolute top-0 right-0 z-10 w-5 h-5 rounded-full bg-[#666666] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">
                      {item.name}
                    </p>
                    {item.size && (
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Size: {item.size}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-900 whitespace-nowrap">
                  PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Discount Code Input Box */}
          <form onSubmit={handleApplyCoupon} className="border-t border-gray-200 pt-5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code"
                value={couponCodeInput}
                onChange={(e) => {
                  setCouponCodeInput(e.target.value.toUpperCase());
                  if (couponError) setCouponError(null);
                }}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white uppercase font-mono font-medium transition-colors ${
                  couponError
                    ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:outline-none"
                    : "border-gray-300 focus:border-black focus:outline-none"
                }`}
              />
              <button
                type="submit"
                id="coupon-apply-button"
                disabled={isApplyingCoupon}
                className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isApplyingCoupon ? "..." : "Apply"}
              </button>
            </div>
            {couponError && (
              <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1 animate-in fade-in">
                <span>•</span> {couponError}
              </p>
            )}
          </form>

          {/* Applied Coupon Badge */}
          {appliedCoupon && (
            <div className="flex items-center justify-between border-y border-emerald-200 bg-emerald-50/70 px-1 py-2.5 text-xs font-semibold text-emerald-800 animate-in fade-in">
              <span className="flex items-center gap-2">
                <FiTag className="text-emerald-600" size={14} />
                <span>
                  Code &quot;{appliedCoupon.code}&quot; applied (-PKR {appliedCoupon.discountAmount.toLocaleString()})
                  {appliedCoupon.influencerName && (
                    <span className="block text-[10px] text-emerald-700 font-normal">
                      Influencer: {appliedCoupon.influencerName}
                    </span>
                  )}
                </span>
              </span>
              <button
                onClick={handleRemoveCoupon}
                className="text-emerald-700 hover:text-emerald-950 underline text-xs cursor-pointer font-bold"
              >
                Remove
              </button>
            </div>
          )}

          {/* Subtotal & Calculations */}
          <div className="space-y-2.5 pt-4 border-t border-gray-200 text-xs">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Subtotal</span>
              <span className="text-gray-900 font-semibold">PKR {subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-gray-600 font-medium">
              <span>Delivery</span>
              <span className="text-gray-900 font-semibold">
                {deliveryData.enabled && deliveryData.amount > 0
                  ? `PKR ${deliveryData.amount.toLocaleString()}`
                  : "Free"}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Applied</span>
                <span>- PKR {couponDiscountAmount.toLocaleString()}</span>
              </div>
            )}

            {prepaidDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Prepaid Discount</span>
                <span>- PKR {prepaidDiscountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-4 border-t border-gray-200 text-gray-900">
              <span className="text-sm font-bold">Total</span>
              <span className="text-xl font-extrabold text-black">
                <span className="text-xs font-normal text-gray-500 mr-1.5">PKR</span>
                Rs {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white px-4 py-5 text-center text-[11px] font-medium tracking-wide text-gray-400">
        Powered by{" "}
        <a
          href="https://xenzox.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 transition-colors hover:text-gray-900 hover:underline"
        >
          Xenzox Technologies
        </a>
      </div>

      {/* Success Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <FiCheckCircle size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Confirmed!</h2>
              <p className="text-xs text-gray-500 mt-1">
                Order ID: <span className="font-mono font-bold text-black">#{placedOrderId}</span>
              </p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Thank you for your order! We have received your order details and our team will process it shortly.
            </p>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={handleDownloadPdfSlip}
                className="w-full py-3 rounded-xl bg-black text-[#ffffff] font-semibold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiDownload size={16} />
                Download Order Slip
              </button>

              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  router.push("/");
                }}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
