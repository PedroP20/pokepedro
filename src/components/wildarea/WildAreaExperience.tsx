"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEventClock } from "@/components/events/useEventClock";
import { useWildAreaStore } from "@/store/useWildAreaStore";
import { TYPE_COLORS } from "@/components/ui/TypeBadge";
import { calculateDefenseMultipliers } from "@/lib/typeEffectiveness";
import {
  ALL_WILD_AREA_KEYS, artworkUrl, Boss, DAY_PLAN, dayKeys, DayKey, EGGS_10KM, FEATURED_MOVE_BY_KEY, FREE_BONUSES, INCENSE_ALL,
  INCENSE_TICKET, INCENSE_TICKET_INCREDIBLE, INCREDIBLE, SPECIAL_BACKGROUND, TICKET_BONUSES, WILD_AREA_EVENT, WILD_AREA_POKEMON, WILD_SPAWNS,
} from "@/lib/wildArea2026";

type Mode = "caught" | "shiny";
type SpawnHour = keyof typeof WILD_SPAWNS;
type Extra = "incense" | "eggs" | "ticket";
const NONE: Record<string, boolean> = {};

/* ───────────── Relógio do evento (horário local de quem joga) ───────────── */
const at = (day: number, hour: number) => new Date(WILD_AREA_EVENT.start.year, WILD_AREA_EVENT.start.month - 1, day, hour).getTime();
const WINDOWS = WILD_AREA_EVENT.days.map(d => ({ ...d, start: at(d.day, WILD_AREA_EVENT.hours.start), end: at(d.day, WILD_AREA_EVENT.hours.end) }));

