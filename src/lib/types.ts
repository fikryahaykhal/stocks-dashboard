export interface StockQuote {
  symbol: string;
  current: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface StockProfile {
  symbol: string;
  name: string;
  logo: string;
  exchange: string;
  industry: string;
  marketCap: number;
  weburl: string;
  ipo: string;
  country: string;
  currency: string;
}

export interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

export interface MarketNews {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  related: string;
}

export interface FinnhubTrade {
  s: string;
  p: number;
  t: number;
  v: number;
}

export type ChartResolution = "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M";
