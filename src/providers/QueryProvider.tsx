// src/providers/QueryProvider.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Inicializa o cliente uma única vez para não perder o cache nas recargas
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Evita recarregar a PokéAPI à toa ao mudar de aba
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
