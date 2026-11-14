"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import WildAreaCard from "@/components/wildarea/WildAreaCard";
import RaidDetailModal from "@/components/gofest/RaidDetailModal";
import { useEventClock } from "@/components/events/useEventClock";
import { useWildAreaStore } from "@/store/useWildAreaStore";
import {
  ALL_WILD_AREA_KEYS, artworkUrl, DayKey, EGGS_10KM, FEATURED_MOVES, FREE_BONUSES, HIGHLIGHTS, INCENSE_ALL, INCENSE_TICKET,
  INCENSE_TICKET_INCREDIBLE, INCREDIBLE, MAX_BATTLES, RAIDS, SPECIAL_BACKGROUND, TICKET_BONUSES, TIPS, WILD_AREA_EVENT,
  WILD_AREA_POKEMON, WILD_SPAWNS, WildAreaPokemon,
} from "@/lib/wildArea2026";

const NONE: Record<string, boolean> = {};
type Filter = "all" | "missing" | "captured";
type SpawnHour = keyof typeof WILD_SPAWNS;

const SECTIONS = [
  ["natureza", "🌿", "Natureza"],
  ["reides", "⚔️", "Reides"],
  ["max", "💠", "Batalhas Max"],
  ["incriveis", "🌟", "Incríveis"],
  ["incenso", "🔥", "Incenso"],
  ["ovos", "🥚", "Ovos"],
  ["ataques", "💥", "Ataques"],
  ["bonus", "🎁", "Bônus"],
  ["dicas", "💡", "Dicas"],
] as const;

// O evento acontece no horário local de cada jogador, então usamos o relógio do aparelho.
const at = (day: number, hour: number) => new Date(WILD_AREA_EVENT.start.year, WILD_AREA_EVENT.start.month - 1, day, hour).getTime();
const WINDOWS = WILD_AREA_EVENT.days.map(day => ({ ...day, start: at(day.day, WILD_AREA_EVENT.hours.start), end: at(day.day, WILD_AREA_EVENT.hours.end) }));

function duration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400), h = Math.floor((total % 86400) / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return d > 0 ? `${d}d ${h}h ${m}min` : h > 0 ? `${h}h ${m}min ${String(s).padStart(2, "0")}s` : `${m}min ${String(s).padStart(2, "0")}s`;
}

type Status = { tone: "soon" | "live" | "pause" | "over"; label: string; detail: string; liveDay?: DayKey };
function eventStatus(now: number | null): Status | null {
  if (now === null) return null;
  const [sat, sun] = WINDOWS;
  if (now < sat.start) return { tone: "soon", label: "Começa em", detail: duration(sat.start - now) };
  const live = WINDOWS.find(w => now >= w.start && now < w.end);
  if (live) return { tone: "live", label: `Ao vivo · ${live.weekday}`, detail: `termina em ${duration(live.end - now)}`, liveDay: live.key };
  if (now < sun.start) return { tone: "pause", label: "Pausa até domingo", detail: `volta em ${duration(sun.start - now)}` };
  return { tone: "over", label: "Evento encerrado", detail: "Obrigado por jogar!" };
}

function Ring({ value, total, size = 92 }: { value: number; total: number; size?: number }) {
  const radius = size / 2 - 7, circumference = 2 * Math.PI * radius, percent = total ? value / total : 0;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="wa-ring" aria-hidden="true">
    <circle cx={size / 2} cy={size / 2} r={radius} className="wa-ring-track" />
    <circle cx={size / 2} cy={size / 2} r={radius} className="wa-ring-value" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent)} />
  </svg>;
}

function MiniProgress({ keys, captured }: { keys: readonly string[]; captured: Record<string, boolean> }) {
  const done = keys.filter(key => captured[key]).length;
  const complete = done === keys.length && keys.length > 0;
  return <span className={`wa-mini-progress ${complete ? "is-complete" : ""}`}><span style={{ width: `${keys.length ? (done / keys.length) * 100 : 0}%` }} /><b>{complete ? "Completo! 🎉" : `${done}/${keys.length}`}</b></span>;
}

