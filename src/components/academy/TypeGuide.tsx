"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTypeQuizQuestions } from "@/lib/typeQuiz";
import { POKEMON_TYPES, TypeInfo } from "@/lib/typeEffectiveness";

export default function TypeGuide() {
  const [view, setView] = useState<"ALL" | "SOLO" | "DUAL">("ALL");
  const { data: questions = [], isLoading } = useQuery({ queryKey: ["existingTypeCombinations"], queryFn: fetchTypeQuizQuestions, staleTime: Infinity });
  const visible = useMemo(() => questions.filter((question) => view === "ALL" || (view === "SOLO" ? question.defendingTypes.length === 1 : question.defendingTypes.length === 2)), [questions, view]);

  return <section className="w-full space-y-5"><div className="rounded-3xl border-2 border-[#FFCB05]/60 bg-white p-5 shadow-md sm:p-6"><h2 className="font-heading text-2xl font-black text-[#1B4F9C]">📚 Guia de Fraquezas</h2><p className="mt-1 text-sm text-[#1E1E1E]/65">Consulte tipos únicos e apenas combinações que existem em Pokémon reais.</p><div className="mt-4 flex flex-wrap gap-2">{([['ALL', '🌐 Todos'], ['SOLO', '1️⃣ Tipos únicos'], ['DUAL', '2️⃣ Combinações reais']] as const).map(([id, label]) => <button key={id} onClick={() => setView(id)} className={`rounded-xl px-4 py-2 text-xs font-button font-black transition ${view === id ? "bg-[#1B4F9C] text-white shadow" : "bg-[#F5F5F5] text-[#1E1E1E]/70 hover:bg-white border border-[#D9D9D9]"}`}>{label}</button>)}</div></div>
    {isLoading ? <div className="rounded-3xl bg-white p-12 text-center border border-[#D9D9D9]"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#1B4F9C] border-t-transparent" /><p className="mt-3 text-xs font-button font-black text-[#1B4F9C]">Mapeando combinações existentes...</p></div> : <><p className="text-xs font-stats font-black text-[#1E1E1E]/55">{visible.length} tipagens para consultar</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map((question) => <article key={question.key} className="rounded-2xl border border-[#D9D9D9] bg-white p-4 shadow-sm"><div className="flex flex-wrap gap-1.5">{question.defendingTypes.map((type) => { const info = POKEMON_TYPES[type] as TypeInfo; return <span key={type} className={`rounded-lg px-2 py-1 text-xs font-button font-black ${info.colorBg} ${info.colorText}`}>{info.icon} {type}</span>; })}</div><p className="mt-3 text-[10px] font-stats font-black uppercase tracking-wider text-[#EE1515]">Fraco contra</p><div className="mt-1.5 flex flex-wrap gap-1">{question.effectiveTypes.map((type) => { const info = POKEMON_TYPES[type] as TypeInfo; return <span key={type} className={`rounded-md px-2 py-1 text-[10px] font-button font-black ${info.colorBg} ${info.colorText}`}>{info.icon} {type}</span>; })}</div></article>)}</div></>}</section>;
}
