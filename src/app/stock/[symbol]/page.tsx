import { Header } from "@/components/layout/header";
import { StockDetailClient } from "@/components/stock/stock-detail-client";

interface StockPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function StockPage({ params }: StockPageProps) {
  const { symbol } = await params;

  return (
    <>
      <Header />
      <StockDetailClient symbol={symbol} />
    </>
  );
}
