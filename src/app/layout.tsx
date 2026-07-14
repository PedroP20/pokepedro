import type { Metadata } from "next";
import { Montserrat, Fredoka, Nunito, Orbitron } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/queryProvider";
import Navbar from "@/components/Navbar";

// Configuração otimizada das fontes oficiais do projeto
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "PokéPedro - Aprenda a Pokédex jogando!",
  description: "Plataforma Web para Aprendizado e Memorização de Pokémon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${fredoka.variable} ${nunito.variable} ${orbitron.variable}`}
    >
      <body className="min-h-screen bg-[#F5F5F5] text-[#1E1E1E] antialiased flex flex-col font-body selection:bg-[#EE1515] selection:text-[#FFFFFF]">
        <QueryProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}