function Section({ id, icon, title, subtitle, keys, captured, accent, children }: { id: string; icon: string; title: string; subtitle?: ReactNode; keys?: readonly string[]; captured: Record<string, boolean>; accent?: string; children: ReactNode }) {
  return <section id={id} className="wa-section" style={accent ? { ["--wa-accent" as string]: accent } : undefined}>
    <header className="wa-section-head">
      <span className="wa-section-icon" aria-hidden="true">{icon}</span>
      <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {keys && <MiniProgress keys={keys} captured={captured} />}
    </header>
    {children}
  </section>;
}

export default function WildAreaExperience() {
  const now = useEventClock();
  const status = eventStatus(now);
  const { captured, shiny, toggleCaptured, toggleShiny, reset } = useWildAreaStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // O checklist fica no localStorage: reidrata só no navegador para não divergir do HTML do servidor.
    const finish = useWildAreaStore.persist.onFinishHydration(() => setHydrated(true));
    void useWildAreaStore.persist.rehydrate();
    return finish;
  }, []);
  const checks = hydrated ? captured : NONE;
  const shinies = hydrated ? shiny : NONE;

  const [pickedDay, setPickedDay] = useState<DayKey | null>(null);
  const day: DayKey = pickedDay ?? status?.liveDay ?? (status?.tone === "pause" || status?.tone === "over" ? "sun" : "sat");
  const dayInfo = WILD_AREA_EVENT.days.find(d => d.key === day)!;
  const [hour, setHour] = useState<SpawnHour>("steel");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [strategy, setStrategy] = useState<{ pokemon: WildAreaPokemon; kicker: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const totalCaptured = ALL_WILD_AREA_KEYS.filter(key => checks[key]).length;
  const totalShiny = ALL_WILD_AREA_KEYS.filter(key => shinies[key]).length;
  const percent = Math.round((totalCaptured / ALL_WILD_AREA_KEYS.length) * 100);

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return (keys: readonly string[]) => keys.filter(key => {
      const pokemon = WILD_AREA_POKEMON[key];
      if (filter === "missing" && checks[key]) return false;
      if (filter === "captured" && !checks[key]) return false;
      if (!term) return true;
      const haystack = `${pokemon.name} ${pokemon.tag ?? ""} ${pokemon.types.join(" ")}`.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "");
      return haystack.includes(term);
    });
  }, [filter, query, checks]);

  const grid = (keys: readonly string[], opts: { badge?: string; strategy?: string; dense?: boolean } = {}) => {
    const shown = visible(keys);
    if (!shown.length) return <p className="wa-empty">{filter === "missing" && !query ? "Tudo capturado por aqui! 🎉" : "Nenhum Pokémon com esse filtro."}</p>;
    return <motion.div layout className={`wa-grid ${opts.dense ? "is-dense" : ""}`}>
      <AnimatePresence mode="popLayout">
        {shown.map(key => {
          const pokemon = WILD_AREA_POKEMON[key];
          return <WildAreaCard key={key} pokemon={pokemon} captured={!!checks[key]} shiny={!!shinies[key]} badge={opts.badge}
            specialBackground={!!opts.strategy && SPECIAL_BACKGROUND.includes(key)}
            onToggle={() => toggleCaptured(key)} onToggleShiny={() => toggleShiny(key)}
            onStrategy={opts.strategy ? () => setStrategy({ pokemon, kicker: opts.strategy! }) : undefined} />;
        })}
      </AnimatePresence>
    </motion.div>;
  };

  const raids = RAIDS[day], max = MAX_BATTLES[day], incredible = INCREDIBLE[day];
  const spawn = WILD_SPAWNS[hour];

  return <><main id="main-content" className="club-page wa-page">
    {/* HERO */}
    <section className="wa-hero">
      <svg className="wa-hero-landscape" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 210 L140 120 L230 175 L360 70 L470 160 L560 110 L700 190 L820 90 L940 170 L1060 100 L1200 180 L1200 300 L0 300Z" className="wa-mtn-back" />
        <path d="M0 250 L120 200 L260 240 L400 180 L540 235 L690 195 L820 245 L980 190 L1100 230 L1200 205 L1200 300 L0 300Z" className="wa-mtn-front" />
      </svg>
      <div className="wa-hero-copy">
        <span className="wa-chip"><span className="wa-dot" /> EVENTO GLOBAL · AÇO & DRAGÃO</span>
        <h1>Área Selvagem <em>GO</em></h1>
        <p>O maior fim de semana do ano no Pokémon GO. Dialga e Palkia Dinamax, a estreia de Duraludon Gigamax e Pokémon incríveis na natureza — jogue de qualquer lugar.</p>
        <div className="wa-hero-meta">
          <span>📅 <b>14 e 15 de novembro</b></span>
          <span>⏰ <b>10h às 18h</b> · horário local</span>
          <span>🌍 <b>Global</b> · de qualquer lugar</span>
        </div>
        <div className={`wa-status is-${status?.tone ?? "soon"}`} aria-live="polite">
          {status ? <><span className="wa-status-label">{status.tone === "live" && <span className="wa-live-dot" />}{status.label}</span><b>{status.detail}</b></> : <span className="wa-status-label">Carregando relógio…</span>}
        </div>
      </div>
      <div className="wa-hero-stage" aria-hidden="true">
        <div className="wa-hero-glow" />
        <div className="wa-hero-art main"><Image src={artworkUrl(WILD_AREA_POKEMON["duraludon-gmax"])} alt="" fill sizes="320px" unoptimized priority /></div>
        <div className="wa-hero-art left"><Image src={artworkUrl(WILD_AREA_POKEMON["dialga-dynamax"])} alt="" fill sizes="160px" unoptimized /></div>
        <div className="wa-hero-art right"><Image src={artworkUrl(WILD_AREA_POKEMON["palkia-dynamax"])} alt="" fill sizes="160px" unoptimized /></div>
      </div>
      <div className="wa-hero-progress">
        <div className="wa-ring-wrap"><Ring value={totalCaptured} total={ALL_WILD_AREA_KEYS.length} /><span><b>{percent}%</b></span></div>
        <div>
          <span className="wa-eyebrow">SEU CHECKLIST</span>
          <strong>{totalCaptured} <small>de {ALL_WILD_AREA_KEYS.length} Pokémon</small></strong>
          <span className="wa-shiny-count">✨ {totalShiny} brilhante{totalShiny === 1 ? "" : "s"}</span>
        </div>
      </div>
    </section>

    {/* NOVIDADES */}
    <section className="wa-highlights" aria-label="Novidades do evento">
      {HIGHLIGHTS.map((item, index) => <article key={item.key} className="wa-highlight" style={{ animationDelay: `${120 + index * 70}ms` }}>
        <div className="wa-highlight-art"><Image src={artworkUrl(WILD_AREA_POKEMON[item.key])} alt="" fill sizes="96px" unoptimized /></div>
        <span className="wa-eyebrow">{item.kicker}</span>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </article>)}
    </section>

    {/* BARRA DE CONTROLE */}
    <div className="wa-toolbar">
      <nav className="wa-jump" aria-label="Seções da Área Selvagem">
        {SECTIONS.map(([id, icon, label]) => <a key={id} href={`#${id}`}><span aria-hidden="true">{icon}</span>{label}</a>)}
      </nav>
      <div className="wa-controls">
        <div className="wa-segment" role="group" aria-label="Dia do evento">
          {WILD_AREA_EVENT.days.map(d => <button key={d.key} type="button" aria-pressed={day === d.key} className={day === d.key ? "is-active" : ""} onClick={() => setPickedDay(d.key)}>
            {d.weekday} <small>{d.date}</small>{status?.liveDay === d.key && <span className="wa-live-dot" title="Ao vivo" />}
          </button>)}
        </div>
        <div className="wa-segment" role="group" aria-label="Filtrar checklist">
          {([["all", "Todos"], ["missing", "Faltando"], ["captured", "Capturados"]] as [Filter, string][]).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <label className="wa-search"><span aria-hidden="true">🔍</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar Pokémon ou tipo" aria-label="Buscar Pokémon ou tipo" /></label>
      </div>
    </div>
    <p className="wa-hint">Toque no Pokémon para marcar como capturado · ✨ marca brilhante · ⚔️ mostra os melhores tipos para a batalha · 🖼️ pode vir com Fundo Especial</p>

    {/* NATUREZA */}
    <Section id="natureza" icon="🌿" title="Na natureza" accent="#2f8a5b" captured={checks} keys={spawn.keys}
      subtitle="Dois horários rotativos durante o evento: primeiro a Hora Sólido como Aço, depois a Hora de Determinação de Dragão. Com sorte, encontre Brilhantes!">
      <div className="wa-hour-tabs" role="tablist" aria-label="Horário rotativo">
        {(Object.keys(WILD_SPAWNS) as SpawnHour[]).map((key, index) => <button key={key} role="tab" type="button" aria-selected={hour === key} className={`wa-hour-tab is-${key} ${hour === key ? "is-active" : ""}`} onClick={() => setHour(key)}>
          <span className="wa-hour-num">{index + 1}º</span>
          <span><b>{WILD_SPAWNS[key].title}</b><small>{WILD_SPAWNS[key].order} · {WILD_SPAWNS[key].keys.filter(k => checks[k]).length}/{WILD_SPAWNS[key].keys.length}</small></span>
        </button>)}
      </div>
      {grid(spawn.keys, { dense: true })}
    </Section>

    {/* REIDES */}
    <Section id="reides" icon="⚔️" title={`Reides · ${dayInfo.weekday}`} accent="#d6453d" captured={checks} keys={[...raids.threeStar, ...raids.fiveStar]}
      subtitle={<>Vença Kyurem Preto e Kyurem Branco para ganhar <b>Energia de Fusão</b>. Kyurem de reide conhece o ataque carregado <b>Glaciar</b>.</>}>
      <div className="wa-split">
        <div><h3 className="wa-sub">★★★ Reides de 3 estrelas</h3>{grid(raids.threeStar, { badge: "3★", strategy: "REIDE 3 ESTRELAS" })}</div>
        <div><h3 className="wa-sub">★★★★★ Reides de 5 estrelas</h3>{grid(raids.fiveStar, { badge: "5★", strategy: "REIDE 5 ESTRELAS" })}</div>
      </div>
    </Section>

    {/* BATALHAS MAX */}
    <Section id="max" icon="💠" title={`Batalhas Max · ${dayInfo.weekday}`} accent="#c2337a" captured={checks} keys={[...max.dynamax, ...max.gigantamax]}
      subtitle="Estreias no Pokémon GO! Dialga Dinamax no sábado, Palkia Dinamax no domingo e Duraludon Gigamax em Batalhas Max de 6 estrelas nos dois dias.">
      <div className="wa-split">
        <div><h3 className="wa-sub">Dinamax</h3>{grid(max.dynamax, { badge: "DINAMAX", strategy: "BATALHA MAX" })}</div>
        <div><h3 className="wa-sub">Gigamax · 6 estrelas</h3>{grid(max.gigantamax, { badge: "GIGAMAX", strategy: "BATALHA MAX GIGAMAX" })}</div>
      </div>
    </Section>

    {/* INCRÍVEIS */}
    <Section id="incriveis" icon="🌟" title={`Pokémon incríveis · ${dayInfo.weekday}`} accent="#b8860b" captured={checks} keys={incredible}
      subtitle="Extremamente raros na natureza e diferentes a cada dia. Use a Bola Safári GO para aumentar muito a chance de captura.">
      <ul className="wa-traits">
        <li>💪 Mais chance de IV alto em Ataque, Defesa e PS</li>
        <li>📏 Mais chance de serem XL ou XXL</li>
        <li>🎯 Mais difíceis de capturar</li>
      </ul>
      {grid(incredible, { badge: "INCRÍVEL", strategy: "POKÉMON INCRÍVEL" })}
    </Section>

    {/* INCENSO */}
    <Section id="incenso" icon="🔥" title="Encontros de Incenso" accent="#e2702b" captured={checks} keys={[...INCENSE_ALL, ...INCENSE_TICKET, ...INCENSE_TICKET_INCREDIBLE]}
      subtitle="Atraídos por Incenso nos dois dias do evento (exceto o Incenso de Aventura Diário).">
      <h3 className="wa-sub">Para todos · Pokémon incríveis</h3>
      {grid(INCENSE_ALL, { badge: "INCRÍVEL", dense: true })}
      <div className="wa-ticket-box">
        <span className="wa-ticket-tag">🎟️ SÓ COM INGRESSO</span>
        <h3 className="wa-sub">Latias e Latios incríveis — fogem rápido!</h3>
        {grid(INCENSE_TICKET_INCREDIBLE, { badge: "INCRÍVEL", strategy: "POKÉMON INCRÍVEL" })}
        <h3 className="wa-sub">Unown D · I · L · W</h3>
        {grid(INCENSE_TICKET, { dense: true })}
      </div>
    </Section>

    {/* OVOS */}
    <Section id="ovos" icon="🥚" title="Ovos de 10 km" accent="#3f7fbf" captured={checks} keys={EGGS_10KM}
      subtitle="Chocados durante o evento. Com ingresso, há mais chance de ganhar Ovos de 10 km girando fotodiscos.">
      {grid(EGGS_10KM)}
    </Section>

    {/* ATAQUES */}
    <Section id="ataques" icon="💥" title="Ataques em destaque" accent="#6d4bc4" captured={checks}
      subtitle="Pokémon encontrados ou evoluídos durante o evento conhecerão estes ataques.">
      <div className="wa-moves">
        {FEATURED_MOVES.map(([key, move]) => { const pokemon = WILD_AREA_POKEMON[key]; return <div key={key} className="wa-move">
          <span className="wa-move-art"><Image src={artworkUrl(pokemon)} alt="" fill sizes="56px" unoptimized /></span>
          <span><small>{pokemon.name}{pokemon.tag ? ` · ${pokemon.tag}` : ""}</small><b>{move}</b></span>
        </div>; })}
      </div>
    </Section>

    {/* BÔNUS */}
    <Section id="bonus" icon="🎁" title="Bônus do evento" accent="#2a75bb" captured={checks}
      subtitle="Ativos das 10h às 18h (horário local) nos dias do evento, salvo indicação.">
      <div className="wa-bonus-cols">
        <div className="wa-bonus-col">
          <h3><span>GRÁTIS</span> Para todo mundo</h3>
          <ul>{FREE_BONUSES.map(b => <li key={b.title}><span aria-hidden="true">{b.icon}</span><div><b>{b.title}</b><p>{b.text}</p></div></li>)}</ul>
        </div>
        <div className="wa-bonus-col is-ticket">
          <h3><span>🎟️ INGRESSO · {WILD_AREA_EVENT.ticketPrice}</span> Titulares de ingresso</h3>
          <ul>{TICKET_BONUSES.map(b => <li key={b.title}><span aria-hidden="true">{b.icon}</span><div><b>{b.title}</b><p>{b.text}</p></div></li>)}</ul>
        </div>
      </div>
      <div className="wa-research">
        <div className="wa-research-paths" aria-hidden="true"><span className="is-steel">⚙️</span><span className="is-dragon">🐉</span></div>
        <div>
          <span className="wa-eyebrow">PESQUISA ESPECIAL · COM INGRESSO</span>
          <h3>Escolha seu caminho: Aço ou Dragão</h3>
          <p>Disponível a partir de 14 de novembro de 2026. Torne-se especialista em um dos tipos para ganhar uma de duas medalhas no jogo — e, ao concluir a história, encontre Duraludon Gigamax com Fundo Especial.</p>
        </div>
      </div>
    </Section>

    {/* DICAS */}
    <Section id="dicas" icon="💡" title="Antes de sair para jogar" accent="#428772" captured={checks}>
      <div className="wa-tips">
        {TIPS.map(tip => <article key={tip.title}><span aria-hidden="true">{tip.icon}</span><h3>{tip.title}</h3><p>{tip.text}</p></article>)}
      </div>
    </Section>

    <footer className="wa-footer">
      <p>Informações da página oficial do evento. Checklist salvo neste aparelho.</p>
      <div>
        <a href={WILD_AREA_EVENT.sourceUrl} target="_blank" rel="noopener noreferrer" className="club-button light">Página oficial ↗</a>
        {confirmReset
          ? <><button type="button" className="club-button red" onClick={() => { reset(); setConfirmReset(false); }}>Sim, limpar tudo</button><button type="button" className="club-button light" onClick={() => setConfirmReset(false)}>Cancelar</button></>
          : <button type="button" className="club-button light" onClick={() => setConfirmReset(true)} disabled={!totalCaptured}>Limpar checklist</button>}
      </div>
    </footer>

  </main>
  {/* Fora do <main>: a animação de entrada da página cria um novo contexto para elementos fixos. */}
  <RaidDetailModal pokemon={strategy?.pokemon ?? null} kicker={strategy?.kicker} onClose={() => setStrategy(null)} />
  </>;
}
