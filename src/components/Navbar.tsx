"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PokedexIcon from "@/components/icons/PokedexIcon";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname === "/game") return null;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D9D9D9] bg-[#FFFFFF]/90 backdrop-blur-md shadow-sm font-navbar font-semibold">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO POKÉMON SOLID */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={closeMenu}>
          <span className="text-2xl sm:text-3xl font-logo tracking-normal text-[#1B4F9C] drop-shadow-sm group-hover:scale-105 transition-transform pt-1">
            Poké<span className="text-[#EE1515]">Pedro</span>
          </span>
        </Link>

        {/* 💻 NAVEGAÇÃO DESKTOP */}
        <nav className="hidden sm:flex items-center gap-3">
          {/* Item 1: Início */}
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-xl text-sm transition duration-200 flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-[#EE1515] text-[#FFFFFF] shadow-md shadow-[#EE1515]/20 font-bold"
                : "text-[#1E1E1E] hover:text-[#2A75BB] hover:bg-[#F5F5F5]"
            }`}
          >
            <span>🏠</span>
            <span>Início</span>
          </Link>

          {/* Item 2: Ícone da Pokédex com Tooltip */}
          <div className="relative group/tooltip flex items-center">
            <Link
              href="/pokedex"
              className={`p-2.5 rounded-xl transition duration-200 flex items-center justify-center ${
                pathname === "/pokedex"
                  ? "bg-[#EE1515] text-[#FFFFFF] shadow-md shadow-[#EE1515]/20 scale-105"
                  : "text-[#1E1E1E] hover:text-[#2A75BB] hover:bg-[#F5F5F5]"
              }`}
              aria-label="Abrir Pokédex"
            >
              <PokedexIcon className="w-5 h-5 transition-transform group-hover/tooltip:scale-110" />
            </Link>

            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1E1E1E] text-[#FFFFFF] text-[11px] font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Pokédex
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1E1E1E] rotate-45" />
            </div>
          </div>

          {/* Item 3: 🎓 ACADEMIA (Antiga aba Progresso) */}
          <Link
            href="/academy"
            className={`px-3.5 py-2 rounded-xl text-sm transition duration-200 flex items-center gap-1.5 ${
              pathname === "/academy"
                ? "bg-[#EE1515] text-[#FFFFFF] shadow-md shadow-[#EE1515]/20 font-bold"
                : "text-[#1E1E1E] hover:text-[#2A75BB] hover:bg-[#F5F5F5]"
            }`}
          >
            <span>🎓</span>
            <span>Academia</span>
          </Link>

          {/* Botão Jogar Agora */}
          <Link
            href="/game"
            className="ml-2 px-4 py-2 bg-[#FFCB05] hover:bg-[#e6b600] text-[#1B4F9C] font-button font-bold rounded-xl text-sm shadow-md shadow-[#FFCB05]/30 transition transform hover:scale-105 border border-[#1B4F9C]/10 flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>Jogar Agora</span>
          </Link>
        </nav>

        {/* 📱 BOTÃO HAMBÚRGUER MOBILE */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden p-2 text-2xl text-[#1E1E1E] hover:text-[#2A75BB] focus:outline-none"
          aria-label="Abrir menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 📱 MENU MOBILE */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="sm:hidden border-b border-[#D9D9D9] bg-[#FFFFFF] px-4 pt-2 pb-6 space-y-2 overflow-hidden shadow-xl"
          >
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/"
                onClick={closeMenu}
                className={`px-4 py-3 rounded-xl text-base font-bold transition flex items-center gap-3 ${
                  pathname === "/" ? "bg-[#EE1515] text-[#FFFFFF]" : "text-[#1E1E1E] hover:bg-[#F5F5F5]"
                }`}
              >
                <span>🏠</span>
                <span>Início</span>
              </Link>

              <Link
                href="/pokedex"
                onClick={closeMenu}
                className={`px-4 py-3 rounded-xl text-base font-bold transition flex items-center gap-3 ${
                  pathname === "/pokedex" ? "bg-[#EE1515] text-[#FFFFFF]" : "text-[#1E1E1E] hover:bg-[#F5F5F5]"
                }`}
              >
                <PokedexIcon className="w-5 h-5" />
                <span>Pokédex</span>
              </Link>

              {/* Link Mobile para a Academia */}
              <Link
                href="/academy"
                onClick={closeMenu}
                className={`px-4 py-3 rounded-xl text-base font-bold transition flex items-center gap-3 ${
                  pathname === "/academy" ? "bg-[#EE1515] text-[#FFFFFF]" : "text-[#1E1E1E] hover:bg-[#F5F5F5]"
                }`}
              >
                <span>🎓</span>
                <span>Academia</span>
              </Link>

              <Link
                href="/game"
                onClick={closeMenu}
                className="mt-2 w-full py-3.5 bg-[#FFCB05] text-[#1B4F9C] font-button font-bold text-center rounded-xl text-base shadow-md block border border-[#1B4F9C]/10"
              >
                ⚡ Jogar Agora
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}