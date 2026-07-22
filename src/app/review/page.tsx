// src/app/review/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useLearningStore } from "@/store/useLearningStore";
import { Region, REGION_RANGES } from "@/types/pokemon";
import Image from "next/image";
import Link from "next/link";

type ReviewTab = 'MISSED' | 'STRUGGLED' | 'DIFFICULT';

const REGIONS_LIST = [
  { id: "ALL", name: "Todos" },
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
  const [mounted, setMounted] = useState(false);
  const { getMissedPokemon, getStruggledPokemon, getDifficultPokemon, toggleDifficultyMark } = useLearningStore();

  const [activeTab, setActiveTab] = useState<ReviewTab>('MISSED');
  const [selectedRegion, setSelectedRegion] = useState<Region>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 1. Coleta os dados de forma otimizada
  const missed = useMemo(() => getMissedPokemon(), [getMissedPokemon]);
  const struggled = useMemo(() => getStruggledPokemon(), [getStruggledPokemon]);
  const difficult = useMemo(() => getDifficultPokemon ? getDifficultPokemon() : [], [getDifficultPokemon]);

  if (!mounted) return null;

  // 2. Define qual lista será filtrada com base na Aba ativa
  const currentData = activeTab === 'MISSED' ? missed : activeTab === 'STRUGGLED' ? struggled : difficult;

  // 3. Aplica os filtros (Busca e Região)
  const filteredData = currentData.filter((stat) => {
    // Filtro de Busca
    if (searchQuery && !String(stat.id).includes(searchQuery)) {
      return false;
    }
    // Filtro de Região
    if (selectedRegion !== "ALL") {
      const range = REGION_RANGES[selectedRegion as Region];
      if (range && (stat.id < range[0] || stat.id > range[1])) {
        return false;
      }
    }
    return true;
  });

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 max-w-6xl mx-auto w-full font-body">
      
      {/* BOTÃO DE VOLTAR AO INÍCIO */}
      <div className="w-full flex justify-start mb-4">
        <Link href="/" className="px-4 py-2 bg-white text-[#1B4F9C] font-button font-black text-xs sm:text-sm rounded-xl border-2 border-[#1B4F9C]/10 shadow-sm hover:bg-blue-50 transition flex items-center gap-2 w-fit">
          <span className="text-xl leading-none -mt-0.5">⬅</span> Voltar ao Início
        </Link>
      </div>

      {/* CABEÇALHO */}
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-600 font-button font-black text-[10px] uppercase tracking-widest shadow-sm">
          🧠 MEMÓRIA ATIVA
        </span>
        <h1 className="text-4xl font-heading font-black text-[#1E1E1E] flex items-center justify-center gap-3">
          <span>📚</span> Central de Revisão
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Acompanhe seus erros, lide com suas dificuldades e refine seu conhecimento. Use os filtros abaixo!
        </p>
      </div>

      {/* PAINEL DE CONTROLE (Abas e Busca) */}
      <div className="w-full bg-white border border-gray-200 rounded-3xl p-2 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        
        {/* ABAS */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button 
            onClick={() => setActiveTab('MISSED')} 
            className={`shrink-0 px-4 py-2.5 rounded-2xl font-button font-bold text-sm transition flex items-center gap-2 ${activeTab === 'MISSED' ? 'bg-[#EE1515] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <span>✕</span> Erros Frequentes ({missed.length})
          </button>
          <button 
            onClick={() => setActiveTab('STRUGGLED')} 
            className={`shrink-0 px-4 py-2.5 rounded-2xl font-button font-bold text-sm transition flex items-center gap-2 ${activeTab === 'STRUGGLED' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <span>⏱️</span> Lentos ({struggled.length})
          </button>
          
          {/* ⭐ NOVA ABA DE DIFICULDADE */}
          <button 
            onClick={() => setActiveTab('DIFFICULT')} 
            className={`shrink-0 px-4 py-2.5 rounded-2xl font-button font-bold text-sm transition flex items-center gap-2 ${activeTab === 'DIFFICULT' ? 'bg-[#FFCB05] text-[#1B4F9C] shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <span>⚠️</span> Dificuldade ({difficult.length})
          </button>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="relative w-full sm:w-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por Nº (ex: 25, 150)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/30 transition"
          />
        </div>
      </div>

      {/* FILTRO DE REGIÃO (Estilo Scroll) */}
      <div className="w-full flex items-center gap-2 overflow-x-auto custom-scrollbar pb-4 mb-6 snap-x">
        {REGIONS_LIST.map((reg) => (
          <button 
            key={reg.id} 
            onClick={() => setSelectedRegion(reg.id as Region)}
            className={`shrink-0 snap-start px-4 py-2 rounded-xl text-xs sm:text-sm font-button font-bold transition shadow-sm border ${selectedRegion === reg.id ? 'bg-[#1B4F9C] text-white border-[#1B4F9C]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {selectedRegion === reg.id && <span className="text-[#FFCB05] mr-1.5">🌟</span>}
            {reg.name}
          </button>
        ))}
      </div>

      {/* GRID DE POKÉMON */}
      {filteredData.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-3xl border-dashed">
          <span className="text-5xl mb-3 grayscale opacity-50">🍃</span>
          <p className="text-gray-500 font-button font-bold text-center">Nenhum Pokémon encontrado nesta categoria ou região!</p>
        </div>
      ) : (
        <div className="w-full flex flex-wrap gap-4 justify-center sm:justify-start">
          {filteredData.map((stat) => (
            <div key={stat.id} className="w-[120px] sm:w-[140px] bg-white border border-gray-200 rounded-3xl p-3 flex flex-col items-center shadow-sm hover:shadow-md transition group relative">
              
              {/* Botão de Desmarcar Dificuldade Rápido (Aparece ao passar o mouse) */}
              {activeTab === 'DIFFICULT' && (
                <button 
                  onClick={() => toggleDifficultyMark(stat.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-50 text-red-500 z-10"
                  title="Remover das Dificuldades"
                >
                  ✕
                </button>
              )}

              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2 group-hover:scale-110 transition-transform">
                <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stat.id}.png`} alt={`Pokemon ${stat.id}`} fill sizes="80px" className="object-contain drop-shadow" unoptimized />
              </div>
              
              <span className="text-[10px] sm:text-xs font-black text-gray-400 mb-2">#{String(stat.id).padStart(4, '0')}</span>
              
              {/* ETIQUETA DINÂMICA BASEADA NA ABA */}
              {activeTab === 'MISSED' && (
                <div className="w-full bg-red-50 text-[#EE1515] font-black text-[10px] sm:text-xs py-1.5 rounded-lg text-center border border-red-100">
                  {stat.timesWrong} erro(s)
                </div>
              )}
              {activeTab === 'STRUGGLED' && (
                <div className="w-full bg-gray-100 text-gray-700 font-black text-[10px] sm:text-xs py-1.5 rounded-lg text-center border border-gray-200">
                  {(stat.avgTimeMs / 1000).toFixed(1)}s média
                </div>
              )}
              {activeTab === 'DIFFICULT' && (
                <div className="w-full bg-[#FFCB05]/20 text-[#1B4F9C] font-black text-[10px] sm:text-xs py-1.5 rounded-lg text-center border border-[#FFCB05]/50">
                  ⚠️ Difícil
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </main>
  );
}