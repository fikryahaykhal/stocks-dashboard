"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
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
      <SectionHeading title="News" description="Latest market headlines" />

      <div className="space-y-2">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}

        {error && (
          <Card className="p-4 text-sm text-loss">{error}</Card>
        )}

        {!loading &&
          !error &&
          news.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 p-4 active:bg-muted/30"
              >
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover bg-muted"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium leading-snug line-clamp-2 group-active:text-primary">
                    {item.headline}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>{item.source}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {formatDistanceToNow(item.datetime * 1000, { addSuffix: true })}
                    </span>
                    <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
                  </p>
                </div>
              </a>
            </Card>
          ))}
      </div>
    </section>
  );
}
