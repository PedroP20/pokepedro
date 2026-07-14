"use client";

import { useState } from "react";
import { PokedexFilters, Region } from "@/types/pokemon";
import { motion, AnimatePresence } from "framer-motion";

interface PokedexFilterBarProps {
  filters: PokedexFilters;
  onChange: (newFilters: PokedexFilters) => void;
  onReset: () => void;
  totalResults: number;
}

const REGION_OPTIONS: { id: Region; label: string }[] = [
  { id: "ALL", label: "🌐 Todas Regiões" },
  { id: "KANTO", label: "🔴 Kanto" },
  { id: "JOHTO", label: "🟡 Johto" },
  { id: "HOENN", label: "🟢 Hoenn" },
  { id: "SINNOH", label: "🟣 Sinnoh" },
  { id: "UNOVA", label: "⚪ Unova" },
  { id: "KALOS", label: "🔵 Kalos" },
  { id: "ALOLA", label: "🟠 Alola" },
  { id: "GALAR", label: "🟤 Galar" },
  { id: "PALDEA", label: "🟣 Paldea" },
];

const ALL_TYPES = [
  "Normal", "Fogo", "Água", "Planta", "Elétrico", "Gelo",
  "Lutador", "Venenoso", "Terrestre", "Voador", "Psíquico", "Inseto",
  "Pedra", "Fantasma", "Dragão", "Aço", "Fada"
];

