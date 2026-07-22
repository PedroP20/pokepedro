// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AuthWrapper from "@/components/AuthWrapper";
import Navbar from "@/components/Navbar"; // ⭐ IMPORTAMOS A NAVBAR AQUI!

export const metadata: Metadata = {
  title: "PokéPedro - Mestre da Pokédex",
  description: "Treine sua memória com silhuetas, modo digitação e repetição inteligente SRS!",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#F5F5F5] text-[#1E1E1E] min-h-screen flex flex-col">
        <QueryProvider>
          {/* O AuthWrapper monitora o login em todo o app! */}
          <AuthWrapper>
            
            {/* ⭐ A NAVBAR GLOBAL FICA AQUI */}
            <Navbar />
            
            {children}
            
          </AuthWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}