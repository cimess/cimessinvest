import { NextResponse } from "next/server";
import { flushVisitBuffer } from "@/app/api/workers/trafficWorker";

export async function POST() {
  try {
    await flushVisitBuffer();
    return NextResponse.json({ success: true, message: "Traffic visit buffer flushed successfully." });
  } catch (error) {
    console.error("[TrafficWorkerAPI] Flush error:", error);
    return NextResponse.json({ error: "Failed to flush traffic buffer" }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
