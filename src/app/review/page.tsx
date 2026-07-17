// src/app/review/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useLearningStore } from "@/store/useLearningStore";
import { REGION_RANGES, Region } from "@/types/pokemon";
import Image from "next/image";
import Link from "next/link";

const REGION_FILTERS: { id: Region | "ALL"; name: string }[] = [
  { id: "ALL", name: "🌟 Todos" },
  { id: "KANTO", name: "1ª Gen (Kanto)" },
  { id: "JOHTO", name: "2ª Gen (Johto)" },
  { id: "HOENN", name: "3ª Gen (Hoenn)" },
  { id: "SINNOH", name: "4ª Gen (Sinnoh)" },
  { id: "UNOVA", name: "5ª Gen (Unova)" },
  { id: "KALOS", name: "6ª Gen (Kalos)" },
  { id: "ALOLA", name: "7ª Gen (Alola)" },
  { id: "GALAR", name: "8ª Gen (Galar)" },
  { id: "PALDEA", name: "9ª Gen (Paldea)" },
];

export default function ReviewPage() {
  const { getMissedPokemon, getStruggledPokemon } = useLearningStore();
  const [activeTab, setActiveTab] = useState<'MISSED' | 'STRUGGLED'>('MISSED');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<Region | "ALL">("ALL");

  const baseList = activeTab === 'MISSED' ? getMissedPokemon() : getStruggledPokemon();

  // Filtra por ID de Região e por Busca de ID
  const filteredList = useMemo(() => {
    return baseList.filter((item) => {
      // Filtro de Busca (por ID)
      const matchesSearch = String(item.id).includes(searchQuery.trim());
      
      // Filtro por Região
      let matchesRegion = true;
      if (selectedRegion !== "ALL") {
        const [min, max] = REGION_RANGES[selectedRegion];
        matchesRegion = item.id >= min && item.id <= max;
      }

      return matchesSearch && matchesRegion;
    });
  }, [baseList, searchQuery, selectedRegion]);

  return (
    <main className="flex-1 flex flex-col items-center p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6 font-navbar animate-fade-in">
      {/* CABEÇALHO */}
      <div className="text-center space-y-1 w-full border-b border-[#D9D9D9] pb-4">
        <span className="px-3 py-1 rounded-full bg-[#1B4F9C]/10 text-[#1B4F9C] font-button font-black text-xs uppercase tracking-widest">
          🧠 Memória Ativa
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1E1E1E] font-heading flex items-center justify-center gap-2">
          <span>📚</span> Central de Revisão
        </h1>
        <p className="text-xs sm:text-sm text-[#1E1E1E]/70 font-body">
          Acompanhe seus erros e refine seu conhecimento. Use os filtros abaixo para organizar seus estudos!
        </p>
      </div>

      {/* ABAS E BARRA DE BUSCA */}
      <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-[#D9D9D9] shadow-sm">
        <div className="flex bg-[#F5F5F5] p-1 rounded-2xl border border-[#D9D9D9] w-full md:w-auto">
          <button
            onClick={() => setActiveTab('MISSED')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              activeTab === 'MISSED' ? 'bg-[#EE1515] text-white shadow' : 'text-[#1E1E1E]/60 hover:text-[#1E1E1E]'
            }`}
          >
            ❌ Erros Frequentes ({getMissedPokemon().length})
          </button>
          <button
            onClick={() => setActiveTab('STRUGGLED')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              activeTab === 'STRUGGLED' ? 'bg-[#FFCB05] text-[#1B4F9C] shadow' : 'text-[#1E1E1E]/60 hover:text-[#1E1E1E]'
            }`}
          >
            ⏱️ Lentos ({getStruggledPokemon().length})
          </button>
        </div>

        {/* Campo de Busca por ID */}
        <input
          type="text"
          placeholder="🔍 Buscar por Nº na Pokédex (ex: 25, 150)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-72 px-4 py-2 rounded-xl border border-[#D9D9D9] bg-[#F5F5F5] text-sm font-body focus:outline-none focus:border-[#1B4F9C] focus:bg-white"
        />
      </div>

      {/* FILTROS POR REGIÃO / GERAÇÃO */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
        {REGION_FILTERS.map((reg) => (
          <button
            key={reg.id}
            onClick={() => setSelectedRegion(reg.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-button font-bold whitespace-nowrap transition border ${
              selectedRegion === reg.id
                ? "bg-[#1B4F9C] border-[#1B4F9C] text-white shadow-sm"
                : "bg-white border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-[#F5F5F5]"
            }`}
          >
            {reg.name}
          </button>
        ))}
      </div>

      {/* GRID DE RESULTADOS LIMPO E COMPACTO */}
      {filteredList.length === 0 ? (
        <div className="w-full text-center p-12 bg-white rounded-3xl border border-[#D9D9D9] shadow-sm space-y-3">
          <span className="text-5xl inline-block animate-bounce">🎉</span>
          <h3 className="text-lg font-black text-[#1E1E1E] font-heading">Nenhum Pokémon Encontrado!</h3>
          <p className="text-xs text-[#1E1E1E]/60 font-body max-w-sm mx-auto">
            Não há registros com este critério de busca ou região. Continue treinando para alimentar o algoritmo!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 w-full">
          {filteredList.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-[#D9D9D9] hover:border-[#1B4F9C] transition group relative"
            >
              <div className="relative w-16 h-16 group-hover:scale-110 transition-transform">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stat.id}.png`}
                  fill
                  sizes="64px"
                  className="object-contain"
                  alt="Pokemon"
                  unoptimized
                />
              </div>
              <span className="text-[10px] font-stats font-bold text-[#1E1E1E]/40 mt-1">
                #{String(stat.id).padStart(4, '0')}
              </span>

              {activeTab === 'MISSED' ? (
                <span className="mt-1 px-2 py-0.5 bg-red-100 text-[#EE1515] font-stats font-black text-[11px] rounded-full">
                  {stat.timesWrong} erro{stat.timesWrong > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 font-stats font-black text-[11px] rounded-full">
                  ~{(stat.avgTimeMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}