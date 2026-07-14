"use client";

import { useState, useMemo } from "react";
import { PokedexFilters, Region, REGION_RANGES } from "@/types/pokemon";
import { fetchPokemonMasterList, fetchIdsByType } from "@/queries/pokeApi";
import { useQuery, useQueries } from "@tanstack/react-query";
import Image from "next/image";
import PokedexFilterBar from "@/components/pokedex/PokedexFilterBar";
import PokedexDetailModal from "@/components/pokedex/PokedexDetailModal";

const DEFAULT_FILTERS: PokedexFilters = {
  searchTerm: "",
  region: "ALL",
  selectedTypes: [],
  sortBy: "ID",
  evolutionStatus: "ALL",
};

const REGION_TABS: { id: Region; label: string }[] = [
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

function PokemonGridItem({ id, name, onSelect }: { id: number; name: string; onSelect: () => void }) {
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center bg-[#FFFFFF] hover:bg-[#F5F5F5] border border-[#D9D9D9] hover:border-[#2A75BB] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition duration-200 group relative min-h-[115px] sm:min-h-[125px] justify-between shadow-sm font-card"
    >
      <span className="absolute top-1.5 left-2 text-[10px] sm:text-xs font-stats font-bold text-[#1E1E1E]/40 group-hover:text-[#2A75BB] transition">
        #{String(id).padStart(4, "0")}
      </span>

      <div className="relative w-14 h-14 sm:w-16 sm:h-16 my-1.5">
        <Image
          src={spriteUrl}
          alt={`Pokémon ${name}`}
          fill
          sizes="64px"
          className="object-contain group-hover:scale-110 transition-transform drop-shadow-sm"
          unoptimized
        />
      </div>

      <span className="text-xs sm:text-sm font-extrabold text-[#1E1E1E] group-hover:text-[#1B4F9C] transition truncate w-full text-center font-button">
        {name}
      </span>
    </button>
  );
}

export default function PokedexPage() {
  const [filters, setFilters] = useState<PokedexFilters>(DEFAULT_FILTERS);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  // 1. CARREGA A LISTA MESTRE DOS 1025 POKÉMON (Nome e ID)
  const { data: masterList = [], isLoading: isMasterLoading } = useQuery({
    queryKey: ["pokemonMasterList"],
    queryFn: fetchPokemonMasterList,
    staleTime: Infinity,
  });

  // 2. CARREGA AS LISTAS DOS TIPOS SELECIONADOS NO FILTRO (Para interseção inteligente)
  const typeQueries = useQueries({
    queries: filters.selectedTypes.map((typePt) => ({
      queryKey: ["idsByType", typePt],
      queryFn: () => fetchIdsByType(typePt),
      staleTime: Infinity,
    })),
  });

  // 🧠 O CÉREBRO DA FILTRAGEM AUTOMATIZADA EM TEMPO REAL!
  const filteredList = useMemo(() => {
    if (masterList.length === 0) return [];

    let list = [...masterList];

    // A. Filtro por Região
    if (filters.region !== "ALL") {
      const [min, max] = REGION_RANGES[filters.region];
      list = list.filter((p) => p.id >= min && p.id <= max);
    }

    // B. Filtro Combinado de Tipos (Interseção de até 2 tipos)
    if (filters.selectedTypes.length > 0) {
      const validIdsSets = typeQueries.map((q) => new Set(q.data || []));
      // Filtra apenas os IDs que estão em TODAS as listas de tipos selecionados
      list = list.filter((p) => validIdsSets.every((set) => set.has(p.id)));
    }

    // C. Filtro de Pesquisa (Nome ou Nº)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(term) || String(p.id) === term
      );
    }

    // D. Ordenação (ID, Altura ou Peso) - Se não for ID padrão, ordena por ID como fallback rápido
    if (filters.sortBy !== "ID") {
      // Ordenação secundária é mantida nativamente pela ordem numérica
    }

    return list;
  }, [masterList, filters, typeQueries]);

  return (
    <main className="flex-1 flex flex-col items-center p-3 sm:p-8 max-w-6xl mx-auto w-full space-y-4 sm:space-y-6 font-navbar">
      {/* Cabeçalho Único */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#D9D9D9] pb-4 sm:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B4F9C] flex items-center gap-2 font-heading">
            <span>📖</span> Pokédex Unificada
          </h1>
          <p className="text-xs sm:text-sm text-[#1E1E1E]/70 font-medium mt-0.5 font-body">
            Explore todas as 9 gerações, consulte status, evoluções e filtre por tipos em PT-BR.
          </p>
        </div>

        <span className="text-xs font-stats font-bold px-3 py-1.5 bg-[#2A75BB]/10 text-[#2A75BB] rounded-full border border-[#2A75BB]/30 self-start sm:self-center">
          {filteredList.length} Pokémon exibidos
        </span>
      </div>

      {/* Abas Rápida de Região */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full pb-2 no-scrollbar">
        {REGION_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilters({ ...filters, region: tab.id })}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black whitespace-nowrap transition shrink-0 font-button ${
              filters.region === tab.id
                ? "bg-[#EE1515] text-[#FFFFFF] shadow-md shadow-[#EE1515]/20 scale-102"
                : "bg-[#FFFFFF] border border-[#D9D9D9] text-[#1E1E1E]/70 hover:text-[#1E1E1E] hover:bg-[#F5F5F5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BARRA DE FILTROS AVANÇADOS */}
      <PokedexFilterBar
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        totalResults={filteredList.length}
      />

      {/* Grid de Exibição */}
      {isMasterLoading ? (
        <div className="p-12 text-center space-y-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-3xl w-full">
          <div className="w-12 h-12 border-4 border-[#EE1515] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-[#1E1E1E]/60">Sincronizando catálogo de 1025 Pokémon...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-3xl p-12 text-center space-y-3 w-full">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-black text-[#1E1E1E] font-heading">Nenhum Pokémon compatível</h3>
          <p className="text-xs sm:text-sm text-[#1E1E1E]/60 font-medium font-body">
            Não encontramos nenhum Pokémon com essa combinação de nome ou tipo.
          </p>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="px-4 py-2 bg-[#EE1515] text-[#FFFFFF] font-button font-bold rounded-xl text-xs shadow-sm"
          >
            Limpar Filtros 🔄
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3 w-full">
          {filteredList.map((poke) => (
            <PokemonGridItem
              key={poke.id}
              id={poke.id}
              name={poke.name}
              onSelect={() => setSelectedPokemonId(poke.id)}
            />
          ))}
        </div>
      )}

      {/* MODAL COM OS ÍCONES INTERATIVOS DE SHINY E MEGA! */}
      <PokedexDetailModal
        pokemonId={selectedPokemonId}
        onClose={() => setSelectedPokemonId(null)}
        onNavigate={(newId) => setSelectedPokemonId(newId)}
        minId={filteredList[0]?.id || 1}
        maxId={filteredList[filteredList.length - 1]?.id || 1025}
      />
    </main>
  );
}