import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/app/lib/prisma/prisma";
import { bufferCompanyVisit } from "@/app/api/workers/trafficWorker";
import CheckoutClient, { CheckoutData, RecommendationItem } from "./CheckoutClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // 1. Try finding by Order
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { reference: id }, { invoiceNumber: id }],
    },
    include: {
      company: {
        include: { siteSetting: true },
      },
    },
  }).catch(() => null);

  if (order) {
    const storeName = order.company.siteSetting?.companyName || order.company.name;
    const rawItems = Array.isArray(order.items) ? (order.items as any[]) : [];
    const previewImages = rawItems.flatMap((it) => it.images || (it.image ? [it.image] : []));

    return {
      title: `Checkout #${order.invoiceNumber || order.reference} — ${storeName}`,
      description: `Complete your order of ₦${(order.amountKobo / 100).toLocaleString()} with ${storeName}. 24-hour buyer protection.`,
      openGraph: {
        title: `${storeName} Checkout`,
        description: `Complete your order with ${storeName}. Safe 24-hour escrow protection.`,
        images: previewImages.slice(0, 3).map((url) => ({ url })),
      },
    };
  }

  // 2. Try finding by Image
  const directImage = await prisma.image.findUnique({
    where: { id },
    include: {
      company: {
        include: { siteSetting: true },
      },
    },
  }).catch(() => null);

  if (directImage) {
    const storeName = directImage.company?.siteSetting?.companyName || directImage.company?.name || "Ti Stiches";
    const itemTitle = directImage.title || "Bespoke Collection Piece";
    const allImages = [directImage.url, ...(directImage.additionalUrls || [])].filter(Boolean);
    const priceNaira = directImage.priceKobo ? Math.round(directImage.priceKobo / 100) : 35000;

    return {
      title: `${itemTitle} — ${storeName}`,
      description: directImage.description || `Order ${itemTitle} directly from ${storeName} for ₦${priceNaira.toLocaleString()}. 24-hour escrow protection.`,
      openGraph: {
        title: `${itemTitle} — ${storeName}`,
        description: directImage.description || `Order ${itemTitle} from ${storeName}.`,
        images: allImages.map((url) => ({ url })),
      },
    };
  }

  // 3. Try finding by Product
  const directProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      company: {
        include: { siteSetting: true },
      },
    },
  }).catch(() => null);

  if (directProduct) {
    const storeName = directProduct.company.siteSetting?.companyName || directProduct.company.name;
    const priceNaira = Math.round(directProduct.priceKobo / 100);

    return {
      title: `${directProduct.title} — ${storeName}`,
      description: directProduct.description || `Order ${directProduct.title} from ${storeName} for ₦${priceNaira.toLocaleString()}.`,
      openGraph: {
        title: `${directProduct.title} — ${storeName}`,
        description: directProduct.description || `Order from ${storeName}.`,
        images: directProduct.images.map((url) => ({ url })),
      },
    };
  }

  return {
    title: "Checkout | Ti Stiches",
    description: "Secure 24-hour buyer protected checkout.",
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { id } = await params;

  // 1. Check if id is an existing Order
  let order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { reference: id }, { invoiceNumber: id }],
    },
    include: {
      company: {
        include: { siteSetting: true },
      },
    },
  }).catch(() => null);

  // 2. If not an existing Order, check if id is a direct shared Image link
  if (!order) {
    const directImage = await prisma.image.findUnique({
      where: { id },
      include: {
        company: {
          include: { siteSetting: true },
        },
      },
    }).catch(() => null);

    if (directImage) {
      // Track Image ID visit / company visit
      if (directImage.companyId) {
        bufferCompanyVisit(directImage.companyId).catch(() => null);
      }

      const company =
        directImage.company ||
        (await prisma.company.findFirst({
          where: { status: "ACTIVE" },
          include: { siteSetting: true },
        }));

      if (company) {
        const priceKobo = directImage.priceKobo || 3500000;
        const allImages = [directImage.url, ...(directImage.additionalUrls || [])].filter(Boolean);
        const reference = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Create an authentic draft Order in database for this direct image item
        order = await prisma.order.create({
          data: {
            companyId: company.id,
            reference,
            orderType: "CATALOG",
            amountKobo: priceKobo,
            originalAmountKobo: priceKobo,
            discountKobo: 0,
            shippingKobo: 0,
            status: "PENDING",
            customerEmail: "guest@checkout.local",
            items: [
              {
                id: directImage.id,
                name: directImage.title || "Bespoke Collection Piece",
                price: Math.round(priceKobo / 100),
                quantity: 1,
                image: allImages[0] || "/images/placeholder.webp",
                images: allImages,
                category: directImage.category || "Bespoke",
                description: directImage.description || null,
                attributes: {
                  "Garment Group": directImage.group || "Native",
                },
              },
            ],
            notes: directImage.description || null,
          },
          include: {
            company: {
              include: { siteSetting: true },
            },
          },
        });
      }
    }
  }

  // 3. If not an image, check if id is a direct Product
  if (!order) {
    const directProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        company: {
          include: { siteSetting: true },
        },
      },
    }).catch(() => null);

    if (directProduct) {
      bufferCompanyVisit(directProduct.companyId).catch(() => null);

      const reference = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const priceNaira = Math.round(directProduct.priceKobo / 100);

      order = await prisma.order.create({
        data: {
          companyId: directProduct.companyId,
          reference,
          orderType: "CATALOG",
          amountKobo: directProduct.priceKobo,
          originalAmountKobo: directProduct.priceKobo,
          discountKobo: 0,
          shippingKobo: 0,
          status: "PENDING",
          customerEmail: "guest@checkout.local",
          items: [
            {
              id: directProduct.id,
              name: directProduct.title,
              price: priceNaira,
              quantity: 1,
              image: directProduct.images[0] || "/images/placeholder.webp",
              images: directProduct.images,
              category: directProduct.category || "General",
              description: directProduct.description || null,
              attributes: (directProduct.attributes as Record<string, any>) || null,
            },
          ],
          notes: directProduct.description || null,
        },
        include: {
          company: {
            include: { siteSetting: true },
          },
        },
      });
    }
  }

  if (!order) {
    notFound();
  }

  const siteSetting = order.company.siteSetting;
  const originalAmount = order.originalAmountKobo
    ? Math.round(order.originalAmountKobo / 100)
    : Math.round(order.amountKobo / 100);
  const discountAmount = order.discountKobo
    ? Math.round(order.discountKobo / 100)
    : 0;
  const finalAmount = Math.round(order.amountKobo / 100);
  const shippingAmount = Math.round(order.shippingKobo / 100);

  const rawItems = Array.isArray(order.items) ? (order.items as any[]) : [];
  const currentItemIds = rawItems.map((it: any) => it.id).filter(Boolean);

  // 4. Query Recommendations: Other products/collections from this merchant
  const [recProducts, recImages] = await Promise.all([
    prisma.product.findMany({
      where: {
        companyId: order.companyId,
        isAvailable: true,
        ...(currentItemIds.length > 0 && { id: { notIn: currentItemIds } }),
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.image.findMany({
      where: {
        companyId: order.companyId,
        ...(currentItemIds.length > 0 && { id: { notIn: currentItemIds } }),
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  const recommendations: RecommendationItem[] = [
    ...recProducts.map((p) => {
      const priceNaira = Math.round(p.priceKobo / 100);
      return {
        id: p.id,
        name: p.title,
        price: priceNaira,
        priceKobo: p.priceKobo,
        image: p.images[0] || siteSetting?.tailorBioImage || "/images/placeholder.webp",
        images: p.images.length > 0 ? p.images : [siteSetting?.tailorBioImage || "/images/placeholder.webp"],
        category: p.category || "Ready-to-Wear",
      };
    }),
    ...recImages.map((img) => {
      const allImgs = [img.url, ...(img.additionalUrls || [])].filter(Boolean);
      const priceNaira = img.priceKobo ? Math.round(img.priceKobo / 100) : 35000;
      return {
        id: img.id,
        name: img.title || "Bespoke Garment",
        price: priceNaira,
        priceKobo: img.priceKobo || 3500000,
        image: allImgs[0] || "/images/placeholder.webp",
        images: allImgs,
        category: img.category || "Bespoke",
      };
    }),
  ].slice(0, 6);

  const checkoutData: CheckoutData = {
    orderId: order.id,
    reference: order.reference,
    invoiceNumber: order.invoiceNumber || null,
    orderType: order.orderType,
    status: order.status,
    notes: order.notes,
    originalPrice: originalAmount,
    discount: discountAmount,
    shipping: shippingAmount,
    totalPrice: finalAmount,
    customerName: order.customerName || "",
    customerEmail: order.customerEmail || "",
    customerPhone: order.customerPhone || "",
    items: rawItems.map((item: any, idx: number) => {
      const itemImages = Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : [item.image || siteSetting?.tailorBioImage || "/images/placeholder.webp"];

      return {
        id: item.id || `item_${idx}`,
        name: item.name || item.title || `Item #${idx + 1}`,
        price: item.price ? Number(item.price) : finalAmount,
        quantity: item.quantity ? Number(item.quantity) : 1,
        image: itemImages[0],
        images: itemImages,
        attributes: item.attributes || null,
      };
    }),
    store: {
      name: siteSetting?.companyName?.trim() || order.company.name,
      slug: order.company.slug,
      avatar: siteSetting?.tailorBioImage || null,
      whatsappNumber: siteSetting?.whatsappNumber || null,
      themeColor: siteSetting?.themeColor || siteSetting?.accentColor || "#C9A96E",
      location: [siteSetting?.city, siteSetting?.state].filter(Boolean).join(", ") || "Nigeria",
    },
    recommendations,
  };

  return <CheckoutClient data={checkoutData} />;
}
