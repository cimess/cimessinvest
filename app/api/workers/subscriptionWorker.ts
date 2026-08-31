import { prisma } from "@/app/lib/prisma/prisma";

export interface MergedTransaction {
  id: string;
  reference: string;
  amount: number;
  amountFormatted: string;
  planSelected: string;
  status: string;
  createdAt: string;
  source: "DATABASE";
}

export interface SubscriptionStatusOverview {
  userId: string;
  email: string;
  role: string;
  hasActivePlan: boolean;
  currentPlan: string;
  subscription_status: string;
  storageLimitMB: number;
  storageUsedMB: number;
  paymentVerified: boolean;
  transactions: MergedTransaction[];
}

/**
 * Worker to fetch subscription overview and payment history directly from local DB.
 */
export async function getSubscriptionHistoryAndStatus(userId: string): Promise<SubscriptionStatusOverview> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      planSelected: true,
      subscription_status: true,
      paymentVerified: true,
      storageLimit: true,
      storageUsed: true,
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  const transactions: MergedTransaction[] = user.transactions.map((tx) => ({
    id: tx.id,
    reference: tx.reference,
    amount: tx.amount / 100, // Kobo to NGN
    amountFormatted: `₦${(tx.amount / 100).toLocaleString()}`,
    planSelected: tx.planSelected,
    status: tx.status,
    createdAt: tx.createdAt.toISOString(),
    source: "DATABASE",
  }));

  return {
    userId: user.id,
    email: user.email,
    role: user.role || "ADMIN",
    hasActivePlan: user.subscription_status === "ACTIVE" && user.paymentVerified,
    currentPlan: user.planSelected || "STARTER",
    subscription_status: user.subscription_status || "INACTIVE",
    storageLimitMB: user.storageLimit || 500,
    storageUsedMB: user.storageUsed || 0,
    paymentVerified: user.paymentVerified,
    transactions,
  };
}
