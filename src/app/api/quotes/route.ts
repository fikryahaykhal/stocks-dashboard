import { NextRequest, NextResponse } from "next/server";
import { fetchQuote } from "@/lib/finnhub";

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ error: "symbols is required" }, { status: 400 });
  }

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  if (symbols.length > 20) {
    return NextResponse.json({ error: "Maximum 20 symbols per request" }, { status: 400 });
  }

  try {
    const results = await Promise.allSettled(symbols.map((symbol) => fetchQuote(symbol)));
    const quotes = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchQuote>>> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((q) => q.current > 0);

    return NextResponse.json({ quotes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch quotes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
