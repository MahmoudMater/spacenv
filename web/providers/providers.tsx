"use client";

import { Toaster } from "sonner";

import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster theme="dark" position="bottom-right" />
    </QueryProvider>
  );
}
