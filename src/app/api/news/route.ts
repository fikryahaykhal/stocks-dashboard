import { NextResponse } from "next/server";
import { fetchMarketNews } from "@/lib/finnhub";

export async function GET() {
  try {
    const news = await fetchMarketNews();
    return NextResponse.json({ news });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch news";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
