"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  MessageCircle, 
  CheckCircle2, 
  MapPin, 
  Minus, 
  Plus, 
  X, 
  ArrowRight,
  ShieldCheck,
  Tag,
  Share2,
  Check,
  Images as ImagesIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Home
} from "lucide-react";

export interface StoreProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceKobo: number;
  formattedPrice: string;
  image: string;
  images: string[];
  category: string;
  stock: number;
  available: boolean;
  attributes: Record<string, any> | null;
}

export interface StorefrontData {
  storeName: string;
  slug: string;
  industry: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  physicalAddress: string | null;
  whatsappNumber: string | null;
  themeColor: string;
  layoutMode: "GRID_2X2" | "LIST";
  categories: string[];
  products: StoreProduct[];
}

interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export default function StorefrontClient({ store }: { store: StorefrontData }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [modalImageIdx, setModalImageIdx] = useState<number>(0);
  const [modalTouchStartX, setModalTouchStartX] = useState<number | null>(null);
  const [modalTouchEndX, setModalTouchEndX] = useState<number | null>(null);
  const [copiedModalLink, setCopiedModalLink] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [homeUrl, setHomeUrl] = useState<string>("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host.toLowerCase();
      if (host.startsWith(`${store.slug.toLowerCase()}.`)) {
        setHomeUrl("/");
      } else {
        setHomeUrl(`/landing/${store.slug}`);
      }
    }
  }, [store.slug]);

  useEffect(() => {
    setModalImageIdx(0);
    setCopiedModalLink(false);
  }, [selectedProduct]);

  // Clean WhatsApp Number format
  const rawWaNumber = store.whatsappNumber?.replace(/\D/g, "") || "";
  const formattedWaNumber = rawWaNumber.startsWith("0") 
    ? `234${rawWaNumber.slice(1)}` 
    : rawWaNumber;

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return store.products;
    return store.products.filter((p) => p.category === activeCategory);
  }, [store.products, activeCategory]);

  // Cart calculations
  const cartTotalCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartTotalPrice = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const addToCart = (product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setDrawerOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // WhatsApp Pre-filled message generator for individual product inquiry
  const getProductWhatsAppUrl = (product: StoreProduct) => {
    if (!formattedWaNumber) return "#";
    const text = encodeURIComponent(
      `Hello ${store.storeName}, I saw "${product.name}" (${product.formattedPrice}) on your store link (${product.id}) and I would like to inquire/order.`
    );
    return `https://wa.me/${formattedWaNumber}?text=${text}`;
  };

  // General WhatsApp contact link
  const generalWhatsAppUrl = formattedWaNumber
    ? `https://wa.me/${formattedWaNumber}?text=${encodeURIComponent(
        `Hello ${store.storeName}, I am browsing your store link and would like to ask a question.`
      )}`
    : "#";

  // WhatsApp Order Submission link from Slide-up Drawer
  const getCartWhatsAppUrl = () => {
    if (!formattedWaNumber || cart.length === 0) return "#";
    const itemsList = cart
      .map(
        (item, i) =>
          `${i + 1}. ${item.product.name} x${item.quantity} — ₦${(
            item.product.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n");

    const notesSnippet = orderNotes.trim()
      ? `\n\n*Custom Sizing / Order Notes:*\n${orderNotes.trim()}`
      : "";

    const message = `Hello ${store.storeName}, I want to place an order from your store link:\n\n${itemsList}\n\n*Total:* ₦${cartTotalPrice.toLocaleString()}${notesSnippet}\n\nPlease confirm availability and payment details.`;

    return `https://wa.me/${formattedWaNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleProceedToCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug: store.slug,
          items: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
            attributes: item.product.attributes,
          })),
          notes: orderNotes,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
      } else {
        alert(data.error || "Unable to proceed to checkout");
      }
    } catch (err) {
      console.error("Checkout navigation error:", err);
      alert("Unable to proceed to checkout right now. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans antialiased selection:bg-[#C9A96E]/20">
      {/* 1. Header Profile Banner */}
      <header className="max-w-xl mx-auto px-5 pt-8 pb-6 text-center relative">
        {/* Home Navigation Button Top Left */}
        <Link
          href={homeUrl}
          title={`Back to ${store.storeName} Home`}
          className="absolute left-5 top-8 px-3.5 py-1.5 flex items-center gap-1.5 rounded-full bg-white border border-[#E5DFD7] text-xs font-semibold text-[#555] hover:text-[#1A1A1A] hover:border-[#C9A96E]/60 shadow-sm transition-all active:scale-95 group"
        >
          <Home className="w-3.5 h-3.5 text-[#C9A96E] group-hover:scale-110 transition-transform" />
          <span>Home</span>
        </Link>

        {/* Share Button Top Right */}
        <button
          onClick={copyShareLink}
          title="Share Store Link"
          className="absolute right-5 top-8 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E5DFD7] text-[#666] hover:text-[#1A1A1A] shadow-sm transition-all active:scale-95"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
        </button>

        {/* Vendor Avatar / Logo */}
        <div className="relative inline-block mb-3">
          <div 
            className="w-24 h-24 rounded-full p-0.5 border-2 shadow-md overflow-hidden bg-white mx-auto flex items-center justify-center"
            style={{ borderColor: store.themeColor }}
          >
            {store.avatar ? (
              <img
                src={store.avatar}
                alt={store.storeName}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/bg-img/native10.jpg";
                }}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-xl font-bold text-white uppercase rounded-full"
                style={{ backgroundColor: store.themeColor }}
              >
                {store.storeName.slice(0, 2)}
              </div>
            )}
          </div>
          {/* Verified Badge */}
          <div 
            className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow"
            style={{ backgroundColor: store.themeColor }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Store Name & Verification */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
            {store.storeName}
          </h1>
          <CheckCircle2 className="w-5 h-5 text-[#C9A96E] shrink-0 fill-[#C9A96E]/15" />
        </div>

        {/* Bio */}
        {store.bio && (
          <p className="text-sm text-[#555] max-w-md mx-auto leading-relaxed mb-3">
            {store.bio}
          </p>
        )}

        {/* Location & Opening Hours */}
        {store.location && (
          <div className="inline-flex items-center gap-1 text-xs text-[#777] bg-white border border-[#E5DFD7] px-3 py-1 rounded-full mb-4 shadow-sm">
            <MapPin className="w-3 h-3 text-[#C9A96E]" />
            <span>{store.location}</span>
          </div>
        )}

        {/* Direct WhatsApp Pre-Checkout Navigation CTA Button */}
        {formattedWaNumber && (
          <div className="mt-1">
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full max-w-sm px-6 py-2.5 rounded-full font-semibold text-sm text-white shadow-md transition-all duration-200 active:scale-98 hover:opacity-95"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat with Merchant on WhatsApp</span>
            </a>
          </div>
        )}
      </header>

      {/* 2. Category Filter Tabs */}
      <nav className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-y border-[#E8E2D9] py-3">
        <div className="max-w-xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {store.categories.map((cat) => {
            const count = cat === "All" 
              ? store.products.length 
              : store.products.filter(p => p.category === cat).length;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? "text-white shadow-sm font-semibold"
                    : "bg-white text-[#555] hover:text-[#1A1A1A] border border-[#E5DFD7]"
                }`}
                style={isActive ? { backgroundColor: store.themeColor } : {}}
              >
                {cat}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-[#ECE6DE] text-[#666]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Product Catalog Feed */}
      <main className="max-w-xl mx-auto px-4 py-6 pb-28">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E2D9] p-8 mt-4">
            <ShoppingBag className="w-12 h-12 text-[#CCC] mx-auto mb-3" />
            <h3 className="font-semibold text-base text-[#333]">No products found</h3>
            <p className="text-xs text-[#777] mt-1">
              There are currently no items listed under "{activeCategory}".
            </p>
          </div>
        ) : store.layoutMode === "LIST" ? (
          /* Single-Column Card List Layout */
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E8E2D9] p-3 flex gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div 
                  className="w-24 h-24 rounded-xl overflow-hidden bg-[#F5F2EB] shrink-0 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/bg-img/native1.jpeg";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-[#999] uppercase block mb-0.5">
                      {product.category}
                    </span>
                    <h3 
                      onClick={() => setSelectedProduct(product)}
                      className="font-semibold text-sm text-[#1A1A1A] truncate cursor-pointer hover:underline"
                    >
                      {product.name}
                    </h3>
                    <p 
                      className="text-sm font-bold mt-1"
                      style={{ color: store.themeColor }}
                    >
                      {product.formattedPrice}
                    </p>

                    {/* Dynamic Key-Value Attributes Chips */}
                    {product.attributes && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(product.attributes).slice(0, 2).map(([key, val]) => (
                          <span
                            key={key}
                            className="text-[10px] bg-[#F7F4EE] text-[#666] px-1.5 py-0.5 rounded border border-[#E8E2D9]"
                          >
                            {key}: {String(val)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {formattedWaNumber && (
                      <a
                        href={getProductWhatsAppUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat & Negotiate on WhatsApp"
                        className="px-2.5 py-1.5 rounded-lg border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Inquire</span>
                      </a>
                    )}
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                      style={{ backgroundColor: store.themeColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buy / Order</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 2x2 Grid Layout (Default) */
          <div className="grid grid-cols-2 gap-3.5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
              >
                <div 
                  className="aspect-square relative bg-[#F5F2EB] overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/bg-img/native1.jpeg";
                    }}
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[#555]">
                    {product.category}
                  </span>
                  {product.images && product.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                      <ImagesIcon className="w-2.5 h-2.5 text-[#C9A96E]" />
                      {product.images.length}
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => setSelectedProduct(product)}
                      className="font-semibold text-xs sm:text-sm text-[#1A1A1A] line-clamp-1 cursor-pointer hover:underline"
                    >
                      {product.name}
                    </h3>
                    <p 
                      className="text-xs sm:text-sm font-bold mt-1"
                      style={{ color: store.themeColor }}
                    >
                      {product.formattedPrice}
                    </p>

                    {/* Dynamic Key-Value Attributes Chips */}
                    {product.attributes && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(product.attributes).slice(0, 1).map(([key, val]) => (
                          <span
                            key={key}
                            className="text-[9px] bg-[#F7F4EE] text-[#666] px-1.5 py-0.5 rounded border border-[#E8E2D9] truncate max-w-full"
                          >
                            {key}: {String(val)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#F0EBE3]">
                    {formattedWaNumber && (
                      <a
                        href={getProductWhatsAppUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Negotiate on WhatsApp"
                        className="w-8 h-8 rounded-lg border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 flex items-center justify-center shrink-0 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                      style={{ backgroundColor: store.themeColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. Floating Cart Pill (Visible when items are in cart) */}
      {cartTotalCount > 0 && !drawerOpen && (
        <div className="fixed bottom-5 inset-x-0 z-40 px-4 flex justify-center">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full max-w-md bg-[#1A1A1A] text-white py-3.5 px-5 rounded-full shadow-2xl flex items-center justify-between transition-all active:scale-98 animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: store.themeColor }}
              >
                {cartTotalCount}
              </div>
              <span className="font-semibold text-sm">View Cart / Checkout</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm">
              <span>₦{cartTotalPrice.toLocaleString()}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* 5. Slide-up Checkout Drawer (Bottom Sheet) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-[#E8E2D9] max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E8E2D9] flex items-center justify-between bg-[#FDFBF7]">
              <div>
                <h2 className="font-bold text-base text-[#1A1A1A]">Your Order Cart</h2>
                <p className="text-xs text-[#777]">{cartTotalCount} item(s) selected</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EEE] flex items-center justify-center text-[#555] hover:text-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="w-10 h-10 text-[#CCC] mx-auto mb-2" />
                  <p className="text-sm text-[#777]">Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 pb-3 border-b border-[#F0EBE3]"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-[#F5F2EB] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-[#777]">
                        ₦{item.product.price.toLocaleString()} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-xs text-[#555]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-xs text-[#555]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[#E8E2D9] bg-[#FDFBF7] space-y-3">
                <input
                  type="text"
                  placeholder="Optional custom sizing / instructions..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#E8E2D9] bg-white focus:outline-none"
                />
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2"
                  style={{ backgroundColor: store.themeColor }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isCheckingOut
                      ? "Creating Order..."
                      : `Proceed to Checkout (₦${cartTotalPrice.toLocaleString()})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Product Quick-View / Mobile Multi-Image Modal */}
      {selectedProduct && (() => {
        const productImages =
          selectedProduct.images && selectedProduct.images.length > 0
            ? selectedProduct.images
            : [selectedProduct.image];

        const handleModalTouchStart = (e: React.TouchEvent) => {
          setModalTouchStartX(e.targetTouches[0].clientX);
        };
        const handleModalTouchMove = (e: React.TouchEvent) => {
          setModalTouchEndX(e.targetTouches[0].clientX);
        };
        const handleModalTouchEnd = () => {
          if (!modalTouchStartX || !modalTouchEndX) return;
          const diff = modalTouchStartX - modalTouchEndX;
          if (diff > 35 && modalImageIdx < productImages.length - 1) {
            setModalImageIdx((prev) => prev + 1);
          }
          if (diff < -35 && modalImageIdx > 0) {
            setModalImageIdx((prev) => prev - 1);
          }
          setModalTouchStartX(null);
          setModalTouchEndX(null);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#E8E2D9] relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#555] hover:text-[#1A1A1A] shadow cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Mobile Touch-Swipeable Image Container */}
              <div
                className="aspect-square bg-[#1A1A1A] relative overflow-hidden select-none touch-pan-y"
                onTouchStart={handleModalTouchStart}
                onTouchMove={handleModalTouchMove}
                onTouchEnd={handleModalTouchEnd}
              >
                <img
                  src={productImages[modalImageIdx] || selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/bg-img/native1.jpeg";
                  }}
                />

                {/* Photo Counter Pill */}
                {productImages.length > 1 && (
                  <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/20">
                    {modalImageIdx + 1} / {productImages.length}
                  </span>
                )}

                {/* Arrow navigation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalImageIdx((prev) => Math.max(0, prev - 1))}
                      disabled={modalImageIdx === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setModalImageIdx((prev) => Math.min(productImages.length - 1, prev + 1))
                      }
                      disabled={modalImageIdx === productImages.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {productImages.length > 1 && (
                <div className="px-4 pt-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                  {productImages.map((thumb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalImageIdx(idx)}
                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        modalImageIdx === idx ? "border-[#C9A96E] scale-105" : "border-transparent opacity-60"
                      }`}
                    >
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#999] block mb-0.5">
                    {selectedProduct.category}
                  </span>
                  <h3 className="font-bold text-base text-[#1A1A1A]">
                    {selectedProduct.name}
                  </h3>
                  <p 
                    className="text-base font-bold mt-0.5"
                    style={{ color: store.themeColor }}
                  >
                    {selectedProduct.formattedPrice}
                  </p>
                </div>

                {selectedProduct.description && (
                  <p className="text-xs text-[#666] leading-relaxed line-clamp-3">
                    {selectedProduct.description}
                  </p>
                )}

                {/* Direct Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/checkout/${selectedProduct.id}`);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      style={{ backgroundColor: store.themeColor }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Instant Checkout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold text-[#1A1A1A] bg-[#F5F2EB] hover:bg-[#EAE5DC] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {formattedWaNumber && (
                      <a
                        href={getProductWhatsAppUrl(selectedProduct)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        const link = `${window.location.origin}/checkout/${selectedProduct.id}`;
                        await navigator.clipboard.writeText(link);
                        setCopiedModalLink(true);
                        setTimeout(() => setCopiedModalLink(false), 2000);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl border border-[#D5CEBF] text-[#1A1A1A] text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#F5F2EB] cursor-pointer"
                    >
                      {copiedModalLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Checkout</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
