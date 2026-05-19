export const DEFAULT_WATCHLIST = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "JPM",
] as const;

export const MARKET_INDICES = [
  { symbol: "^GSPC", label: "S&P 500", finnhubSymbol: "SPY" },
  { symbol: "^DJI", label: "Dow Jones", finnhubSymbol: "DIA" },
  { symbol: "^IXIC", label: "NASDAQ", finnhubSymbol: "QQQ" },
  { symbol: "^RUT", label: "Russell 2000", finnhubSymbol: "IWM" },
] as const;

export const POLL_INTERVAL_MS = 15_000;

export const FINNHUB_WS_URL = "wss://ws.finnhub.io";

export const CHART_RESOLUTIONS = [
  { value: "1", label: "1m" },
  { value: "5", label: "5m" },
  { value: "15", label: "15m" },
  { value: "60", label: "1h" },
  { value: "D", label: "1D" },
  { value: "W", label: "1W" },
] as const;
