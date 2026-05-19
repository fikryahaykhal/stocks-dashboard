import { NextRequest, NextResponse } from "next/server";
import { fetchCandles } from "@/lib/finnhub";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  const resolution = request.nextUrl.searchParams.get("resolution") ?? "D";
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  if (!symbol || !from || !to) {
    return NextResponse.json(
      { error: "symbol, from, and to are required" },
      { status: 400 },
    );
  }

  try {
    const candles = await fetchCandles(
      symbol.toUpperCase(),
      resolution,
      Number(from),
      Number(to),
    );
    return NextResponse.json({ candles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch candles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
