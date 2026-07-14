"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Mantém a instância do QueryClient estável durante o ciclo de vida do React
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60 * 24, // 24 horas! (Dados de Pokémon não mudam toda hora, economiza API)
            refetchOnWindowFocus: false,    // Não recarrega se o usuário trocar de aba
            retry: 2,                       // Tenta mais 2 vezes se a internet falhar
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools ajudará muito a testarmos se o cache está funcionando! */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}