"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-h-dvh flex-1 flex-col md:min-w-0">
        <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
