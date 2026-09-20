"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2, 
  MessageCircle, 
  Tag, 
  ArrowLeft, 
  Truck, 
  FileText, 
  Lock,
  ExternalLink,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Images as ImagesIcon
} from "lucide-react";

export interface RecommendationItem {
  id: string;
  name: string;
  price: number;
  priceKobo: number;
  image: string;
  images: string[];
  category: string;
}

export interface CheckoutItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  images?: string[];
  attributes?: Record<string, any> | null;
}

export interface CheckoutData {
  orderId: string;
  reference: string;
  invoiceNumber: string | null;
  orderType: string;
  status: string;
  notes: string | null;
  originalPrice: number;
  discount: number;
  shipping: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CheckoutItem[];
  store: {
    name: string;
    slug: string;
    avatar: string | null;
    whatsappNumber: string | null;
    themeColor: string;
    location: string;
  };
  recommendations?: RecommendationItem[];
}

export default function CheckoutClient({ data }: { data: CheckoutData }) {
  const [items, setItems] = useState<CheckoutItem[]>(data.items);
  const [addedRecIds, setAddedRecIds] = useState<Set<string>>(new Set());
  const [customerName, setCustomerName] = useState(data.customerName);
  const [customerEmail, setCustomerEmail] = useState(data.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(data.customerPhone);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-image mobile swipe gallery state
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Primary item multi-images
  const primaryImages = useMemo(() => {
    const firstItem = items[0];
    if (!firstItem) return [];
    if (firstItem.images && firstItem.images.length > 0) {
      return firstItem.images;
    }
    return [firstItem.image].filter(Boolean);
  }, [items]);

  // Clean WhatsApp Number
  const rawWa = data.store.whatsappNumber?.replace(/\D/g, "") || "";
  const formattedWa = rawWa.startsWith("0") ? `234${rawWa.slice(1)}` : rawWa;

  const [isPaid, setIsPaid] = useState(data.status === "COMPLETED");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trxref = params.get("trxref") || params.get("reference");
      if (trxref && !isPaid) {
        fetch(`/api/checkout/verify?reference=${encodeURIComponent(trxref)}`)
          .then((res) => res.json())
          .then((resData) => {
            if (resData.isPaid) {
              setIsPaid(true);
            }
          })
          .catch((err) => console.error("Verify checkout error:", err));
      }
    }
  }, [isPaid]);

  // Dynamic price calculation
  const itemsTotalPrice = useMemo(() => {
    return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [items]);

  const currentPayablePrice = Math.max(0, itemsTotalPrice - data.discount + data.shipping);

  const whatsappInquiryUrl = formattedWa
    ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(
        `Hi ${data.store.name}, I am reviewing checkout #${data.invoiceNumber || data.reference} (₦${currentPayablePrice.toLocaleString()}) and have a question.`
      )}`
    : "#";

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;
    if (isLeftSwipe && activeImageIdx < primaryImages.length - 1) {
      setActiveImageIdx((prev) => prev + 1);
    }
    if (isRightSwipe && activeImageIdx > 0) {
      setActiveImageIdx((prev) => prev - 1);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleAddRecommendation = (rec: RecommendationItem) => {
    if (addedRecIds.has(rec.id)) return;
    setAddedRecIds((prev) => new Set(prev).add(rec.id));
    setItems((prev) => [
      ...prev,
      {
        id: rec.id,
        name: rec.name,
        price: rec.price,
        quantity: 1,
        image: rec.image,
        images: rec.images,
        attributes: { Category: rec.category },
      },
    ]);
  };

  const handlePay = async () => {
    if (!customerEmail.trim()) {
      alert("Please enter a valid email address for your payment receipt.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderId,
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          items, // Pass updated items so Paystack charges the exact bundled amount
        }),
      });
      const result = await res.json();
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        alert(result.error || "Failed to connect to payment gateway.");
      }
    } catch (err) {
      console.error("Payment initialization error:", err);
      alert("Payment initialization failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans antialiased py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-5">
        {/* 1. Back to Store Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/store/${data.store.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {data.store.name}</span>
          </Link>
          <div className="flex items-center gap-1 text-xs text-[#888]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>

        {/* 2. Merchant Header Card */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full overflow-hidden border-2 bg-[#F5F2EB] shrink-0"
              style={{ borderColor: data.store.themeColor }}
            >
              <img
                src={data.store.avatar || "/bg-img/native10.jpg"}
                alt={data.store.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/bg-img/native10.jpg";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="font-bold text-sm sm:text-base text-[#1A1A1A]">
                  {data.store.name}
                </h1>
                <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" />
              </div>
              <p className="text-xs text-[#777]">{data.store.location}</p>
            </div>
          </div>

          {formattedWa && (
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </a>
          )}
        </div>

        {/* 3. Modern Mobile-Heavy Multi-Image Showcase (For items with 2+ photos) */}
        {primaryImages.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-[#777]">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#C9A96E] flex items-center gap-1">
                <ImagesIcon className="w-3.5 h-3.5" />
                Piece Gallery ({primaryImages.length} photo{primaryImages.length > 1 ? "s" : ""})
              </span>
              <span className="text-[11px] font-mono text-[#888]">
                Swipe on mobile to view angles
              </span>
            </div>

            {/* Main Interactive Touch Carousel */}
            <div
              className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#1A1A1A] select-none touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={primaryImages[activeImageIdx]}
                alt={`Photo ${activeImageIdx + 1}`}
                className="w-full h-full object-contain sm:object-cover transition-all duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/bg-img/native1.jpeg";
                }}
              />

              {/* Floating Counter Badge */}
              <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-md">
                {activeImageIdx + 1} / {primaryImages.length}
              </span>

              {/* Zoom Button */}
              <button
                type="button"
                onClick={() => setZoomImage(primaryImages[activeImageIdx])}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black flex items-center justify-center transition-colors shadow cursor-pointer"
                title="Tap to zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Desktop / Manual Arrow Controls */}
              {primaryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx((prev) => Math.max(0, prev - 1))}
                    disabled={activeImageIdx === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors disabled:opacity-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) => Math.min(primaryImages.length - 1, prev + 1))
                    }
                    disabled={activeImageIdx === primaryImages.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors disabled:opacity-0 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Dot Pagination Indicators */}
            {primaryImages.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-1">
                {primaryImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setActiveImageIdx(dotIdx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeImageIdx === dotIdx
                        ? "w-6 bg-[#C9A96E]"
                        : "w-2 bg-[#DDD] hover:bg-[#BBB]"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Horizontal Thumbnails Strip */}
            {primaryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
                {primaryImages.map((thumbUrl, thumbIdx) => (
                  <button
                    key={thumbIdx}
                    type="button"
                    onClick={() => setActiveImageIdx(thumbIdx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIdx === thumbIdx
                        ? "border-[#C9A96E] scale-105 shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Thumbnail ${thumbIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Order / Invoice Details Card */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-sm space-y-5">
          {/* Header & Status */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE3]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                {data.orderType === "INVOICE" ? "Custom Negotiated Invoice" : "Catalog Order"}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                {data.invoiceNumber || data.reference}
              </h2>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                isPaid
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {isPaid ? "Paid & Confirmed" : "Pending Payment"}
            </span>
          </div>

          {/* Negotiated Merchant Notes / Agreed Specifications */}
          {data.notes && (
            <div className="bg-[#FAF7F2] border border-[#E8DFC9] rounded-2xl p-4 flex gap-3">
              <FileText className="w-5 h-5 text-[#C9A96E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Agreed Specifications &amp; Merchant Notes
                </h4>
                <p className="text-xs text-[#555] leading-relaxed whitespace-pre-line">
                  {data.notes}
                </p>
              </div>
            </div>
          )}

          {/* Items Preview */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#666] uppercase tracking-wider">
              Order Items ({items.length})
            </h4>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#F0EBE3]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover bg-white shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/bg-img/native1.jpeg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-xs sm:text-sm text-[#1A1A1A] truncate">
                    {item.name}
                  </h5>
                  <p className="text-xs text-[#777]">
                    Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Full Price Breakdown */}
          <div className="pt-3 border-t border-[#F0EBE3] space-y-2">
            <div className="flex justify-between text-xs text-[#666]">
              <span>Items Total:</span>
              <span>₦{itemsTotalPrice.toLocaleString()}</span>
            </div>

            {data.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Negotiated Merchant Discount:
                </span>
                <span>-₦{data.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-[#666]">
              <span>Delivery / Logistics:</span>
              <span>{data.shipping > 0 ? `₦${data.shipping.toLocaleString()}` : "Included / Free"}</span>
            </div>

            <div className="pt-2 border-t border-[#E8E2D9] flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-[#1A1A1A] block">
                  Final Payable Amount:
                </span>
                <span className="text-[10px] text-[#777]">
                  Includes all platform &amp; processing fees
                </span>
              </div>
              <span
                className="text-xl sm:text-2xl font-black"
                style={{ color: data.store.themeColor }}
              >
                ₦{currentPayablePrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Recommended Items from this Merchant (POSITIONED DIRECTLY ABOVE / BEFORE CHECKOUT BUTTON) */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A96E] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C9A96E]" />
                  Recommended For You
                </span>
                <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] mt-0.5">
                  More From {data.store.name}
                </h3>
              </div>
              <Link
                href={`/store/${data.store.slug}`}
                className="text-xs font-semibold text-[#888] hover:text-[#1A1A1A] flex items-center gap-1 shrink-0"
              >
                <span>View Full Store</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.recommendations.map((rec) => {
                const isAdded = addedRecIds.has(rec.id);
                return (
                  <div
                    key={rec.id}
                    className={`flex flex-col justify-between p-2.5 rounded-2xl border transition-all ${
                      isAdded
                        ? "bg-[#FAF7F0] border-[#C9A96E]"
                        : "bg-[#FAFAF8] border-[#EAE4D9] hover:border-[#C9A96E]/50"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="aspect-square relative rounded-xl overflow-hidden bg-black/5">
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/bg-img/native1.jpeg";
                          }}
                        />
                        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-xs px-1.5 py-0.5 rounded text-white">
                          {rec.category}
                        </span>
                        {rec.images && rec.images.length > 1 && (
                          <span className="absolute bottom-1.5 right-1.5 text-[8px] font-bold bg-white/90 backdrop-blur-xs px-1 py-0.5 rounded text-black font-mono">
                            {rec.images.length} photos
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-[#1A1A1A] line-clamp-1">
                          {rec.name}
                        </h4>
                        <p className="text-xs font-bold text-[#C9A96E] mt-0.5">
                          ₦{rec.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddRecommendation(rec)}
                      disabled={isAdded}
                      className={`mt-2.5 w-full py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isAdded
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                          : "bg-white text-[#1A1A1A] border border-[#D5CEBF] hover:bg-[#C9A96E] hover:text-black hover:border-[#C9A96E]"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Added ✓</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Customer Delivery & Billing Details (Placed Before Pay Button) */}
        {!isPaid && (
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C9A96E]" />
              <span>Customer &amp; Delivery Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#555] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tunde Balogun"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5DFD7] focus:ring-1 focus:ring-[#C9A96E] bg-[#FAFAF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#555] mb-1">
                  Email for Receipt *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5DFD7] focus:ring-1 focus:ring-[#C9A96E] bg-[#FAFAF8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#555] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+234..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5DFD7] focus:ring-1 focus:ring-[#C9A96E] bg-[#FAFAF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#555] mb-1">
                  Delivery City / Area
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5DFD7] focus:ring-1 focus:ring-[#C9A96E] bg-[#FAFAF8]"
                />
              </div>
            </div>

            {/* 24-Hour Buyer Protection & Disclaimer Card */}
            <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 space-y-2.5 text-xs text-amber-950 shadow-sm">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
                    24-Hour Buyer Protection &amp; Escrow Notice
                  </h4>
                  <p className="leading-relaxed text-amber-900/90 text-[11px]">
                    You have <strong>24 hours</strong> from payment to inspect and verify delivery of your order. 
                    If you do not receive your package or items, click the dispute link below to report it and immediately freeze the merchant&apos;s payout.
                  </p>
                  <p className="text-[11px] font-semibold text-amber-950">
                    ⚠️ Notice: After 24 hours, funds automatically settle directly into the merchant&apos;s Nigerian commercial bank account and cannot be recalled or reversed by the platform.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px]">
                <Link
                  href={`/dispute?orderId=${data.orderId}&ref=${data.reference}`}
                  className="font-bold text-amber-900 hover:underline inline-flex items-center gap-1"
                >
                  <span>Have an issue? Open Dispute Desk</span>
                  <span>&rarr;</span>
                </Link>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full font-semibold">
                  24H Escrow Policy
                </span>
              </div>
            </div>

            {/* Direct Pay Button */}
            <div className="pt-1">
              <button
                onClick={handlePay}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: data.store.themeColor }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Connecting Gateway..."
                    : `Pay ₦${currentPayablePrice.toLocaleString()} via Paystack`}
                </span>
              </button>
            </div>

            {/* WhatsApp clarification link */}
            {formattedWa && (
              <div className="text-center pt-1">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Need to adjust sizing or price? Chat on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* 7. Paid & Confirmed Screen */}
        {isPaid && (
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 font-bold">
                Payment Verified &amp; Confirmed
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mt-1">
                Thank You for Your Order!
              </h2>
              <p className="text-xs text-[#666] mt-1">
                Your payment of <strong>₦{currentPayablePrice.toLocaleString()}</strong> has been safely received.
              </p>
            </div>

            {/* 24-Hour Protection Active Banner */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    24-Hour Buyer Protection Active
                  </h4>
                  <p className="text-xs text-emerald-900/90 leading-relaxed">
                    The merchant has been notified to fulfill your order. Your funds are held under 24-hour buyer protection. If you encounter any issue or do not receive your package, report it within 24 hours to freeze payout.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/dispute?orderId=${data.orderId}&ref=${data.reference}`}
                className="flex-1 py-3 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Report Issue / Non-Delivery</span>
              </Link>

              {formattedWa && (
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1a8e41] text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Chat with Tailor on WhatsApp</span>
                </a>
              )}
            </div>

            <div className="pt-2">
              <Link
                href={`/store/${data.store.slug}`}
                className="text-xs text-[#777] hover:text-[#1A1A1A] font-semibold"
              >
                &larr; Return to {data.store.name}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            type="button"
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center text-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={zoomImage}
            alt="Zoomed preview"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
