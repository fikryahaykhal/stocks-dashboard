"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Newspaper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketNews } from "@/lib/types";

export function NewsFeed() {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setNews(data.news ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load news"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section aria-label="Market news">
      <div className="mb-3 flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Market News
        </h3>
      </div>

      <Card className="divide-y divide-border max-h-[520px] overflow-y-auto">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}

        {error && (
          <p className="p-4 text-sm text-loss">{error}</p>
        )}

        {!loading &&
          !error &&
          news.map((item) => (
            <article key={item.id} className="p-4 hover:bg-muted/20 transition">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3"
              >
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded object-cover bg-muted"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium leading-snug group-hover:text-primary line-clamp-2">
                    {item.headline}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>
                      {formatDistanceToNow(item.datetime * 1000, { addSuffix: true })}
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </p>
                </div>
              </a>
            </article>
          ))}
      </Card>
    </section>
  );
}
