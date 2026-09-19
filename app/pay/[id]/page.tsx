import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuickPayRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/checkout/${id}`);
}
