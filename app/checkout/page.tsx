import { redirect } from "next/navigation";

interface Props {
  searchParams?: Promise<{ orderId?: string; id?: string; reference?: string }>;
}

export default async function CheckoutIndexPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const targetId =
    resolvedSearchParams?.orderId ||
    resolvedSearchParams?.id ||
    resolvedSearchParams?.reference;

  if (targetId) {
    redirect(`/checkout/${encodeURIComponent(targetId)}`);
  }

  // Without a specific order ID or reference, redirect directly to the storefront
  redirect("/store");
}

