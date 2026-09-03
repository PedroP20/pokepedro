"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { POKEMON_TYPES, TypeInfo } from "@/lib/typeEffectiveness";
import { useGameStore } from "@/store/useGameStore";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

export default function TypeQuizGame() {
  const { gameMode, currentTypeQuestion, typeFoundAnswers, typeStandardOptions: options, score, totalAnswered, streak, completeTypeQuestion, nextTypeQuestion, setTypeFoundAnswers } = useGameStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "correct" | "wrong" | "duplicate"; text: string } | null>(null);
  const hardMode = gameMode === "TYPE_HARD";

  if (!currentTypeQuestion) return null;
  const total = currentTypeQuestion.effectiveTypes.length;
  const complete = (correct: boolean) => { completeTypeQuestion(correct); setSelected(correct ? "correct" : "wrong"); };
  const submitHard = (event: FormEvent) => {
    event.preventDefault();
    const answer = Object.keys(POKEMON_TYPES).find((type) => normalize(type) === normalize(input));
    if (!answer) { setFeedback({ kind: "wrong", text: "Digite um tipo Pokémon válido." }); return; }
    if (typeFoundAnswers.includes(answer)) { setFeedback({ kind: "duplicate", text: `${answer} já foi encontrado.` }); setInput(""); return; }
    if (!currentTypeQuestion.effectiveTypes.includes(answer)) { setFeedback({ kind: "wrong", text: `${answer} não é eficaz contra esta tipagem.` }); setInput(""); return; }
    const found = [...typeFoundAnswers, answer];
    setTypeFoundAnswers(found); setInput("");
    if (found.length === total) { setFeedback({ kind: "correct", text: "Perfeito! Todas as fraquezas foram encontradas." }); completeTypeQuestion(true); window.setTimeout(() => { setFeedback(null); nextTypeQuestion(); }, 1000); }
    else setFeedback({ kind: "correct", text: `${answer} é super eficaz!` });
  };

  return <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full my-auto font-body space-y-4">
    <header className="w-full flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-[#D9D9D9] shadow-sm font-stats"><div className="flex items-center gap-4"><div><span className="block text-[10px] uppercase font-bold text-[#1E1E1E]/50">Placar</span><span className="text-base font-black text-[#1B4F9C]">{score} / {totalAnswered}</span></div><div className="h-6 w-px bg-[#D9D9D9]" /><div><span className="block text-[10px] uppercase font-bold text-[#1E1E1E]/50">Ofensiva</span><span className="text-base font-black text-[#FFCB05]">🔥 {streak}</span></div></div><Link href="/" className="px-3 py-1.5 rounded-xl bg-red-50 text-[#EE1515] border border-red-200 font-button font-bold text-xs">Sair ✕</Link></header>
    <div className="w-full max-w-xl text-center space-y-4"><div className="rounded-xl bg-[#FFCB05] text-[#1B4F9C] py-2 px-4 font-black text-sm shadow-sm border border-yellow-500">⚡ {hardMode ? "MODO TIPOS — DESAFIO COMPLETO" : "MODO TIPOS — UMA FRAQUEZA"}</div><p className="text-sm font-button font-black text-[#1E1E1E]/65">Qual ataque é mais eficaz contra este Pokémon?</p><div className="flex flex-wrap justify-center gap-3 rounded-3xl bg-white border-2 border-[#1B4F9C]/20 p-6 shadow-xl">{currentTypeQuestion.defendingTypes.map((type) => { const info = POKEMON_TYPES[type] as TypeInfo; return <span key={type} className={`min-w-32 rounded-2xl px-5 py-4 font-heading text-2xl font-black shadow ${info.colorBg} ${info.colorText}`}>{info.icon} {type}</span>; })}</div></div>
    <section className="w-full max-w-xl flex flex-col items-center pb-4">
      {!hardMode ? <><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">{options.map((option) => { const info = POKEMON_TYPES[option] as TypeInfo; const isCorrect = currentTypeQuestion.effectiveTypes.includes(option); const shown = selected && (isCorrect || selected === option); return <button key={option} disabled={Boolean(selected)} onClick={() => { const yes = currentTypeQuestion.effectiveTypes.includes(option); setFeedback(yes ? { kind: "correct", text: "Muito bem! Esse ataque é eficaz." } : { kind: "wrong", text: `${option} não é eficaz contra essa combinação.` }); complete(yes); }} className={`rounded-2xl border-2 px-5 py-4 font-button font-black text-left transition ${shown && isCorrect ? "bg-green-100 border-green-600 text-green-800" : shown ? "bg-red-50 border-[#EE1515] text-[#EE1515]" : "bg-white border-[#D9D9D9] hover:border-[#1B4F9C]"}`}>{info.icon} {option}{shown && isCorrect ? " ✓" : ""}</button>; })}</div>{feedback && <div className={`mt-4 w-full rounded-2xl p-3 text-center font-button font-black text-sm ${feedback.kind === "correct" ? "bg-green-50 text-green-800 border border-green-300" : "bg-red-50 text-[#EE1515] border border-red-200"}`}>{feedback.text}</div>}{selected && <button onClick={() => { setSelected(null); setFeedback(null); nextTypeQuestion(); }} className="mt-4 w-full rounded-2xl bg-[#1B4F9C] py-3 font-button font-black text-white">Próximo desafio →</button>}</> : <><p className="mb-3 text-center font-heading text-lg font-black text-[#1E1E1E]">Encontre {total} tipos eficazes</p><p className="mb-3 text-xs font-stats font-black text-[#1B4F9C]">{typeFoundAnswers.length} / {total} encontrados</p><div className="flex flex-wrap justify-center gap-2 mb-4">{typeFoundAnswers.map((type) => { const info = POKEMON_TYPES[type] as TypeInfo; return <span key={type} className={`rounded-xl px-3 py-2 text-xs font-button font-black ${info.colorBg} ${info.colorText}`}>✓ {info.icon} {type}</span>; })}</div><form onSubmit={submitHard} className="w-full flex flex-col sm:flex-row gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Digite um tipo, ex.: Fogo" className="flex-1 px-5 py-4 rounded-2xl border-2 border-[#1B4F9C] bg-white font-heading font-black text-lg outline-none" /><button disabled={!input.trim()} className="px-8 py-4 bg-[#1B4F9C] disabled:bg-gray-300 text-white font-button font-black rounded-2xl">Enviar</button></form>{feedback && <div className={`mt-4 w-full rounded-2xl p-3 text-center font-button font-black text-sm ${feedback.kind === "correct" ? "bg-green-50 text-green-800 border border-green-300" : feedback.kind === "duplicate" ? "bg-amber-50 text-amber-800 border border-amber-300" : "bg-red-50 text-[#EE1515] border border-red-200"}`}>{feedback.text}</div>}</>}</section>
  </main>;
}
