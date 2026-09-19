import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { auth } from "@/app/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 20);
    const group = searchParams.get("group");
    const placement = searchParams.get("placement");
    const paramCompanyId = searchParams.get("companyId");
    const paramSlug = searchParams.get("slug");
    const skip = (page - 1) * limit;

    // 1. Resolve merchant / tenant company context
    const session = await auth();
    let targetCompanyId =
      paramCompanyId ||
      session?.user?.activeCompanyId ||
      session?.user?.companyId ||
      null;

    const effectiveAdminId = (session?.user as any)?.adminId || session?.user?.id || null;

    if (!targetCompanyId && paramSlug) {
      const comp = await prisma.company.findUnique({
        where: { slug: paramSlug },
        select: { id: true },
      });
      if (comp) {
        targetCompanyId = comp.id;
      }
    }

    // Strict multi-tenant isolation:
    // If no merchant context is identifiable, NEVER leak arbitrary merchant assets.
    if (!targetCompanyId && !effectiveAdminId) {
      return NextResponse.json({
        items: [],
        hasMore: false,
        page,
        totalItems: 0,
      });
    }

    const conditions: any[] = [];

    // Enforce Company Scope
    if (targetCompanyId) {
      conditions.push({
        OR: [
          { companyId: targetCompanyId },
          ...(effectiveAdminId
            ? [{ AND: [{ companyId: null }, { adminId: effectiveAdminId }] }]
            : []),
        ],
      });
    } else if (effectiveAdminId) {
      conditions.push({ adminId: effectiveAdminId });
    }

    if (group && group !== "All") {
      conditions.push({ group });
    }

    if (placement) {
      conditions.push({
        OR: [{ placement }, { placement: "both" }, { placement: null }],
      });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    // Fetch batch of items + total count in parallel
    const [items, totalItems] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.image.count({ where }),
    ]);

    const formattedItems = items.map((item) => ({
      ...item,
      images: [item.url, ...(item.additionalUrls || [])].filter(Boolean),
      price: item.priceKobo ? Math.round(item.priceKobo / 100) : 35000,
    }));

    const hasMore = skip + items.length < totalItems;

    return NextResponse.json({
      items: formattedItems,
      hasMore,
      page,
      totalItems,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

// 2. POST: Save new Cloudinary item into Database
export async function POST(req: Request) {
  const session = await auth();
  const userRole = (session?.user?.role || "").toUpperCase();

  if (!session || (userRole !== "ADMIN" && userRole !== "MANAGER" && userRole !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const {
      url,
      additionalUrls = [],
      title,
      category,
      size,
      type,
      group,
      placement,
      price,
      description,
      itemGroupId,
    } = await req.json();

    const effectiveAdminId = (session.user as any)?.adminId || session.user.id;
    let targetCompanyId =
      (session.user as any)?.activeCompanyId ||
      (session.user as any)?.companyId ||
      null;

    if (!targetCompanyId) {
      const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id, status: "ACTIVE" },
        select: { companyId: true },
      });
      if (member) {
        targetCompanyId = member.companyId;
      }
    }

    const priceKobo = price ? Math.round(Number(price) * 100) : 3500000;

    const newItem = await prisma.image.create({
      data: {
        url,
        additionalUrls: Array.isArray(additionalUrls) ? additionalUrls : [],
        title,
        description: description?.trim() || null,
        priceKobo,
        itemGroupId: itemGroupId || null,
        category,
        group: group || "Native",
        placement: placement || "both",
        size: size ? Number(size) : null,
        type: type || "image",
        adminId: effectiveAdminId,
        companyId: targetCompanyId,
      },
    });

    // Asynchronously synchronize storage usage for workspace
    const { checkUserStorage } = await import("@/app/api/workers/storageWorker");
    checkUserStorage(effectiveAdminId, true).catch((err) =>
      console.error("[Collections POST] Storage recalculation error:", err)
    );

    const formattedItem = {
      ...newItem,
      images: [newItem.url, ...(newItem.additionalUrls || [])].filter(Boolean),
      price: newItem.priceKobo ? Math.round(newItem.priceKobo / 100) : 35000,
    };

    return NextResponse.json(formattedItem, { status: 201 });
  } catch (error) {
    console.error("Collections POST error:", error);
    return NextResponse.json({ error: "Failed to save collection to database" }, { status: 500 });
  }
}


