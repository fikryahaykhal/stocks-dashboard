import type {
  CandlePoint,
  MarketNews,
  SearchResult,
  StockProfile,
  StockQuote,
} from "./types";

const BASE_URL = "https://finnhub.io/api/v1";

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    throw new Error(
      "FINNHUB_API_KEY is not configured. Add it to .env.local — get a free key at https://finnhub.io/register",
    );
  }
  return key;
}

async function finnhubFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("token", getApiKey());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: path.includes("/quote") ? 10 : 60 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Finnhub API error (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

interface FinnhubQuoteResponse {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export async function fetchQuote(symbol: string): Promise<StockQuote> {
  const data = await finnhubFetch<FinnhubQuoteResponse>("/quote", { symbol });
  return {
    symbol,
    current: data.c,
    change: data.d,
    percentChange: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
    timestamp: data.t,
  };
}

interface FinnhubProfileResponse {
  name: string;
  logo: string;
  exchange: string;
  finnhubIndustry: string;
  marketCapitalization: number;
  weburl: string;
  ipo: string;
  country: string;
  currency: string;
}

export async function fetchProfile(symbol: string): Promise<StockProfile> {
  const data = await finnhubFetch<FinnhubProfileResponse>("/stock/profile2", {
    symbol,
  });
  return {
    symbol,
    name: data.name ?? symbol,
    logo: data.logo ?? "",
    exchange: data.exchange ?? "",
    industry: data.finnhubIndustry ?? "",
    marketCap: (data.marketCapitalization ?? 0) * 1_000_000,
    weburl: data.weburl ?? "",
    ipo: data.ipo ?? "",
    country: data.country ?? "",
    currency: data.currency ?? "USD",
  };
}

interface FinnhubCandleResponse {
  s: string;
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}

export async function fetchCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
): Promise<CandlePoint[]> {
  const data = await finnhubFetch<FinnhubCandleResponse>("/stock/candle", {
    symbol,
    resolution,
    from: String(from),
    to: String(to),
  });

  if (data.s !== "ok" || !data.t?.length) {
    return [];
  }

  return data.t.map((time, i) => ({
    time,
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
    volume: data.v[i],
  }));
}

interface FinnhubSearchResponse {
  count: number;
  result: Array<{
    symbol: string;
    description: string;
    displaySymbol: string;
    type: string;
  }>;
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  const data = await finnhubFetch<FinnhubSearchResponse>("/search", { q: query });
  return (data.result ?? [])
    .filter((item) => item.type === "Common Stock")
    .slice(0, 10)
    .map((item) => ({
      symbol: item.symbol,
      description: item.description,
      displaySymbol: item.displaySymbol,
      type: item.type,
    }));
}

interface FinnhubNewsResponse {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export async function fetchMarketNews(): Promise<MarketNews[]> {
  const data = await finnhubFetch<FinnhubNewsResponse[]>("/news", {
    category: "general",
  });
  return (data ?? []).slice(0, 12).map((item) => ({
    id: item.id,
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    image: item.image,
    datetime: item.datetime,
    related: item.related,
  }));
}

export function getFinnhubApiKeyForClient(): string | null {
  return process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? null;
}