export default function PokedexFilterBar({
  filters,
  onChange,
  onReset,
  totalResults,
}: PokedexFilterBarProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleTypeClick = (type: string) => {
    let newTypes = [...filters.selectedTypes];
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter((t) => t !== type);
    } else {
      if (newTypes.length >= 2) newTypes[1] = type;
      else newTypes.push(type);
    }
    onChange({ ...filters, selectedTypes: newTypes });
  };

  const activeFiltersCount =
    (filters.selectedTypes.length > 0 ? 1 : 0) +
    (filters.sortBy !== "ID" ? 1 : 0) +
    (filters.evolutionStatus !== "ALL" ? 1 : 0);

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#D9D9D9] rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-md space-y-3 sm:space-y-4 font-navbar">
      {/* Linha Principal de Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 Pesquisar por Nome ou Nº (ex: Charizard, 6)..."
            value={filters.searchTerm}
            onChange={(e) => onChange({ ...filters, searchTerm: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D9D9D9] rounded-xl text-xs sm:text-sm font-bold text-[#1E1E1E] placeholder-[#1E1E1E]/40 focus:outline-none focus:border-[#2A75BB] transition shadow-inner font-body"
          />
          {filters.searchTerm && (
            <button
              onClick={() => onChange({ ...filters, searchTerm: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#1E1E1E]/40 hover:text-[#EE1515]"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.region}
            onChange={(e) => onChange({ ...filters, region: e.target.value as Region })}
            className="px-3 py-2.5 bg-[#F5F5F5] border border-[#D9D9D9] rounded-xl text-xs sm:text-sm font-black text-[#1B4F9C] focus:outline-none focus:border-[#2A75BB] transition cursor-pointer font-button"
          >
            {REGION_OPTIONS.map((reg) => (
              <option key={reg.id} value={reg.id} className="font-bold text-[#1E1E1E]">
                {reg.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-button font-bold transition flex items-center gap-1.5 shrink-0 border ${
              isAdvancedOpen || activeFiltersCount > 0
                ? "bg-[#2A75BB] border-[#1B4F9C] text-[#FFFFFF] shadow-sm"
                : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E] hover:bg-[#FFFFFF]"
            }`}
          >
            <span>⚙️ Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#FFCB05] text-[#1B4F9C] font-stats font-bold text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeFiltersCount > 0 && !isAdvancedOpen && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#D9D9D9]/60 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#1E1E1E]/60 text-[11px]">Filtros Ativos:</span>
            {filters.selectedTypes.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-[#2A75BB]/10 text-[#2A75BB] font-extrabold rounded-md border border-[#2A75BB]/30">
                Tipo: {t}
              </span>
            ))}
            {filters.sortBy !== "ID" && (
              <span className="px-2 py-0.5 bg-[#FFCB05]/20 text-[#1B4F9C] font-extrabold rounded-md border border-[#1B4F9C]/30">
                Ordem: {filters.sortBy}
              </span>
            )}
          </div>
          <button onClick={onReset} className="text-[#EE1515] font-black hover:underline text-[11px] shrink-0">
            Limpar Todos 🔄
          </button>
        </div>
      )}

      <AnimatePresence>
        {isAdvancedOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-[#D9D9D9] pt-4 space-y-4 overflow-hidden"
          >
            {/* 1. Filtro de Tipos */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-black text-[#1B4F9C] uppercase tracking-wider">
                  1. Filtrar por Tipo (Selecione até 2 simultâneos):
                </label>
                {filters.selectedTypes.length > 0 && (
                  <span className="font-bold text-[#EE1515]">
                    {filters.selectedTypes.join(" + ")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
                {ALL_TYPES.map((type) => {
                  const isSelected = filters.selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleTypeClick(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition border ${
                        isSelected
                          ? "bg-[#EE1515] text-[#FFFFFF] border-[#cc1010] shadow-sm scale-105"
                          : "bg-[#F5F5F5] text-[#1E1E1E]/80 border-[#D9D9D9] hover:bg-[#FFFFFF] hover:border-[#2A75BB]"
                      }`}
                    >
                      {type} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Ordenação e 3. Evolução */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#1B4F9C] uppercase tracking-wider block">
                  2. Ordenar por Altura / Peso:
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onChange({ ...filters, sortBy: e.target.value as PokedexFilters["sortBy"] })}
                  className="w-full px-3 py-2 bg-[#F5F5F5] border border-[#D9D9D9] rounded-xl text-xs sm:text-sm font-bold text-[#1E1E1E] focus:outline-none focus:border-[#2A75BB] font-button"
                >
                  <option value="ID">🔢 Ordem Padrão da Pokédex</option>
                  <option value="HEIGHT_ASC">📏 Altura: Do Menor para o Maior</option>
                  <option value="HEIGHT_DESC">📏 Altura: Do Maior para o Menor</option>
                  <option value="WEIGHT_ASC">⚖️ Peso: Do Mais Leve para o Mais Pesado</option>
                  <option value="WEIGHT_DESC">⚖️ Peso: Do Mais Pesado para o Mais Leve</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#1B4F9C] uppercase tracking-wider block">
                  3. Status de Evolução:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "ALL", label: "🌐 Todos" },
                    { id: "HAS_EVOLUTION", label: "🧬 Evolui" },
                    { id: "NO_EVOLUTION", label: "🚫 Não Evolui" },
                  ].map((evo) => (
                    <button
                      key={evo.id}
                      onClick={() => onChange({ ...filters, evolutionStatus: evo.id as PokedexFilters["evolutionStatus"] })}
                      className={`py-2 px-2 rounded-xl border text-xs font-extrabold transition font-button ${
                        filters.evolutionStatus === evo.id
                          ? "bg-[#2A75BB] border-[#1B4F9C] text-[#FFFFFF]"
                          : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-[#FFFFFF]"
                      }`}
                    >
                      {evo.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D9D9D9]/60">
              <span className="text-xs font-bold text-[#1E1E1E]/60 font-body">
                Mostrando <strong className="text-[#1B4F9C] font-stats">{totalResults}</strong> Pokémon compatíveis
              </span>
              <button
                onClick={onReset}
                className="px-4 py-1.5 bg-[#EE1515]/10 hover:bg-[#EE1515] text-[#EE1515] hover:text-[#FFFFFF] font-black rounded-lg transition text-xs border border-[#EE1515]/30 font-button"
              >
                Limpar Filtros 🔄
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}