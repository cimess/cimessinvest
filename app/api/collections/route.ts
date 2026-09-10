import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { auth } from "@/app/auth";

// 1. GET: Fetch Collection Catalog (Supports high-performance cursor pagination & filter by group/category)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const rawLimit = Number(searchParams.get("limit")) || 24;
    const limit = Math.min(Math.max(1, rawLimit), 100);
    const group = searchParams.get("group");
    const category = searchParams.get("category");
    const placement = searchParams.get("placement");
    const pageParam = searchParams.get("page");

    const where: any = {
      AND: [
        placement
          ? { OR: [{ placement }, { placement: "both" }, { placement: null }] }
          : { OR: [{ placement: "both" }, { placement: "collection" }, { placement: null }] },
      ],
    };

    if (group && group !== "All") {
      where.AND.push({ group });
    }

    if (category && category !== "All") {
      where.AND.push({ category: { equals: category, mode: "insensitive" } });
    }

    // 1A. Cursor-Based Pagination (Recommended: O(1) B-tree seek, zero duplicate drift)
    if (cursor) {
      const items = await prisma.image.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        skip: 1,
        cursor: { id: cursor },
      });

      const hasMore = items.length > limit;
      const pageItems = hasMore ? items.slice(0, limit) : items;
      const nextCursor = hasMore && pageItems.length > 0 ? pageItems[pageItems.length - 1].id : null;

      return NextResponse.json({
        success: true,
        items: pageItems,
        nextCursor,
        hasMore,
      });
    }

    // 1B. Offset fallback if page is explicitly provided and > 1
    if (pageParam && Number(pageParam) > 1) {
      const page = Number(pageParam);
      const skip = (page - 1) * limit;

      const [items, totalItems] = await Promise.all([
        prisma.image.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit + 1,
          skip,
        }),
        prisma.image.count({ where }),
      ]);

      const hasMore = items.length > limit;
      const pageItems = hasMore ? items.slice(0, limit) : items;
      const nextCursor = hasMore && pageItems.length > 0 ? pageItems[pageItems.length - 1].id : null;

      return NextResponse.json({
        success: true,
        items: pageItems,
        nextCursor,
        hasMore,
        page,
        totalItems,
      });
    }

    // 1C. Initial Page Request (Fast cursor initiation)
    const items = await prisma.image.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore && pageItems.length > 0 ? pageItems[pageItems.length - 1].id : null;

    return NextResponse.json({
      success: true,
      items: pageItems,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("[CollectionsAPI] Error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

// 2. POST: Save new Cloudinary item into Database (Strictly Guarded for Atelier Managers/Admins)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized: Session required" }, { status: 401 });
    }

    const userRole = (session.user.role || "").toUpperCase();
    if (!["ADMIN", "SUPERADMIN", "MANAGER"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden: Manager privileges required" }, { status: 403 });
    }

    const { url, title, category, size, type, group, placement } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid image URL is required" }, { status: 400 });
    }

    const newItem = await prisma.image.create({
      data: {
        url,
        title: title?.trim() || "Bespoke Design",
        category: category || "Agbada",
        group: group || "Native",
        placement: placement || "both",
        size: size ? Number(size) : null,
        type: type || "image",
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("[CollectionsAPI] Create error:", error);
    return NextResponse.json({ error: "Failed to save collection to database" }, { status: 500 });
  }
}


