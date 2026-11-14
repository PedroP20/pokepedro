// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AuthWrapper from "@/components/AuthWrapper";
import Navbar from "@/components/Navbar"; // ⭐ IMPORTAMOS A NAVBAR AQUI!
import AchievementNotifier from "@/components/AchievementNotifier";
import ClubFooter from "@/components/ClubFooter";

export const metadata: Metadata = {
  title: { default: "PokéClub 2.0 · Seu universo Pokémon", template: "%s | PokéClub" },
  description: "Descubra Pokémon, prepare sua estratégia, treine sua memória e acompanhe sua jornada no PokéClub.",
  manifest: "/manifest.webmanifest",
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
      <body className="antialiased min-h-screen flex flex-col">
        <QueryProvider>
          {/* O AuthWrapper monitora o login em todo o app! */}
          <AuthWrapper>
            
            {/* ⭐ A NAVBAR GLOBAL FICA AQUI */}
            <Navbar />
            
            {children}
            <ClubFooter />
            <AchievementNotifier />
            
          </AuthWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