function clock(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(s)}`;
}

type Status = { tone: "soon" | "live" | "pause" | "over"; text: string; time?: string; liveDay?: DayKey };
function statusAt(now: number | null): Status | null {
  if (now === null) return null;
  const [sat, sun] = WINDOWS;
  if (now < sat.start) return { tone: "soon", text: "Começa em", time: clock(sat.start - now) };
  const live = WINDOWS.find(w => now >= w.start && now < w.end);
  if (live) return { tone: "live", text: `Ao vivo · ${live.weekday} · termina em`, time: clock(live.end - now), liveDay: live.key };
  if (now < sun.start) return { tone: "pause", text: "Domingo começa em", time: clock(sun.start - now) };
  return { tone: "over", text: "Evento encerrado — até a próxima!" };
}

/* ───────────── Peças pequenas ───────────── */
const DAY_ACCENT: Record<DayKey, string> = { sat: "#8fb8ff", sun: "#f5a3d6" };
const tint = (type: string) => ({ "--t": TYPE_COLORS[type] }) as CSSProperties;

function Types({ types }: { types: string[] }) {
  return <span className="ws-types">{types.map(t => <span key={t} style={tint(t)}>{t}</span>)}</span>;
}

function Chapter({ n, title, lead, children, id }: { n: string; title: string; lead?: ReactNode; children: ReactNode; id: string }) {
  return <section id={id} className="ws-chapter">
    <header className="ws-chapter-head">
      <span className="ws-chapter-n">{n}</span>
      <div><h2>{title}</h2>{lead && <p>{lead}</p>}</div>
    </header>
    {children}
  </section>;
}

/* ───────────── Página ───────────── */
export default function WildAreaExperience() {
  const now = useEventClock();
  const status = statusAt(now);
  const store = useWildAreaStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // O checklist vive no localStorage: reidrata só no navegador para não divergir do HTML do servidor.
    const done = useWildAreaStore.persist.onFinishHydration(() => setHydrated(true));
    void useWildAreaStore.persist.rehydrate();
    return done;
  }, []);
  const caught = hydrated ? store.captured : NONE;
  const shiny = hydrated ? store.shiny : NONE;

  const [picked, setPicked] = useState<DayKey | null>(null);
  const day: DayKey = picked ?? status?.liveDay ?? (status?.tone === "pause" || status?.tone === "over" ? "sun" : "sat");
  const plan = DAY_PLAN[day];
  const dayInfo = WILD_AREA_EVENT.days.find(d => d.key === day)!;

  const [mode, setMode] = useState<Mode>("caught");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [hour, setHour] = useState<SpawnHour>("steel");
  const [extra, setExtra] = useState<Extra>("incense");
  const [openBoss, setOpenBoss] = useState<string | null>(null);
  const pickDay = (d: DayKey) => { setPicked(d); setOpenBoss(null); };

  const tap = (key: string) => (mode === "shiny" ? store.toggleShiny(key) : store.toggleCaptured(key));
  const count = (keys: readonly string[]) => keys.filter(k => caught[k]).length;
  const total = count(ALL_WILD_AREA_KEYS);

  const chips = (keys: readonly string[], variant: "plain" | "rare" = "plain") => {
    const shown = onlyMissing ? keys.filter(k => !caught[k]) : keys;
    if (!shown.length) return <p className="ws-done">Tudo capturado aqui ✓</p>;
    return <div className={`ws-chips is-${variant}`}>
      {shown.map(key => {
        const p = WILD_AREA_POKEMON[key];
        const sub = (variant === "rare" ? FEATURED_MOVE_BY_KEY[key] : undefined) ?? p.tag;
        const on = mode === "shiny" ? !!shiny[key] : !!caught[key];
        return <button key={key} type="button" onClick={() => tap(key)} aria-pressed={on}
          className={`ws-chip ${caught[key] ? "is-caught" : ""} ${shiny[key] ? "is-shiny" : ""}`}
          aria-label={`${p.name}${p.tag ? ` (${p.tag})` : ""}: ${mode === "shiny" ? (on ? "desmarcar brilhante" : "marcar brilhante") : (on ? "desmarcar captura" : "marcar como capturado")}`}>
          <span className="ws-chip-orb">
            <Image src={artworkUrl(p, !!shiny[key])} alt="" fill sizes="88px" unoptimized />
            <span className="ws-chip-mark" aria-hidden="true">{shiny[key] ? "✦" : "✓"}</span>
          </span>
          <span className="ws-chip-name">{p.name}</span>
          {sub && <span className="ws-chip-sub">{sub}</span>}
        </button>;
      })}
    </div>;
  };

  const bossCard = (boss: Boss, index: number) => {
    const p = WILD_AREA_POKEMON[boss.key];
    const open = openBoss === boss.key;
    const weak = calculateDefenseMultipliers(p.types);
    return <article key={boss.key} className={`ws-boss ${index === 0 ? "is-hero" : ""} ${caught[boss.key] ? "is-caught" : ""}`}>
      <div className="ws-boss-art"><Image src={artworkUrl(p, !!shiny[boss.key])} alt="" fill sizes={index === 0 ? "340px" : "200px"} unoptimized /></div>
      <div className="ws-boss-body">
        <span className="ws-kicker">{boss.kind}</span>
        <h3>{p.name}{boss.key === "machamp-jacket" && <small> de jaqueta</small>}</h3>
        <p className="ws-boss-detail">{boss.detail}</p>
        <Types types={p.types} />
        {(boss.note || SPECIAL_BACKGROUND.includes(boss.key)) && <ul className="ws-boss-notes">
          {boss.note && <li>{boss.note}</li>}
          {SPECIAL_BACKGROUND.includes(boss.key) && <li>Pode vir com o Fundo Especial do evento</li>}
        </ul>}
        <div className="ws-boss-actions">
          <button type="button" className={`ws-pill ${caught[boss.key] ? "is-on" : ""}`} onClick={() => store.toggleCaptured(boss.key)} aria-pressed={!!caught[boss.key]}>{caught[boss.key] ? "✓ Capturado" : "Marcar captura"}</button>
          <button type="button" className={`ws-pill is-icon ${shiny[boss.key] ? "is-shiny" : ""}`} onClick={() => store.toggleShiny(boss.key)} aria-pressed={!!shiny[boss.key]} aria-label={`${shiny[boss.key] ? "Desmarcar" : "Marcar"} ${p.name} brilhante`} title="Brilhante">✦</button>
          <button type="button" className="ws-link" onClick={() => setOpenBoss(open ? null : boss.key)} aria-expanded={open}>{open ? "Fechar" : "Como vencer"} <span aria-hidden="true">{open ? "↑" : "→"}</span></button>
        </div>
        <AnimatePresence initial={false}>
          {open && <motion.div className="ws-counter" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .22 }}>
            <p>Leve ataques destes tipos:</p>
            <div>
              {weak.doubleWeakness.map(t => <span key={t} className="is-double" style={tint(t)}>{t} <b>2,56×</b></span>)}
              {weak.weakness.map(t => <span key={t} style={tint(t)}>{t} <b>1,6×</b></span>)}
            </div>
          </motion.div>}
        </AnimatePresence>
      </div>
    </article>;
  };

  return <main id="main-content" className="ws-page" style={{ "--acc": DAY_ACCENT[day] } as CSSProperties}>
    <div className="ws-sky" aria-hidden="true" />

    {/* ── Abertura ── */}
    <section className="ws-intro">
      <p className="ws-eyebrow">Área Selvagem GO · Global · 14 e 15 de novembro</p>
      <h1>Dois dias na<br /><em>natureza selvagem.</em></h1>
      <p className="ws-lead">Aço e Dragão dominam o fim de semana. Escolha o dia e veja, num só lugar, quem enfrentar, o que capturar e como aproveitar — das 10h às 18h no seu horário local.</p>
      <div className={`ws-status is-${status?.tone ?? "soon"}`} aria-live="polite">
        {status?.tone === "live" && <span className="ws-live" />}
        <span>{status ? status.text : "Sincronizando relógio…"}</span>
        {status?.time && <b>{status.time}</b>}
      </div>
    </section>

    {/* ── Escolha do dia ── */}
    <section className="ws-days" aria-label="Escolha o dia">
      {WILD_AREA_EVENT.days.map(d => {
        const keys = dayKeys(d.key), done = count(keys), active = d.key === day;
        const heroes = DAY_PLAN[d.key].bosses.slice(0, 3);
        return <button key={d.key} type="button" onClick={() => pickDay(d.key)} aria-pressed={active}
          className={`ws-day ${active ? "is-active" : ""}`} style={{ "--acc": DAY_ACCENT[d.key] } as CSSProperties}>
          <span className="ws-day-top">
            <span className="ws-day-date"><b>{d.day}</b><small>NOV</small></span>
            {status?.liveDay === d.key ? <span className="ws-day-tag"><span className="ws-live" />Ao vivo</span> : active && <span className="ws-day-tag">Selecionado</span>}
          </span>
          <span className="ws-day-name">{d.weekday}</span>
          <span className="ws-day-mood">{DAY_PLAN[d.key].mood} · {DAY_PLAN[d.key].headline}</span>
          <span className="ws-day-art" aria-hidden="true">
            {heroes.map((b, i) => <span key={b.key} className={`a${i}`}><Image src={artworkUrl(WILD_AREA_POKEMON[b.key])} alt="" fill sizes="160px" unoptimized /></span>)}
          </span>
          <span className="ws-day-progress"><span style={{ width: `${(done / keys.length) * 100}%` }} /></span>
          <span className="ws-day-count">{done} de {keys.length} capturados</span>
        </button>;
      })}
    </section>

    {/* ── Barra fixa ── */}
    <div className="ws-bar">
      <div className="ws-seg" role="group" aria-label="Dia">
        {WILD_AREA_EVENT.days.map(d => <button key={d.key} type="button" className={d.key === day ? "is-on" : ""} aria-pressed={d.key === day} onClick={() => pickDay(d.key)}>{d.weekday.slice(0, 3)} {d.day}</button>)}
      </div>
      <nav className="ws-bar-nav" aria-label="Capítulos">
        <a href="#chefes">Chefes</a><a href="#natureza">Natureza</a><a href="#encontros">Encontros</a><a href="#aproveitar">Aproveitar</a>
      </nav>
      <div className="ws-bar-tools">
        <div className="ws-seg" role="group" aria-label="O que o toque marca">
          <button type="button" className={mode === "caught" ? "is-on" : ""} aria-pressed={mode === "caught"} onClick={() => setMode("caught")}>✓ Capturei</button>
          <button type="button" className={mode === "shiny" ? "is-on is-gold" : ""} aria-pressed={mode === "shiny"} onClick={() => setMode("shiny")}>✦ Brilhante</button>
        </div>
        <button type="button" className={`ws-toggle ${onlyMissing ? "is-on" : ""}`} aria-pressed={onlyMissing} onClick={() => setOnlyMissing(v => !v)}>Só faltam</button>
        <span className="ws-total" title="Capturados no evento todo"><b>{total}</b>/{ALL_WILD_AREA_KEYS.length}</span>
      </div>
    </div>

    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={day} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .28 }} className="ws-content">

        {/* 01 — Chefes */}
        <Chapter id="chefes" n="01" title={`Chefes de ${dayInfo.weekday.toLowerCase()}`}
          lead={<>Batalhas Max e Reides do dia. Toque em <b>Como vencer</b> para ver os tipos de ataque mais fortes contra cada um.</>}>
          <div className="ws-bosses">{plan.bosses.map(bossCard)}</div>
        </Chapter>

        {/* 02 — Natureza */}
        <Chapter id="natureza" n="02" title="Na natureza"
          lead={<>Toque em um Pokémon para marcar {mode === "shiny" ? <b>como brilhante ✦</b> : <b>como capturado ✓</b>}. Os horários se alternam: primeiro Aço, depois Dragão.</>}>
          <div className="ws-hours" role="tablist" aria-label="Horário rotativo">
            {(Object.keys(WILD_SPAWNS) as SpawnHour[]).map((h, i) => <button key={h} role="tab" type="button" aria-selected={hour === h} className={`ws-hour is-${h} ${hour === h ? "is-on" : ""}`} onClick={() => setHour(h)}>
              <span className="ws-hour-i" aria-hidden="true">{i + 1}</span>
              <span><b>{WILD_SPAWNS[h].title}</b><small>{i === 0 ? "Vem primeiro" : "Vem depois"} · {count(WILD_SPAWNS[h].keys)} de {WILD_SPAWNS[h].keys.length}</small></span>
            </button>)}
          </div>
          {chips(WILD_SPAWNS[hour].keys)}

          <div className="ws-rare">
            <div className="ws-rare-head">
              <span className="ws-kicker is-gold">Raros · só {dayInfo.weekday.toLowerCase()}</span>
              <h3>Pokémon incríveis</h3>
              <p>Mais chance de IV alto e de serem XL ou XXL — mas difíceis de capturar. Guarde as Bolas Safári GO para eles.</p>
            </div>
            {chips(INCREDIBLE[day], "rare")}
          </div>
        </Chapter>

        {/* 03 — Encontros */}
        <Chapter id="encontros" n="03" title="Outros encontros" lead="Iguais nos dois dias do evento.">
          <div className="ws-tabs" role="tablist" aria-label="Tipo de encontro">
            {([["incense", "Incenso", "Para todos"], ["eggs", "Ovos de 10 km", "Chocados no evento"], ["ticket", "Com ingresso", "Latias, Latios e Unown"]] as [Extra, string, string][]).map(([k, label, sub]) =>
              <button key={k} role="tab" type="button" aria-selected={extra === k} className={extra === k ? "is-on" : ""} onClick={() => setExtra(k)}><b>{label}</b><small>{sub}</small></button>)}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={extra} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>
              {extra === "incense" && <><p className="ws-note">Pokémon incríveis atraídos por Incenso (exceto o Incenso de Aventura Diário).</p>{chips(INCENSE_ALL, "rare")}</>}
              {extra === "eggs" && <><p className="ws-note">Quem tem ingresso ganha mais Ovos de 10 km girando fotodiscos.</p>{chips(EGGS_10KM)}</>}
              {extra === "ticket" && <><p className="ws-note">Latias e Latios incríveis aparecem com Incenso e fogem rápido. Os Unown formam a palavra <b>WILD</b>.</p>{chips(INCENSE_TICKET_INCREDIBLE, "rare")}<div className="ws-gap" />{chips(INCENSE_TICKET)}</>}
            </motion.div>
          </AnimatePresence>
        </Chapter>
      </motion.div>
    </AnimatePresence>

    {/* 04 — Aproveitar (igual nos dois dias) */}
    <div className="ws-content">
      <Chapter id="aproveitar" n="04" title="Como aproveitar" lead="O roteiro de cada dia e tudo o que muda no jogo.">
        <ol className="ws-timeline">
          <li><time>10h</time><div><b>Começa</b><p>Bolas Safári GO passam a funcionar. Gire fotodiscos para ganhá-las.</p></div></li>
          <li><time>1 → 2</time><div><b>Horários rotativos</b><p>Hora Sólido como Aço e, em seguida, Hora de Determinação de Dragão.</p></div></li>
          <li><time>A cada hora</time><div><b>Balão de Suprimentos</b><p>Com ingresso: um balão com Bolas Safári GO aparece de hora em hora.</p></div></li>
          <li><time>18h</time><div><b>Termina</b><p>As Bolas Safári GO somem do inventário. Use todas antes!</p></div></li>
        </ol>

        <div className="ws-perks">
          <div className="ws-perk">
            <h3>Para todo mundo <small>Grátis</small></h3>
            <ul>{FREE_BONUSES.map(b => <li key={b.title}><span aria-hidden="true">{b.icon}</span><div><b>{b.title}</b><p>{b.text}</p></div></li>)}</ul>
          </div>
          <div className="ws-perk is-ticket">
            <h3>Com ingresso <small>{WILD_AREA_EVENT.ticketPrice}</small></h3>
            <ul>{TICKET_BONUSES.map(b => <li key={b.title}><span aria-hidden="true">{b.icon}</span><div><b>{b.title}</b><p>{b.text}</p></div></li>)}</ul>
          </div>
        </div>

        <div className="ws-research">
          <span className="ws-kicker">Pesquisa especial · com ingresso</span>
          <h3>Escolha seu caminho: <em className="is-steel">Aço</em> ou <em className="is-dragon">Dragão</em></h3>
          <p>Vire especialista em um dos tipos e ganhe uma de duas medalhas. Ao concluir a história, encontre Duraludon Gigamax com Fundo Especial.</p>
        </div>

        <ul className="ws-facts">
          <li><b>Descobertas Diárias</b> ficam pausadas de 9 a 15 de novembro.</li>
          <li><b>Partículas Max:</b> colete todas no menu Proximidades para valer o bônus de exploração.</li>
          <li><b>Energia de Fusão</b> vem das Reides de Kyurem Preto e Kyurem Branco.</li>
        </ul>
      </Chapter>

      <footer className="ws-foot">
        <p>Dados da página oficial do evento · seu checklist fica salvo neste aparelho.</p>
        <div>
          <a href={WILD_AREA_EVENT.sourceUrl} target="_blank" rel="noopener noreferrer">Página oficial ↗</a>
          <ResetButton disabled={!total} onReset={store.reset} />
        </div>
      </footer>
    </div>
  </main>;
}

function ResetButton({ disabled, onReset }: { disabled: boolean; onReset: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return <button type="button" disabled={disabled} onClick={() => setConfirm(true)}>Limpar checklist</button>;
  return <span className="ws-confirm">Apagar tudo?
    <button type="button" className="is-danger" onClick={() => { onReset(); setConfirm(false); }}>Sim</button>
    <button type="button" onClick={() => setConfirm(false)}>Não</button>
  </span>;
}
