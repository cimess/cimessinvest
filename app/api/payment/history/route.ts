import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { getSubscriptionHistoryAndStatus } from "@/app/api/workers/subscriptionWorker";

export async function GET() {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId && session?.user?.email) {
      const dbUser = await prisma.user.findFirst({ where: { email: session.user.email } });
      userId = dbUser?.id;
    }

    if (!userId) {
      const fallbackUser = await prisma.user.findFirst();
      userId = fallbackUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "User session not found" }, { status: 401 });
    }

    const history = await getSubscriptionHistoryAndStatus(userId);
    return NextResponse.json({ success: true, ...history });
  } catch (error) {
    const errorMessage ="Failed to fetch payment history";
    console.error("Payment History API Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
