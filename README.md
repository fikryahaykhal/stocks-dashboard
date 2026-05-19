# MarketPulse — Stocks Monitoring Dashboard

A production-ready **Next.js 15** stocks dashboard with real-time quotes, interactive candlestick charts, watchlist, market news, and WebSocket live ticks.

Powered by the free [Finnhub](https://finnhub.io) API (60 calls/min, real-time US stock WebSocket on the free tier).

## Features

- **Market overview** — S&P 500, Dow, NASDAQ, Russell 2000 (via ETF proxies: SPY, DIA, QQQ, IWM)
- **Watchlist** — persisted in localStorage, add/remove from any stock page
- **Real-time updates** — Finnhub WebSocket when `NEXT_PUBLIC_FINNHUB_API_KEY` is set; otherwise 15s polling
- **Stock detail** — live price, company profile, OHLC stats, candlestick chart (multiple timeframes)
- **Search** — debounced symbol search with autocomplete
- **Market news** — latest general market headlines
- **Responsive dark UI** — built with Tailwind CSS v4

## Quick start

### 1. Get a free API key

Register at [https://finnhub.io/register](https://finnhub.io/register) (free, no credit card).

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
FINNHUB_API_KEY=your_key_here
NEXT_PUBLIC_FINNHUB_API_KEY=your_key_here
```

- `FINNHUB_API_KEY` — used by server API routes (kept private)
- `NEXT_PUBLIC_FINNHUB_API_KEY` — required for **live WebSocket** ticks in the browser (same key; Finnhub allows this for client WebSocket)

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server (Turbopack) |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |

## Project structure

```
src/
├── app/              # App Router pages & API routes
├── components/     # UI, dashboard, stock, layout
├── hooks/            # Quotes polling, WebSocket, debounce
├── lib/              # Finnhub client, types, utils
└── store/            # Zustand watchlist (persisted)
```

## API routes

| Route | Description |
| ----- | ----------- |
| `GET /api/quote?symbol=AAPL` | Single quote |
| `GET /api/quotes?symbols=AAPL,MSFT` | Batch quotes (max 20) |
| `GET /api/search?q=apple` | Symbol search |
| `GET /api/candles?symbol=...&resolution=D&from=...&to=...` | OHLC candles |
| `GET /api/profile?symbol=AAPL` | Company profile |
| `GET /api/news` | Market news |

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [lightweight-charts](https://tradingview.github.io/lightweight-charts/)
- [Zustand](https://zustand.docs.pmnd.rs/) + persist
- [Finnhub](https://finnhub.io/docs/api)

## License

MIT
