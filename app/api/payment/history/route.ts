import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { getSubscriptionHistoryAndStatus } from "@/app/api/workers/subscriptionWorker";
import { getSafeErrorMessage } from "@/app/lib/utils/errorHandler";

export async function GET() {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId && session?.user?.email) {
      const dbUser = await prisma.user.findFirst({ where: { email: session.user.email }, select: { id: true } });
      userId = dbUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access: Active session required" }, { status: 401 });
    }

    const history = await getSubscriptionHistoryAndStatus(userId);
    return NextResponse.json({ success: true, ...history });
  } catch (error) {
    console.error("Payment History API Error:", error);
    const safeError = getSafeErrorMessage(error, "Failed to fetch payment history");
    return NextResponse.json({ success: false, error: safeError.message }, { status: safeError.statusCode });
  }
}
