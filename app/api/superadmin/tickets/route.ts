import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, platformRole: true },
    });

    const isSuperAdmin =
      user?.platformRole === "SUPERADMIN" ||
      user?.role === "SUPERADMIN" ||
      (session.user as any)?.role === "SUPERADMIN";

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // CUSTOMER_DISPUTE | MERCHANT_SUPPORT
    const status = searchParams.get("status"); // PENDING | INVESTIGATING | RESOLVED | REJECTED
    const search = searchParams.get("search");

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { orderReference: { contains: search, mode: "insensitive" } },
        { submitterEmail: { contains: search, mode: "insensitive" } },
        { submitterName: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tickets, stats, totalDisputedCompanies] = await Promise.all([
      prisma.platformTicket.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              paystackSubaccountCode: true,
            },
          },
          order: {
            select: {
              id: true,
              reference: true,
              invoiceNumber: true,
              amountKobo: true,
              merchantNetKobo: true,
              settlementStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.platformTicket.groupBy({
        by: ["type", "status"],
        _count: true,
      }),
      prisma.company.aggregate({
        _sum: {
          disputedBalanceKobo: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        type: t.type,
        category: t.category,
        status: t.status,
        submitterEmail: t.submitterEmail,
        submitterName: t.submitterName,
        submitterPhone: t.submitterPhone,
        role: t.role,
        subject: t.subject,
        description: t.description,
        orderReference: t.orderReference,
        adminNotes: t.adminNotes,
        createdAt: t.createdAt,
        company: t.company,
        order: t.order
          ? {
              ...t.order,
              amountNaira: Math.round(t.order.amountKobo / 100),
              merchantNetNaira: Math.round((t.order.merchantNetKobo || t.order.amountKobo) / 100),
            }
          : null,
      })),
      stats: {
        totalDisputedKobo: totalDisputedCompanies._sum.disputedBalanceKobo || 0,
        totalDisputedNaira: Math.round((totalDisputedCompanies._sum.disputedBalanceKobo || 0) / 100),
        breakdown: stats,
      },
    });
  } catch (error) {
    console.error("[SuperadminTicketsAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching tickets." },
      { status: 500 }
    );
  }
}
