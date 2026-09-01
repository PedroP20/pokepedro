"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GoFestPokemonCard from "@/components/gofest/GoFestPokemonCard";
import RaidDetailModal from "@/components/gofest/RaidDetailModal";
import { ALL_GOFEST_KEYS, GOFEST_BONUSES, GOFEST_DAYS, GOFEST_POKEMON, GoFestPokemon, GoFestSlot } from "@/lib/goFest2026";
import { useGoFestStore } from "@/store/useGoFestStore";

type Tab = "CALENDAR" | "ASCENSION" | "FINAL";

function eventClock(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

function isLive(dayKey: string, slot: GoFestSlot, now: Date) {
  const eventTime = eventClock(now);
  return eventTime.day === dayKey && (!slot.hours || slot.hours.includes(eventTime.hour));
}

function Progress({ current, total, label }: { current: number; total: number; label: string }) {
  const percent = total ? Math.round((current / total) * 100) : 0;
  return <div className="space-y-1"><div className="flex justify-between text-[11px] font-button font-black text-[#1E1E1E]/70"><span>{label}</span><span>{current} / {total}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#D9D9D9]"><div className="h-full rounded-full bg-gradient-to-r from-[#1B4F9C] to-[#2A75BB] transition-all" style={{ width: `${percent}%` }} /></div></div>;
}

export default function GoFestPage() {
  const [activeTab, setActiveTab] = useState<Tab>("CALENDAR");
  const [now, setNow] = useState(() => new Date());
  const eventToday = eventClock(now).day;
  const [selectedDayKey, setSelectedDayKey] = useState(() => GOFEST_DAYS.some((day) => day.key === eventToday) ? eventToday : GOFEST_DAYS[0].key);
  const [raidDetail, setRaidDetail] = useState<GoFestPokemon | null>(null);
  const { captured, toggleCaptured } = useGoFestStore();

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedDay = GOFEST_DAYS.find((day) => day.key === selectedDayKey) || GOFEST_DAYS[0];
  const dayKeys = useMemo(() => [...new Set([...(selectedDay.superRaids || []), ...(selectedDay.specialRaids || []), ...selectedDay.slots.flatMap((slot) => [...slot.wild, ...slot.raids])])], [selectedDay]);
  const totalCaptured = ALL_GOFEST_KEYS.filter((key) => captured[key]).length;
  const dayCaptured = dayKeys.filter((key) => captured[key]).length;
  const renderCards = (keys: string[], raid = false, raidLabel?: string) => keys.map((key) => {
    const pokemon = GOFEST_POKEMON[key];
    return <GoFestPokemonCard key={key} pokemon={pokemon} isRaid={raid} raidLabel={raidLabel} captured={!!captured[key]} onToggle={() => toggleCaptured(key)} onOpen={() => setRaidDetail(pokemon)} />;
  });

  const bonusTab = activeTab === "ASCENSION" ? { title: "Mega Ascensão", period: "31 de agosto → 4 de setembro de 2026", cards: GOFEST_BONUSES.ASCENSION, color: "#1B4F9C" } : { title: "Megafinal", period: "5 → 6 de setembro de 2026", cards: GOFEST_BONUSES.FINAL, color: "#EE1515" };

  return <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-3 sm:p-6 font-navbar">
    <section className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-white shadow-sm">
      <div className="bg-gradient-to-r from-[#1B4F9C] via-[#2A75BB] to-[#1B4F9C] px-5 py-5 text-white sm:px-7"><span className="rounded-full bg-[#FFCB05] px-2.5 py-1 text-[10px] font-stats font-black text-[#1B4F9C]">EVENTO 2026</span><h1 className="mt-2 font-heading text-3xl font-black sm:text-4xl">⚡ GOFEST</h1><p className="text-sm text-white/85">Checklist de capturas, calendário e estratégia de Megarreides.</p></div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5"><Progress current={totalCaptured} total={ALL_GOFEST_KEYS.length} label="Progresso geral do evento" /><div className="rounded-xl bg-[#F5F5F5] px-3 py-2 text-xs font-body text-[#1E1E1E]/70"><b className="text-[#1B4F9C]">Horário do evento:</b> America/São Paulo<br />O calendário destaca a rotação ativa quando a data estiver dentro do GO Fest.</div></div>
    </section>

    <nav className="grid grid-cols-3 gap-2 rounded-2xl border border-[#D9D9D9] bg-white p-1.5" aria-label="Navegação do GO Fest">
      {([ ["CALENDAR", "📅 Calendário"], ["ASCENSION", "⬆️ Mega Ascensão"], ["FINAL", "🏁 Megafinal"] ] as [Tab, string][]).map(([tab, label]) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-2 py-2.5 text-[11px] font-button font-black transition sm:text-sm ${activeTab === tab ? "bg-[#1B4F9C] text-white shadow" : "text-[#1E1E1E]/65 hover:bg-[#F5F5F5]"}`}>{label}</button>)}
    </nav>

    <AnimatePresence mode="wait">
      {activeTab === "CALENDAR" ? <motion.section key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Dias do evento">{GOFEST_DAYS.map((day) => <button key={day.key} onClick={() => setSelectedDayKey(day.key)} className={`min-w-[76px] rounded-xl border px-3 py-2 text-center font-button transition ${selectedDay.key === day.key ? "border-[#EE1515] bg-[#EE1515] text-white shadow-md" : "border-[#D9D9D9] bg-white text-[#1E1E1E]/70 hover:border-[#2A75BB]"}`}><span className="block text-[9px] font-bold">{day.weekday.slice(0, 3).toUpperCase()}</span><span className="block text-xs font-black">{day.label}</span></button>)}</div>
        <section className={`rounded-3xl border-2 bg-white p-4 shadow-sm sm:p-6 ${selectedDay.event === "MEGAFINAL" ? "border-[#EE1515]/35" : "border-[#2A75BB]/35"}`}>
          <div className="flex flex-col gap-3 border-b border-[#D9D9D9] pb-4 sm:flex-row sm:items-center sm:justify-between"><div><span className={`rounded-full px-2.5 py-1 text-[10px] font-stats font-black ${selectedDay.event === "MEGAFINAL" ? "bg-red-100 text-[#EE1515]" : "bg-blue-100 text-[#1B4F9C]"}`}>{selectedDay.event}</span><h2 className="mt-2 font-heading text-2xl font-black text-[#1E1E1E]">{selectedDay.weekday} · {selectedDay.label}</h2></div><div className="min-w-40"><Progress current={dayCaptured} total={dayKeys.length} label="Capturas deste dia" /></div></div>
          {selectedDay.superRaids && <section className={`mt-5 rounded-2xl border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 ${eventToday === selectedDay.key ? "ring-2 ring-purple-300" : ""}`}><div className="mb-3 flex items-center justify-between"><div><h3 className="font-heading text-lg font-black text-purple-900">🌟 Super Megarreide — Dia Todo</h3><p className="text-xs text-purple-800/70">Ativa durante todo o dia do evento.</p></div>{eventToday === selectedDay.key && <span className="animate-pulse rounded-full bg-red-600 px-2 py-1 text-[10px] font-black text-white">🔴 AO VIVO</span>}</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{renderCards(selectedDay.superRaids, true, "SUPER")}</div></section>}
          {selectedDay.specialRaids && <section className={`mt-5 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 p-4 ${eventToday === selectedDay.key ? "ring-2 ring-amber-300" : ""}`}><div className="mb-3 flex items-center justify-between"><div><h3 className="font-heading text-lg font-black text-amber-900">⭐ Reide Especial — Dia Todo</h3><p className="text-xs text-amber-800/70">Ativa durante todo o dia do evento.</p></div>{eventToday === selectedDay.key && <span className="animate-pulse rounded-full bg-red-600 px-2 py-1 text-[10px] font-black text-white">🔴 AO VIVO</span>}</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{renderCards(selectedDay.specialRaids, true, "ESPECIAL")}</div></section>}
          <div className="mt-5 space-y-5">{selectedDay.slots.map((slotItem) => { const live = isLive(selectedDay.key, slotItem, now); return <section key={slotItem.label} className={`rounded-2xl border p-3 sm:p-4 ${live ? "border-red-400 bg-red-50/40 ring-2 ring-red-200" : "border-[#D9D9D9] bg-[#F5F5F5]/50"}`}><header className="mb-4 flex flex-wrap items-center gap-2"><h3 className="font-button text-sm font-black text-[#1B4F9C]">🕒 {slotItem.label}</h3>{live && <span className="animate-pulse rounded-full bg-[#EE1515] px-2 py-1 text-[10px] font-stats font-black text-white">🔴 ROLANDO AGORA</span>}</header><h4 className="mb-2 text-xs font-button font-black uppercase tracking-wide text-emerald-700">🌿 Natureza</h4><div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">{renderCards(slotItem.wild)}</div><h4 className="mb-2 mt-5 text-xs font-button font-black uppercase tracking-wide text-[#EE1515]">⚔️ Megarreides · toque para estratégia</h4><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{renderCards(slotItem.raids, true)}</div></section>; })}</div>
        </section>
      </motion.section> : <motion.section key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-3xl border border-[#D9D9D9] bg-white p-5 shadow-sm sm:p-7"><span className="rounded-full px-2.5 py-1 text-[10px] font-stats font-black text-white" style={{ backgroundColor: bonusTab.color }}>GO FEST 2026</span><h2 className="mt-3 font-heading text-3xl font-black text-[#1E1E1E]">{bonusTab.title}</h2><p className="mb-5 text-sm text-[#1E1E1E]/65">{bonusTab.period}</p><div className="grid gap-3 sm:grid-cols-2">{bonusTab.cards.map(([icon, title, description]) => <article key={title} className="rounded-2xl border border-[#D9D9D9] bg-[#F5F5F5] p-4"><span className="text-3xl">{icon}</span><h3 className="mt-2 font-button text-base font-black text-[#1B4F9C]">{title}</h3><p className="mt-1 text-xs leading-relaxed text-[#1E1E1E]/70">{description}</p></article>)}</div></motion.section>}
    </AnimatePresence>
    <RaidDetailModal pokemon={raidDetail} onClose={() => setRaidDetail(null)} />
  </main>;
}
