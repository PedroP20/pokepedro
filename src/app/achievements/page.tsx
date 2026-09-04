"use client";

import { useState } from "react";
import { ACHIEVEMENTS, AchievementCategory, CATEGORY_LABELS, TIER_COLORS, TIER_LABELS } from "@/lib/achievements";
import { getAchievementValue, useAchievementStore } from "@/store/useAchievementStore";

type Filter = "TODAS" | "DESBLOQUEADAS" | "BLOQUEADAS" | AchievementCategory;

const formatDate = (timestamp: number) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(timestamp);

export default function AchievementsPage() {
  const progress = useAchievementStore((state) => state.progress);
  const [filter, setFilter] = useState<Filter>("TODAS");
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("PROXIMAS");
  const unlocked = ACHIEVEMENTS.filter((item) => progress.unlocked[item.id]);
  const points = unlocked.reduce((total, item) => total + item.points, 0);
  const level = Math.floor(points / 250) + 1;
  const levelProgress = points % 250;
  const achievements = ACHIEVEMENTS.filter((item) => {
    const isUnlocked = Boolean(progress.unlocked[item.id]);
    const visibleName = item.secret && !isUnlocked ? "" : `${item.name} ${item.description}`;
    return (filter === "TODAS" || (filter === "DESBLOQUEADAS" && isUnlocked) || (filter === "BLOQUEADAS" && !isUnlocked) || item.category === filter) && visibleName.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => {
    if (order === "RECENTES") return (progress.unlocked[b.id] || 0) - (progress.unlocked[a.id] || 0);
    if (order === "RARIDADE") return b.points - a.points;
    return (a.target - getAchievementValue(progress, a)) / a.target - (b.target - getAchievementValue(progress, b)) / b.target;
  });

  return <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 p-3 sm:space-y-7 sm:p-8 font-navbar">
    <section className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-sm">
      <div className="bg-gradient-to-br from-[#1B4F9C] via-[#2A75BB] to-indigo-800 p-5 text-white sm:p-8">
        <p className="text-xs font-black tracking-[0.2em] text-[#FFCB05]">PROGRESSÃO DO TREINADOR</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-heading text-3xl font-black sm:text-4xl">🏆 Conquistas</h1><p className="mt-1 text-sm text-white/80">Desafios registrados a partir da estreia deste sistema.</p></div><div className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-white/65">Pontuação</p><p className="text-2xl font-black text-[#FFCB05]">{points} pts</p></div></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white/12 p-3"><p className="text-xs font-bold text-white/70">Desbloqueadas</p><p className="text-2xl font-black">{unlocked.length} <span className="text-sm text-white/70">/ {ACHIEVEMENTS.length}</span></p></div><div className="rounded-2xl bg-white/12 p-3"><p className="text-xs font-bold text-white/70">Conclusão</p><p className="text-2xl font-black">{Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)}%</p></div><div className="rounded-2xl bg-white/12 p-3"><p className="text-xs font-bold text-white/70">Treinador</p><p className="text-2xl font-black">Nv. {level}</p></div></div>
        <div className="mt-4"><div className="mb-1 flex justify-between text-[10px] font-bold text-white/75"><span>XP para o próximo nível</span><span>{levelProgress} / 250</span></div><div className="h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-[#FFCB05] transition-all" style={{ width: `${(levelProgress / 250) * 100}%` }} /></div></div>
      </div>
    </section>
    <section className="rounded-3xl border border-[#D9D9D9] bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1"><button onClick={() => setFilter("TODAS")} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${filter === "TODAS" ? "bg-[#EE1515] text-white" : "bg-[#F5F5F5] text-[#1E1E1E]/70"}`}>Todas</button><button onClick={() => setFilter("DESBLOQUEADAS")} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${filter === "DESBLOQUEADAS" ? "bg-[#EE1515] text-white" : "bg-[#F5F5F5] text-[#1E1E1E]/70"}`}>Desbloqueadas</button><button onClick={() => setFilter("BLOQUEADAS")} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${filter === "BLOQUEADAS" ? "bg-[#EE1515] text-white" : "bg-[#F5F5F5] text-[#1E1E1E]/70"}`}>Bloqueadas</button>{(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map((category) => <button key={category} onClick={() => setFilter(category)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${filter === category ? "bg-[#1B4F9C] text-white" : "bg-[#F5F5F5] text-[#1E1E1E]/70"}`}>{CATEGORY_LABELS[category]}</button>)}</div><div className="flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar conquista" className="min-w-0 rounded-xl border border-[#D9D9D9] px-3 py-2 text-xs outline-none focus:border-[#2A75BB]" /><select value={order} onChange={(event) => setOrder(event.target.value)} className="rounded-xl border border-[#D9D9D9] bg-white px-2 text-xs font-bold"><option value="PROXIMAS">Mais próximas</option><option value="RECENTES">Recentes</option><option value="RARIDADE">Raridade</option></select></div></div></section>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{achievements.map((item) => { const unlockedAt = progress.unlocked[item.id]; const value = getAchievementValue(progress, item); const percent = Math.min(100, Math.round((value / item.target) * 100)); const hidden = item.secret && !unlockedAt; return <article key={item.id} className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition ${unlockedAt ? "border-[#2A75BB]/50 bg-white" : "border-[#D9D9D9] bg-[#F5F5F5]"}`}><div className="flex gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${unlockedAt ? "bg-[#FFCB05]" : "bg-[#D9D9D9] grayscale"}`}>{hidden ? "🔒" : item.icon}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className="truncate text-sm font-black text-[#1E1E1E]">{hidden ? "Conquista secreta" : item.name}</h2><span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${TIER_COLORS[item.tier]}`}>{TIER_LABELS[item.tier]}</span></div><p className="mt-1 min-h-8 text-[11px] leading-snug text-[#1E1E1E]/65">{hidden ? "Continue jogando para descobrir." : item.description}</p></div></div><div className="mt-3"><div className="mb-1 flex justify-between text-[10px] font-bold text-[#1E1E1E]/55"><span>{value} / {item.target}</span><span>{percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#D9D9D9]"><div className={`h-full rounded-full ${unlockedAt ? "bg-[#2A75BB]" : "bg-[#1E1E1E]/35"}`} style={{ width: `${percent}%` }} /></div></div><div className="mt-3 flex items-center justify-between text-[10px] font-bold"><span className="text-[#1E1E1E]/50">{item.points} pontos · {item.rarity}</span><span className={unlockedAt ? "text-emerald-600" : "text-[#1E1E1E]/45"}>{unlockedAt ? `✓ ${formatDate(unlockedAt)}` : "Bloqueada"}</span></div></article>; })}</section>
    <section className="rounded-3xl border border-[#D9D9D9] bg-white p-5 shadow-sm"><h2 className="font-heading text-xl font-black text-[#1B4F9C]">Recentemente desbloqueadas</h2><div className="mt-3 space-y-2">{unlocked.sort((a, b) => progress.unlocked[b.id] - progress.unlocked[a.id]).slice(0, 5).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#F5F5F5] p-3"><span>{item.icon}</span><span className="flex-1 text-sm font-black">{item.name}</span><span className="text-xs text-[#1E1E1E]/55">{formatDate(progress.unlocked[item.id])}</span></div>)}{unlocked.length === 0 && <p className="text-sm text-[#1E1E1E]/60">Suas próximas conquistas aparecerão aqui.</p>}</div></section>
  </main>;
}
