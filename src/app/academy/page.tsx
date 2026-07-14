"use client";

import { useState } from "react";
import { POKEMON_TYPES, ATTACK_EFFECTIVENESS, calculateDefenseMultipliers, TypeInfo } from "@/lib/typeEffectiveness";
import { motion, AnimatePresence } from "framer-motion";

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<"DEFENSE" | "ATTACK">("DEFENSE");
  const [selectedAttackType, setSelectedAttackType] = useState<string>("Fogo");
  const [selectedDefenseTypes, setSelectedDefenseTypes] = useState<string[]>(["Planta", "Venenoso"]);

  const handleDefenseTypeClick = (type: string) => {
    let newTypes = [...selectedDefenseTypes];
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter((t) => t !== type);
    } else {
      if (newTypes.length >= 2) newTypes[1] = type;
      else newTypes.push(type);
    }
    setSelectedDefenseTypes(newTypes);
  };

  const attackRules = ATTACK_EFFECTIVENESS[selectedAttackType] || { superEffective: [], notVeryEffective: [], noEffect: [] };
  const defenseResults = calculateDefenseMultipliers(selectedDefenseTypes);

  return (
    <main className="flex-1 flex flex-col items-center p-3 sm:p-6 max-w-5xl mx-auto w-full space-y-6 font-navbar">
      {/* 🌟 CABEÇALHO COMPACTO E LIMPO */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] p-4 sm:p-6 rounded-3xl border border-[#D9D9D9] shadow-sm">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B4F9C] flex items-center justify-center sm:justify-start gap-2 font-heading">
            <span>🎓</span> Academia de Batalha
          </h1>
          <p className="text-xs sm:text-sm text-[#1E1E1E]/70 font-medium font-body mt-0.5">
            Simulador visual de vantagens e fraquezas oficiais do Pokémon GO.
          </p>
        </div>

        {/* Seletor de Modo Gamer (Estilo Arcade) */}
        <div className="flex bg-[#F5F5F5] p-1.5 rounded-2xl border border-[#D9D9D9] w-full sm:w-auto justify-center font-button">
          <button
            onClick={() => setActiveTab("DEFENSE")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === "DEFENSE"
                ? "bg-[#1B4F9C] text-[#FFFFFF] shadow-md scale-102"
                : "text-[#1E1E1E]/70 hover:text-[#1E1E1E]"
            }`}
          >
            <span>🛡️</span> <span>Modo Defesa</span>
          </button>
          <button
            onClick={() => setActiveTab("ATTACK")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === "ATTACK"
                ? "bg-[#EE1515] text-[#FFFFFF] shadow-md scale-102"
                : "text-[#1E1E1E]/70 hover:text-[#1E1E1E]"
            }`}
          >
            <span>🔥</span> <span>Modo Ataque</span>
          </button>
        </div>
      </div>

      {/* 🔄 CONTEÚDO DINÂMICO DA ACADEMIA */}
      <AnimatePresence mode="wait">
        {activeTab === "DEFENSE" ? (
          /* =========================================================
             🛡️ MODO DEFESA: VISUAL LIMPO DE FRAQUEZAS E RESISTÊNCIAS
             ========================================================= */
          <motion.div
            key="defense-mode"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-6"
          >
            {/* 1. SELETOR DE TIPOS COM SLOTS VISUAIS */}
            <div className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-[#D9D9D9]/60">
                <span className="text-xs sm:text-sm font-button font-black text-[#1B4F9C] uppercase tracking-wider">
                  1. Monte a tipagem do Pokémon (Até 2):
                </span>

                {/* Slots Visualmente Claros */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#F5F5F5] px-3 py-1.5 rounded-xl border border-[#D9D9D9] min-w-[140px] justify-center">
                    {selectedDefenseTypes.length === 0 ? (
                      <span className="text-xs text-[#1E1E1E]/40 font-bold">Nenhum Tipo</span>
                    ) : (
                      selectedDefenseTypes.map((type: string) => {
                        const t = POKEMON_TYPES[type];
                        return (
                          <span key={type} className={`px-2 py-0.5 rounded-lg text-xs font-button font-black flex items-center gap-1 shadow-sm ${t.colorBg} ${t.colorText}`}>
                            <span>{t.icon}</span> <span>{t.name}</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                  {selectedDefenseTypes.length > 0 && (
                    <button
                      onClick={() => setSelectedDefenseTypes([])}
                      className="px-2.5 py-1.5 bg-[#EE1515]/10 hover:bg-[#EE1515] text-[#EE1515] hover:text-[#FFFFFF] font-button font-black rounded-xl text-xs transition border border-[#EE1515]/20"
                      title="Limpar Tipagem"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Compacto de 18 Tipos */}
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                {(Object.values(POKEMON_TYPES) as TypeInfo[]).map((t: TypeInfo) => {
                  const isSelected = selectedDefenseTypes.includes(t.name);
                  return (
                    <button
                      key={t.name}
                      onClick={() => handleDefenseTypeClick(t.name)}
                      className={`py-2 px-1 rounded-xl font-button font-black text-xs transition flex flex-col items-center justify-center gap-1 border shadow-sm ${
                        isSelected
                          ? `${t.colorBg} ${t.colorText} border-[#1E1E1E] scale-105 ring-2 ring-[#FFCB05] shadow-md`
                          : "bg-[#F5F5F5] text-[#1E1E1E]/80 border-[#D9D9D9] hover:bg-[#FFFFFF] hover:border-[#2A75BB]"
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. DASHBOARD DE RESULTADOS (Limpo e Sem Caixas Vazias!) */}
            {selectedDefenseTypes.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-3xl p-10 text-center space-y-2">
                <span className="text-4xl animate-bounce inline-block">👆</span>
                <h3 className="text-base font-black text-[#1E1E1E] font-heading">Selecione uma tipagem acima</h3>
                <p className="text-xs text-[#1E1E1E]/60 font-body">
                  Toque em 1 ou 2 tipos para descobrir instantaneamente como derrotar ou defender esse Pokémon no GO.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* COLUNA ESQUERDA: PERIGOS (Fraquezas) */}
                <div className="bg-[#FFFFFF] border-2 border-red-500/30 rounded-3xl p-5 shadow-md space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#D9D9D9]/60 pb-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h3 className="text-base font-heading font-black text-[#EE1515]">
                        Onde você toma MUITO dano
                      </h3>
                      <p className="text-[11px] text-[#1E1E1E]/60 font-body">Ataques inimigos que são fatais contra seu Pokémon.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Fraqueza Quádrupla (Só aparece se existir!) */}
                    {defenseResults.doubleWeakness.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-button font-black text-purple-700 flex items-center gap-1">
                            <span>💥 Dupla Fraqueza (Fator Crítico!):</span>
                          </span>
                          <span className="font-stats font-black text-[10px] bg-purple-700 text-white px-2 py-0.5 rounded-md">
                            2.56x DANO
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {defenseResults.doubleWeakness.map((type: string) => {
                            const t = POKEMON_TYPES[type];
                            return (
                              <span key={type} className={`px-3 py-1 rounded-xl text-xs font-button font-black shadow-sm flex items-center gap-1 ${t.colorBg} ${t.colorText}`}>
                                <span>{t.icon}</span> <span>{t.name}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fraqueza Simples */}
                    {defenseResults.weakness.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-button font-black text-[#EE1515] flex items-center gap-1">
                            <span>⚠️ Fraqueza Simples:</span>
                          </span>
                          <span className="font-stats font-black text-[10px] bg-[#EE1515] text-white px-2 py-0.5 rounded-md">
                            1.60x DANO
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {defenseResults.weakness.map((type: string) => {
                            const t = POKEMON_TYPES[type];
                            return (
                              <span key={type} className={`px-3 py-1 rounded-xl text-xs font-button font-black shadow-sm flex items-center gap-1 ${t.colorBg} ${t.colorText}`}>
                                <span>{t.icon}</span> <span>{t.name}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {defenseResults.doubleWeakness.length === 0 && defenseResults.weakness.length === 0 && (
                      <p className="text-xs text-emerald-600 font-button font-black py-2">
                        🎉 Incrível! Esta combinação não possui nenhuma fraqueza no jogo!
                      </p>
                    )}
                  </div>
                </div>

                {/* COLUNA DIREITA: SEGURANÇA (Resistências) */}
                <div className="bg-[#FFFFFF] border-2 border-blue-500/30 rounded-3xl p-5 shadow-md space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#D9D9D9]/60 pb-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <h3 className="text-base font-heading font-black text-[#2A75BB]">
                        Onde você se DEFENDE muito bem
                      </h3>
                      <p className="text-[11px] text-[#1E1E1E]/60 font-body">Ataques inimigos que causam pouco dano ao seu Pokémon.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Resistência Simples */}
                    {defenseResults.resistance.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-button font-black text-[#2A75BB] flex items-center gap-1">
                            <span>🛡️ Resistência Simples:</span>
                          </span>
                          <span className="font-stats font-black text-[10px] bg-[#2A75BB] text-white px-2 py-0.5 rounded-md">
                            0.625x DANO
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {defenseResults.resistance.map((type: string) => {
                            const t = POKEMON_TYPES[type];
                            return (
                              <span key={type} className={`px-3 py-1 rounded-xl text-xs font-button font-black shadow-sm flex items-center gap-1 ${t.colorBg} ${t.colorText}`}>
                                <span>{t.icon}</span> <span>{t.name}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Dupla Resistência e Imunidade (Só aparece se existir!) */}
                    {(defenseResults.doubleResistance.length > 0 || defenseResults.immune.length > 0) && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-button font-black text-emerald-700 flex items-center gap-1">
                            <span>🛑 Super Resistência / Imunidade:</span>
                          </span>
                          <span className="font-stats font-black text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                            0.39x DANO
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {defenseResults.doubleResistance.map((type: string) => {
                            const t = POKEMON_TYPES[type];
                            return (
                              <span key={type} className={`px-3 py-1 rounded-xl text-xs font-button font-black shadow-sm flex items-center gap-1 ${t.colorBg} ${t.colorText}`}>
                                <span>{t.icon}</span> <span>{t.name} (1/4x)</span>
                              </span>
                            );
                          })}
                          {defenseResults.immune.map((type: string) => {
                            const t = POKEMON_TYPES[type];
                            return (
                              <span key={type} className={`px-3 py-1 rounded-xl text-xs font-button font-black shadow-sm flex items-center gap-1 ring-2 ring-emerald-500 ${t.colorBg} ${t.colorText}`} title="Imunidade (GO = 0.39x)">
                                <span>{t.icon}</span> <span>{t.name} (Imune)</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {defenseResults.resistance.length === 0 && defenseResults.doubleResistance.length === 0 && defenseResults.immune.length === 0 && (
                      <p className="text-xs text-[#1E1E1E]/50 font-body italic py-2">
                        Este Pokémon não possui resistências especiais contra nenhum tipo.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* =========================================================
             🔥 MODO ATAQUE: VISUAL LIMPO DE OFENSA E VANTAGEM
             ========================================================= */
          <motion.div
            key="attack-mode"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-6"
          >
            {/* 1. SELETOR DE TIPO DO ATAQUE */}
            <div className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9D9D9]/60">
                <span className="text-xs sm:text-sm font-button font-black text-[#EE1515] uppercase tracking-wider">
                  🔥 1. Escolha o Tipo do seu Ataque:
                </span>
                <div className="flex items-center gap-1.5 bg-[#F5F5F5] px-3 py-1 rounded-xl border border-[#D9D9D9]">
                  <span className="text-base">{POKEMON_TYPES[selectedAttackType]?.icon}</span>
                  <span className="text-xs font-button font-black text-[#1E1E1E]">{selectedAttackType}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                {(Object.values(POKEMON_TYPES) as TypeInfo[]).map((t: TypeInfo) => {
                  const isSelected = selectedAttackType === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setSelectedAttackType(t.name)}
                      className={`py-2 px-1 rounded-xl font-button font-black text-xs transition flex flex-col items-center justify-center gap-1 border shadow-sm ${
                        isSelected
                          ? `${t.colorBg} ${t.colorText} border-[#1E1E1E] scale-105 ring-2 ring-[#FFCB05] shadow-md`
                          : "bg-[#F5F5F5] text-[#1E1E1E]/80 border-[#D9D9D9] hover:bg-[#FFFFFF] hover:border-[#EE1515]"
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. RESULTADOS DE ATAQUE (Grid em 3 Colunas Limpas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* VANTAGEM (Super Efetivo) */}
              <div className="bg-[#FFFFFF] border-2 border-green-500/30 rounded-3xl p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-[#D9D9D9]/60 pb-2.5">
                  <span className="text-sm font-heading font-black text-green-700 flex items-center gap-1">
                    <span>✅</span> Super Efetivo Contra:
                  </span>
                  <span className="text-[10px] font-stats font-black bg-green-600 text-white px-2 py-0.5 rounded-md">
                    1.60x DANO
                  </span>
                </div>
                {attackRules.superEffective.length === 0 ? (
                  <p className="text-xs text-[#1E1E1E]/50 font-body italic py-2">Este ataque não tem vantagem especial contra nenhum tipo.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {attackRules.superEffective.map((type: string) => {
                      const t = POKEMON_TYPES[type];
                      return (
                        <span key={type} className={`px-3 py-1.5 rounded-xl text-xs font-button font-black shadow-sm flex items-center gap-1 ${t.colorBg} ${t.colorText}`}>
                          <span>{t.icon}</span> <span>{t.name}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DESVANTAGEM (Pouco Efetivo) */}
              <div className="bg-[#FFFFFF] border-2 border-amber-500/30 rounded-3xl p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-[#D9D9D9]/60 pb-2.5">
                  <span className="text-sm font-heading font-black text-amber-700 flex items-center gap-1">
                    <span>⚠️</span> Pouco Efetivo Contra:
                  </span>
                  <span className="text-[10px] font-stats font-black bg-amber-600 text-white px-2 py-0.5 rounded-md">
                    0.625x DANO
                  </span>
                </div>
                {attackRules.notVeryEffective.length === 0 ? (
                  <p className="text-xs text-[#1E1E1E]/50 font-body italic py-2">Este ataque causa dano normal contra todos os outros tipos.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {attackRules.notVeryEffective.map((type: string) => {
                      const t = POKEMON_TYPES[type];
                      return (
                        <span key={type} className={`px-3 py-1.5 rounded-xl text-xs font-button font-black shadow-sm flex items-center gap-1 ${t.colorBg} ${t.colorText}`}>
                          <span>{t.icon}</span> <span>{t.name}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* IMUNIDADE / SEM EFEITO */}
              <div className="bg-[#FFFFFF] border-2 border-slate-500/30 rounded-3xl p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-[#D9D9D9]/60 pb-2.5">
                  <span className="text-sm font-heading font-black text-[#1E1E1E] flex items-center gap-1">
                    <span>🚫</span> Sem Efeito (Imune):
                  </span>
                  <span className="text-[10px] font-stats font-black bg-[#1E1E1E] text-white px-2 py-0.5 rounded-md">
                    0.39x DANO
                  </span>
                </div>
                {attackRules.noEffect.length === 0 ? (
                  <p className="text-xs text-[#1E1E1E]/50 font-body italic py-2">Nenhum tipo é imune a este ataque no jogo!</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {attackRules.noEffect.map((type: string) => {
                      const t = POKEMON_TYPES[type];
                      return (
                        <span key={type} className={`px-3 py-1.5 rounded-xl text-xs font-button font-black shadow-sm flex items-center gap-1 ${t.colorBg} ${t.colorText}`}>
                          <span>{t.icon}</span> <span>{t.name} (GO: 0.39x)</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}