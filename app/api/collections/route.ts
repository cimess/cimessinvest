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
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (group && group !== "All") {
      where.group = group;
    }
    if (placement) {
      where.OR = [{ placement }, { placement: "both" }, { placement: null }];
    }

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

    const hasMore = skip + items.length < totalItems;

    return NextResponse.json({
      items,
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
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }


  try {
    const { url, title, category, size, type, group, placement } = await req.json();

    const newItem = await prisma.image.create({
      data: {
        url,
        title,
        category,
        group: group || "Native",
        placement: placement || "both",
        size: size ? Number(size) : null,
        type: type || "image",
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save collection to database" }, { status: 500 });
  }
}


