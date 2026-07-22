// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLearningStore } from "@/store/useLearningStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuthStore();
  const { stats } = useLearningStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // ⭐ CORREÇÃO DO LINTER: setTimeout(..., 0) assíncrono para evitar o erro de "cascading render"
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    if (!isLoading && !user) {
      router.push("/login");
    }

    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  if (!mounted || isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
        <div className="w-12 h-12 border-4 border-[#1B4F9C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-button font-black text-[#1B4F9C] animate-pulse uppercase tracking-widest">
          Carregando Ficha de Treinador...
        </p>
      </div>
    );
  }

  if (!user) return null;

  // Filtra as maestrias do banco local/nuvem
  const allStats = Object.values(stats);
  const mastered = allStats.filter((p) => p.comboStars === 3);
  const intermediate = allStats.filter((p) => p.comboStars > 0 && p.comboStars < 3);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full my-auto font-body space-y-6 animate-fade-in">
      
      {/* 🌟 CARD DE IDENTIFICAÇÃO DO TREINADOR (COM FOTO DO GOOGLE) */}
      <div className="w-full bg-gradient-to-br from-[#1B4F9C] via-[#2A75BB] to-[#1B4F9C] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl text-center relative border-4 border-[#FFCB05] overflow-hidden font-card">
        
        {/* Enfeite Visual */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#FFCB05] rounded-full opacity-10" />

        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#FFCB05] overflow-hidden shadow-xl bg-white">
            <Image
              src={user.photoURL || "/icon.png"}
              alt="Foto do Treinador"
              fill
              sizes="112px"
              className="object-cover"
              unoptimized
            />
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white drop-shadow">
              {user.displayName || user.email?.split("@")[0]}
            </h1>
            <p className="text-xs sm:text-sm text-[#FFCB05] font-stats font-black uppercase tracking-widest mt-1">
              Treinador Oficial Licenciado
            </p>
            <span className="inline-block text-[11px] text-white/80 bg-black/20 px-3 py-1 rounded-full mt-2 font-mono">
              📧 {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* 📊 ESTATÍSTICAS DE MAESTRIA */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 font-stats">
        
        {/* Dominados */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#D9D9D9] text-center shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#FFCB05] text-[#1B4F9C] font-black text-[9px] px-2 py-0.5 rounded-bl uppercase tracking-wider">
            Maestria Máxima ⭐⭐⭐
          </div>
          <span className="text-4xl sm:text-5xl block mb-2 mt-1">🏆</span>
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Pokémon Dominados</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1B4F9C] mt-1">{mastered.length}</h2>
          <p className="text-[11px] text-gray-400 mt-1 font-body">Reconhecidos por imagem, texto e silhueta!</p>
        </div>

        {/* Em Treinamento */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#D9D9D9] text-center shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 font-black text-[9px] px-2 py-0.5 rounded-bl uppercase tracking-wider">
            Progresso ⭐ / ⭐⭐
          </div>
          <span className="text-4xl sm:text-5xl block mb-2 mt-1">🔥</span>
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Em Treinamento</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#EE1515] mt-1">{intermediate.length}</h2>
          <p className="text-[11px] text-gray-400 mt-1 font-body">Espécies em processo de repetição inteligente.</p>
        </div>

      </div>

      {/* ✨ GALERIA DE POKÉMON DOMINADOS */}
      {mastered.length > 0 && (
        <div className="w-full bg-white p-6 rounded-3xl border-2 border-[#D9D9D9] shadow-md font-card">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#1B4F9C] mb-4 uppercase tracking-wide flex items-center gap-2">
            <span>✨</span> <span>Sua Galeria de Troféus (3 Estrelas):</span>
          </h3>
          
          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 custom-scrollbar snap-x">
            {mastered.map((p) => (
              <div
                key={p.id}
                title={`Pokémon #${p.id}`}
                className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl border-2 border-[#FFCB05] flex items-center justify-center shadow-sm snap-start group hover:scale-105 transition-transform"
              >
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                  alt="Mastered Pokémon"
                  fill
                  sizes="80px"
                  className="object-contain p-1 drop-shadow"
                  unoptimized
                />
                <span className="absolute -bottom-2 bg-[#1B4F9C] text-[#FFCB05] font-stats font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                  #{p.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔘 COMANDOS DO PERFIL */}
      <div className="flex flex-col sm:flex-row w-full gap-3 pt-2 font-button">
        <Link
          href="/"
          className="flex-1 text-center py-4 bg-[#1B4F9C] hover:bg-[#153e7a] text-white font-black text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>🕹️</span> <span>Voltar ao Menu Principal</span>
        </Link>
        
        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="px-8 py-4 bg-red-50 hover:bg-red-100 text-[#EE1515] border-2 border-red-200 font-black text-base rounded-2xl transition flex items-center justify-center gap-2"
        >
          <span>🚪</span> <span>Desconectar da Conta</span>
        </button>
      </div>

    </main>
  );
}