"use client";

import { EvolutionNode } from "@/types/pokemon";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  evolutions: EvolutionNode[];
  currentId: number;
}

export default function EvolutionModal({
  isOpen,
  onClose,
  evolutions,
  currentId,
}: EvolutionModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-2xl bg-[#FFFFFF] border border-[#D9D9D9] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl text-center space-y-4 sm:space-y-6 max-h-[88vh] overflow-y-auto custom-scrollbar"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-3 sm:pb-4">
            <h3 className="text-lg sm:text-2xl font-black text-[#1B4F9C] flex items-center gap-1.5 sm:gap-2">
              <span>🧬</span> Cadeia Evolutiva
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#D9D9D9] text-[#1E1E1E] font-bold flex items-center justify-center transition text-sm sm:text-base shrink-0"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] sm:text-sm text-[#1E1E1E]/70 font-medium">
            Acompanhe a linha evolutiva completa desta espécie na Pokédex:
          </p>

          {/* Grid Evolutivo */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 py-2 sm:py-4">
            {evolutions.map((evo, index) => {
              const isCurrent = evo.id === currentId;

              return (
                <div key={evo.id} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
                  <div
                    className={`flex flex-col items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl transition border w-40 sm:w-44 ${
                      isCurrent
                        ? "bg-[#2A75BB]/10 border-[#2A75BB] shadow-md shadow-[#2A75BB]/10 scale-102 sm:scale-105"
                        : "bg-[#F5F5F5] border-[#D9D9D9]"
                    }`}
                  >
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 my-0.5 sm:my-1">
                      <Image
                        src={evo.spriteUrl}
                        alt={evo.name}
                        fill
                        sizes="(max-width: 640px) 80px, 112px"
                        className="object-contain drop-shadow-sm"
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-[#1E1E1E]/60 mt-1">
                      #{String(evo.id).padStart(4, "0")}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-black mt-0.5 truncate w-full ${
                        isCurrent ? "text-[#1B4F9C]" : "text-[#1E1E1E]"
                      }`}
                    >
                      {evo.name}
                    </span>
                    {isCurrent && (
                      <span className="mt-1 text-[9px] sm:text-[10px] bg-[#EE1515] text-[#FFFFFF] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Atual
                      </span>
                    )}
                  </div>

                  {index < evolutions.length - 1 && (
                    <div className="text-lg sm:text-3xl font-black text-[#D9D9D9] my-0 sm:my-0">
                      <span className="sm:hidden">⬇️</span>
                      <span className="hidden sm:inline">➔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#1B4F9C] hover:bg-[#2A75BB] text-[#FFFFFF] font-black rounded-xl transition shadow-md text-xs sm:text-sm"
          >
            Voltar para o Desafio
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}