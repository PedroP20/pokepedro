"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useGameStore, type GameMode, type AnswerMode, type MediaStyle, type MultiplayerType } from "@/store/useGameStore";
import { useSavedGameStore } from "@/store/useSavedGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { type Region, type OrderType, REGION_RANGES } from "@/types/pokemon";
import { generateFilteredQueue } from "@/lib/pokemonFilters";
import { fetchTypeQuizQuestions } from "@/lib/typeQuiz";
import { POKEMON_TYPES } from "@/lib/typeEffectiveness";
import { typeStyle } from "@/components/ui/TypeBadge";
import GameGlyph, { type GameGlyphName } from "@/components/game/GameGlyph";
import "@/components/game/arena.css";

const regions: { id: Region; name: string; mascot: number }[] = [
  { id: "ALL", name: "Todas as regiões", mascot: 25 }, { id: "KANTO", name: "Kanto", mascot: 6 },
  { id: "JOHTO", name: "Johto", mascot: 249 }, { id: "HOENN", name: "Hoenn", mascot: 384 },
  { id: "SINNOH", name: "Sinnoh", mascot: 448 }, { id: "UNOVA", name: "Unova", mascot: 571 },
  { id: "KALOS", name: "Kalos", mascot: 658 }, { id: "ALOLA", name: "Alola", mascot: 778 },
  { id: "GALAR", name: "Galar", mascot: 815 }, { id: "HISUI", name: "Hisui", mascot: 905 },
  { id: "PALDEA", name: "Paldea", mascot: 908 },
];
type LobbyMode = GameMode | "VERSUS";
const modes: { id: LobbyMode; name: string; tag: string; description: string; icon: GameGlyphName; color: string }[] = [
  { id: "NORMAL", name: "Clássico", tag: "SEU PRÓXIMO RECORDE", description: "Reconheça Pokémon e construa sua sequência de acertos.", icon: "target", color: "blue" },
  { id: "ADVANCED", name: "Aprender", tag: "UM PASSO DE CADA VEZ", description: "Memorize, escolha e digite. Três etapas para evoluir.", icon: "learn", color: "green" },
  { id: "VERSUS", name: "Versus", tag: "DESAFIE SEUS AMIGOS", description: "Divida a tela. Dispute por turnos, sozinho ou em duplas.", icon: "versus", color: "red" },
  { id: "TYPE_STANDARD", name: "Tipos: Rápido", tag: "PENSE NO SEU ATAQUE", description: "Escolha um tipo supereficaz entre quatro alternativas.", icon: "bolt", color: "yellow" },
  { id: "TYPE_HARD", name: "Tipos: Mestre", tag: "DOMINE CADA FRAQUEZA", description: "Sem alternativas: descubra e digite todos os tipos eficazes.", icon: "crown", color: "purple" },
];

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className={`lobby-choice ${active ? "is-selected" : ""}`} aria-pressed={active} onClick={onClick}>{children}{active && <GameGlyph name="check" />}</button>;
}

