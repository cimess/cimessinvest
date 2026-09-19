import { Metadata } from "next";
import DisputeClient from "./DisputeClient";

export const metadata: Metadata = {
  title: "Buyer Protection & Order Dispute Portal | Ti Stiches",
  description: "Report unfulfilled orders, delivery issues, or request payment investigation under our 24-Hour Buyer Protection policy.",
};

interface Props {
  searchParams: Promise<{
    orderId?: string;
    ref?: string;
    reference?: string;
    invoice?: string;
  }>;
}

export default async function DisputePage({ searchParams }: Props) {
  const params = await searchParams;
  const initialQuery = params.orderId || params.ref || params.reference || params.invoice || "";

  return <DisputeClient initialQuery={initialQuery} />;
}
