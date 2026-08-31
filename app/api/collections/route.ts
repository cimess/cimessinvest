import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 20);
    const skip = (page - 1) * limit;

    // Fetch batch of 20 items + total count in parallel
    const [items, totalItems] = await Promise.all([
      prisma.image.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.image.count(),
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
  try {
    const { url, title, category, size, type } = await req.json();

    const newItem = await prisma.image.create({
      data: {
        url,
        title,
        category,
        size: size ? Number(size) : null,
        type: type || "image",
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save collection to database" }, { status: 500 });
  }
}