export default function PlayPage() {
  const router = useRouter();
  const { user, isLoading, isSyncing } = useAuthStore();
  const { savedSession, clearSavedGame } = useSavedGameStore();
  const [mode, setMode] = useState<LobbyMode>("NORMAL");
  const [mediaStyle, setMediaStyle] = useState<MediaStyle>("IMAGE");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("OPTIONS");
  const [persistent, setPersistent] = useState(false);
  const [multiplayerType, setMultiplayerType] = useState<MultiplayerType>("FFA");
  const [playerCount, setPlayerCount] = useState(2);
  const [region, setRegion] = useState<Region>("ALL");
  const [order, setOrder] = useState<OrderType>("RANDOM");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const typeQuiz = mode === "TYPE_STANDARD" || mode === "TYPE_HARD";
  const selectedMode = modes.find(item => item.id === mode)!;
  const selectedRegion = regions.find(item => item.id === region)!;
  const [min, max] = REGION_RANGES[region];
  const filtered = selectedTypes.length > 0 || categories.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    if (!isLoading && !user) router.replace("/login");
    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  const toggle = (value: string, selected: string[], setSelected: (value: string[]) => void) => {
    setSelected(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
    setError("");
  };
  async function start() {
    if (starting || isSyncing) return;
    setStarting(true); setError("");
    try {
      const game = useGameStore.getState();
      if (typeQuiz) {
        const questions = await fetchTypeQuizQuestions();
        if (!questions.length) throw new Error("empty-quiz");
        game.startTypeQuiz(mode, questions, persistent);
      } else {
        let ids = await generateFilteredQueue({ region, selectedTypes, onlyLegendaries: categories.includes("Lendários"), onlyMythicals: categories.includes("Míticos"), onlyUltraBeasts: categories.includes("Ultra Beasts"), onlyParadox: categories.includes("Paradox") }, Array.from({ length: max - min + 1 }, (_, index) => min + index));
        if (categories.includes("Minhas dificuldades")) {
          const difficult = new Set(useLearningStore.getState().getMarkedDifficultPokemonIds());
          ids = ids.filter(id => difficult.has(id));
        }
        if (!ids.length) { setError("Nenhum Pokémon combina com esses filtros. Ajuste a região ou remova um filtro para começar."); return; }
        game.startGame(region, order, mediaStyle, mode === "VERSUS" ? "NORMAL" : mode, answerMode, persistent, mode === "VERSUS", multiplayerType, playerCount, ids);
      }
      router.push("/game");
    } catch { setError("Não foi possível preparar o desafio. Confira sua conexão e tente novamente."); }
    finally { setStarting(false); }
  }
  function resume() {
    if (!savedSession || isSyncing || starting) return;
    useGameStore.getState().resumeGame(savedSession); router.push("/game");
  }

  if (isLoading || !user) return <main className="lobby-loading"><span className="game-ball is-spinning" aria-hidden="true" /><p role="status">Preparando seu lobby…</p></main>;

  return <main className="play-lobby">
    <div className="lobby-wrap">
      <header className="lobby-hero">
        <div><p className="game-eyebrow"><span /> CENTRAL DE JOGOS · POKÉCLUB</p><h1>É hora de <em>evoluir.</em></h1><p>Seu conhecimento, suas regras. Monte um desafio e entre na arena.</p><div className="lobby-hero-links"><a href="#lobby-modes">Escolha seu desafio <GameGlyph name="arrow" /></a><Link href="/play/review"><GameGlyph name="learn" /> Revisar meu aprendizado</Link></div></div>
        <div className="lobby-hero-art" aria-hidden="true"><span className="lobby-play-word">PLAY</span><div className="lobby-hero-ball"><span className="game-ball" /></div><span className="lobby-hero-tag">TREINADOR, É A SUA VEZ!</span><i /><i /><i /></div>
      </header>
      {mounted && savedSession && <section className="lobby-resume" aria-label="Partida salva"><span className="lobby-resume-icon"><GameGlyph name="play" /></span><div><p>SUA JORNADA CONTINUA</p><h2>Tem um desafio esperando por você.</h2><span>{savedSession.score} acertos · {savedSession.mode.startsWith("TYPE") ? "Desafio de tipos" : savedSession.region === "ALL" ? "Todas as regiões" : savedSession.region}</span></div><div><button onClick={resume} disabled={isSyncing || starting}>Continuar partida <GameGlyph name="arrow" /></button><button className="lobby-discard" onClick={clearSavedGame} disabled={starting}>Descartar partida salva</button></div></section>}
      <div className="lobby-layout">
        <div className="lobby-config">
          <section className="lobby-section" id="lobby-modes">
            <div className="lobby-section-heading"><span>01</span><div><h2>Qual é o seu desafio?</h2><p>Escolha como você quer jogar hoje.</p></div><span className="lobby-step-tag">5 MODOS</span></div>
            <div className="lobby-modes" role="group" aria-label="Modo de jogo">{modes.map(item => <button key={item.id} onClick={() => { setMode(item.id); setError(""); }} aria-pressed={mode === item.id} className={`lobby-mode-card lobby-color-${item.color} ${mode === item.id ? "is-selected" : ""}`}><div className="lobby-mode-top"><span className="lobby-mode-icon"><GameGlyph name={item.icon} /></span><span className="lobby-selection-dot">{mode === item.id && <GameGlyph name="check" />}</span></div><small>{item.tag}</small><h3>{item.name}</h3><p>{item.description}</p></button>)}</div>
            {mode === "VERSUS" && <div className="lobby-versus-settings"><div className="lobby-setting"><h3>Formato da disputa</h3><div className="lobby-choice-row"><Choice active={multiplayerType === "FFA"} onClick={() => setMultiplayerType("FFA")}>Cada um por si</Choice><Choice active={multiplayerType === "TEAMS"} onClick={() => { setMultiplayerType("TEAMS"); setPlayerCount(Math.min(playerCount, 5)); }}>Duplas</Choice></div></div><label className="lobby-range">{multiplayerType === "FFA" ? "Treinadores" : "Duplas"}<b>{playerCount}</b><input type="range" min={2} max={multiplayerType === "FFA" ? 10 : 5} value={playerCount} onChange={event => setPlayerCount(Number(event.target.value))} /></label><p>Todos jogam por turnos no mesmo dispositivo.</p></div>}
          </section>
          {!typeQuiz ? <section className="lobby-section"><div className="lobby-section-heading"><span>02</span><div><h2>Escolha seu destino</h2><p>De Kanto a Paldea. Ou o mundo inteiro.</p></div></div><div className="lobby-regions" role="group" aria-label="Região dos Pokémon">{regions.map((item, index) => <button key={item.id} className={region === item.id ? "is-selected" : ""} aria-pressed={region === item.id} onClick={() => { setRegion(item.id); setError(""); }}><small>{index === 0 ? "MUNDO" : `${String(index).padStart(2, "0")} / REGIÃO`}</small><span>{item.name}</span>{region === item.id && <GameGlyph name="check" />}</button>)}</div></section> : <section className="lobby-type-explainer"><span><GameGlyph name={selectedMode.icon} /></span><div><h2>O ataque certo muda tudo.</h2><p>{mode === "TYPE_HARD" ? "Digite todos os tipos supereficazes contra a combinação apresentada. Cada acerto revela uma nova fraqueza." : "Observe os tipos do adversário e escolha uma das quatro alternativas de ataque. Uma resposta supereficaz já garante o acerto."}</p><small>Combinações de tipos de Pokémon reais. Sem filtros de região ou imagem.</small></div></section>}
          <section className="lobby-section"><div className="lobby-section-heading"><span>{typeQuiz ? "02" : "03"}</span><div><h2>Deixe do seu jeito</h2><p>Uma partida que combina com seu ritmo.</p></div></div><div className="lobby-preferences">
            {!typeQuiz && mode !== "ADVANCED" && <><div className="lobby-setting"><h3>Como reconhecer</h3><div className="lobby-choice-row">{([{ id: "IMAGE", label: "Imagem", icon: "image" }, { id: "SILHOUETTE", label: "Silhueta", icon: "target" }, { id: "AUDIO", label: "Som", icon: "sound" }] as const).map(item => <Choice key={item.id} active={mediaStyle === item.id} onClick={() => setMediaStyle(item.id)}><GameGlyph name={item.icon} />{item.label}</Choice>)}</div></div><div className="lobby-setting"><h3>Como responder</h3><div className="lobby-choice-row"><Choice active={answerMode === "OPTIONS"} onClick={() => setAnswerMode("OPTIONS")}>Alternativas</Choice><Choice active={answerMode === "TYPING"} onClick={() => setAnswerMode("TYPING")}><GameGlyph name="keyboard" />Digitação</Choice></div></div></>}
            {mode === "ADVANCED" && <div className="lobby-learn-steps"><span><b>1</b> Memorize</span><GameGlyph name="arrow" /><span><b>2</b> Escolha</span><GameGlyph name="arrow" /><span><b>3</b> Digite</span></div>}
            {!typeQuiz && <div className="lobby-setting"><h3>Ordem dos Pokémon</h3><div className="lobby-choice-row"><Choice active={order === "RANDOM"} onClick={() => setOrder("RANDOM")}>Aleatória</Choice><Choice active={order === "POKEDEX"} onClick={() => setOrder("POKEDEX")}>Ordem da Pokédex</Choice></div></div>}
            <div className="lobby-setting"><h3>Progresso da partida</h3><div className="lobby-choice-row"><Choice active={!persistent} onClick={() => setPersistent(false)}>Partida rápida</Choice><Choice active={persistent} onClick={() => setPersistent(true)}>Salvar e continuar depois</Choice></div><p>{persistent ? "Você pode sair e retomar de onde parou." : "Para jogar agora, sem salvar esta partida."}</p></div>
          </div></section>
          {!typeQuiz && <details className="lobby-filters"><summary><span><GameGlyph name="flag" /> Personalizar os Pokémon <small>{filtered ? `${selectedTypes.length + categories.length} filtros ativos` : "Filtros opcionais"}</small></span><span className="lobby-details-plus" aria-hidden="true">+</span></summary><div className="lobby-filters-body"><div className="lobby-filter-heading"><h3>Categorias especiais</h3>{filtered && <button onClick={() => { setSelectedTypes([]); setCategories([]); setError(""); }}>Limpar filtros</button>}</div><div className="lobby-choice-row">{["Lendários", "Míticos", "Ultra Beasts", "Paradox", "Minhas dificuldades"].map(item => <Choice key={item} active={categories.includes(item)} onClick={() => toggle(item, categories, setCategories)}>{item}</Choice>)}</div><h3>Tipos de Pokémon</h3><div className="lobby-type-filters">{Object.entries(POKEMON_TYPES).map(([name, info]) => <button key={name} style={typeStyle(name)} aria-pressed={selectedTypes.includes(name)} className={selectedTypes.includes(name) ? "is-selected" : ""} onClick={() => toggle(name, selectedTypes, setSelectedTypes)}><span aria-hidden="true">{info.icon}</span>{name}{selectedTypes.includes(name) && <GameGlyph name="check" />}</button>)}</div><p>Tipos selecionados aceitam qualquer um deles. Categorias e região precisam combinar entre si.</p></div></details>}
          <details className="lobby-guide"><summary>Primeira vez na arena? <span>Como jogar <GameGlyph name="arrow" /></span></summary><div><p><b>Clássico:</b> identifique o Pokémon pela imagem, silhueta ou som. Responda escolhendo uma alternativa ou digitando o nome.</p><p><b>Aprender:</b> conheça a ficha, reconheça o Pokémon e depois digite seu nome. Os erros voltam à fila para você treinar.</p><p><b>Versus:</b> cada treinador ou dupla responde na sua vez. Quem acumular mais acertos vence.</p><p><b>Tipos:</b> escolha um ataque supereficaz no Rápido ou encontre todas as fraquezas no Mestre.</p><p>Marque Pokémon difíceis durante o jogo para revisá-los depois. Em partidas salvas, seu progresso fica disponível no lobby.</p></div></details>
        </div>
        <aside className="lobby-ticket" id="lobby-ticket" aria-label="Resumo da partida">
          <div className="lobby-ticket-top"><span>SEU PRÓXIMO DESAFIO</span><span className="lobby-ticket-chip">{typeQuiz ? "TIPOS" : "POKÉMON"}</span></div>
          <div className="lobby-ticket-art"><div className="lobby-ticket-orbit" /><span className="lobby-ticket-number" aria-hidden="true">{typeQuiz ? "×2" : String(selectedRegion.mascot).padStart(3, "0")}</span><Image key={typeQuiz ? "types" : selectedRegion.mascot} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${typeQuiz ? 448 : selectedRegion.mascot}.png`} alt="" fill sizes="(max-width: 850px) 280px, 330px" className="lobby-mascot" priority unoptimized /></div>
          <div className="lobby-ticket-content"><p className="game-eyebrow">{typeQuiz ? "ESTRATÉGIA EM AÇÃO" : selectedRegion.name.toUpperCase()}</p><h2>{selectedMode.name}</h2><p>{selectedMode.description}</p><dl><div><dt>Desafio</dt><dd>{typeQuiz ? mode === "TYPE_HARD" ? "Todas as fraquezas" : "Ataque supereficaz" : mode === "ADVANCED" ? "3 etapas de aprendizado" : `${mediaStyle === "AUDIO" ? "Som" : mediaStyle === "SILHOUETTE" ? "Silhueta" : "Imagem"} + ${answerMode === "TYPING" ? "digitação" : "alternativas"}`}</dd></div>{!typeQuiz && <div><dt>{filtered ? "Seleção" : "Pokémon na região"}</dt><dd>{filtered ? "Filtros personalizados" : `${max - min + 1} Pokémon`}</dd></div>}{mode === "VERSUS" && <div><dt>Na disputa</dt><dd>{playerCount} {multiplayerType === "TEAMS" ? "duplas" : "treinadores"}</dd></div>}<div><dt>Progresso</dt><dd>{persistent ? "Salvo para continuar" : "Partida rápida"}</dd></div></dl>
          <button className={`lobby-launch ${starting ? "is-loading" : ""}`} disabled={starting || isSyncing} onClick={() => void start()}><span className="lobby-launch-icon"><GameGlyph name={starting ? "target" : "play"} /></span><span>{starting ? "Preparando arena…" : isSyncing ? "Sincronizando…" : "Iniciar partida"}<small>{starting ? "SEU DESAFIO ESTÁ CHEGANDO" : "VAMOS NESSA, TREINADOR"}</small></span><GameGlyph name="arrow" /></button>
          {isSyncing && <p className="lobby-launch-note" role="status">Carregando seu progresso salvo. Só um instante.</p>}{error && <p className="lobby-error" role="alert">{error}</p>}<p className="lobby-ticket-foot"><span />Tudo pronto para o próximo nível.</p></div>
        </aside>
      </div>
    </div>
    <div className="lobby-mobile-dock"><a href="#lobby-ticket"><small>SEU DESAFIO</small><strong>{selectedMode.name}</strong><span>Ver resumo</span></a><button disabled={starting || isSyncing} onClick={() => void start()}><GameGlyph name={starting ? "target" : "play"} />{starting ? "Preparando…" : isSyncing ? "Sincronizando…" : "Iniciar partida"}</button>{error && <p>{error}</p>}</div>
  </main>;
}
