"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useGameStore } from "@/store/useGameStore";
import GameGlyph from "./GameGlyph";
import "./arena.css";

export default function ArenaShell({ children, tools, title, subtitle }: { children: ReactNode; tools?: ReactNode; title: string; subtitle: string }) {
  const { gameMode, score, totalAnswered, streak, totalInRegion, remainingIds, remainingTypeQuestions, isMultiplayer, players, currentPlayerIndex, isPersistent } = useGameStore();
  const typeQuiz = gameMode === "TYPE_STANDARD" || gameMode === "TYPE_HARD";
  const remaining = typeQuiz ? remainingTypeQuestions.length : remainingIds.length;
  const round = Math.min(totalInRegion, Math.max(1, totalInRegion - remaining));
  const progress = totalInRegion > 0 ? Math.min(100, (round / totalInRegion) * 100) : 0;
  const mode = isMultiplayer ? "Versus" : ({ NORMAL: "Clássico", ADVANCED: "Aprender", TYPE_STANDARD: "Tipos · Rápido", TYPE_HARD: "Tipos · Mestre" })[gameMode];
  const player = players[currentPlayerIndex];

  return <main className="arena-page">
    <div className="arena-wrap">
      <header className="arena-header">
        <Link href="/play" className="arena-brand" aria-label="PokéClub, voltar ao lobby"><span className="game-ball" aria-hidden="true" /><span>Poké<span>Club</span><small>GAME ARENA</small></span></Link>
        <div className="arena-scoreboard" aria-label="Placar da partida">
          <div><small>ACERTOS</small><strong key={`score-${score}`}>{score}<span> / {totalAnswered}</span></strong></div>
          <div className={streak > 0 ? "arena-streak is-active" : "arena-streak"}><small>SEQUÊNCIA</small><strong><GameGlyph name="bolt" />{streak}</strong></div>
        </div>
        <Link href="/play" className="arena-exit" aria-label="Sair da arena"><GameGlyph name="exit" /><span>Sair da arena</span></Link>
      </header>
      <div className="arena-round-bar">
        <span className="arena-mode"><i />{mode}</span>
        <div className="arena-progress-group"><span>Desafio <b>{round}</b> de {totalInRegion}</span><div className="arena-progress" role="progressbar" aria-label="Progresso da partida" aria-valuemin={0} aria-valuemax={totalInRegion || 1} aria-valuenow={round}><i style={{ width: `${progress}%` }} /></div></div>
        <span className="arena-save-note">{isPersistent ? "Partida salva" : "Partida rápida"}</span>
      </div>
      {isMultiplayer && player && <div className="arena-players" aria-label="Placar dos treinadores">{players.map((item, index) => <div key={item.id} className={index === currentPlayerIndex ? "is-current" : ""}><span className="arena-player-avatar">{String(index + 1).padStart(2, "0")}</span><span>{item.name}<small>{index === currentPlayerIndex ? "Sua vez de jogar" : `${item.score} acertos`}</small></span><b>{item.score}</b></div>)}</div>}
      <div className="arena-heading"><div><p className="game-eyebrow">{isMultiplayer && player ? `VEZ DE ${player.name.toUpperCase()}` : "TREINE. DESCUBRA. EVOLUA."}</p><h1 tabIndex={-1}>{title}</h1><p>{subtitle}</p></div>{tools && <div className="arena-tools">{tools}</div>}</div>
      {children}
      <footer className="arena-bottom"><span><span className="game-ball" aria-hidden="true" /> Conhecimento é seu melhor ataque.</span><Link href="/play">Configurar outro desafio <GameGlyph name="arrow" /></Link></footer>
    </div>
  </main>;
}

export function ArenaNotice({ title, children, onRetry }: { title: string; children: ReactNode; onRetry?: () => void }) {
  return <main className="arena-page arena-notice"><span className="game-ball" aria-hidden="true" /><p className="game-eyebrow">POKÉCLUB · GAME ARENA</p><h1>{title}</h1><div>{children}</div>{onRetry && <button className="arena-primary" onClick={onRetry}>Tentar novamente <GameGlyph name="arrow" /></button>}<Link className="arena-text-link" href="/play">Voltar para Jogar</Link></main>;
}
