"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import Link from "next/link";
import Image from "next/image";
import GameGlyph from "./GameGlyph";
import "./arena.css";

export default function GameCompletionScreen() {
  const { score, totalAnswered, totalInRegion, sessionStartTime, sessionEndTime, isMultiplayer, players, restartCurrentGame, gameMode } = useGameStore();
  const stats = useLearningStore(state => state.stats);
  const [fallbackEndTime] = useState(() => Date.now());
  const seconds = Math.floor(Math.max(0, (sessionEndTime || fallbackEndTime) - sessionStartTime) / 1000);
  const time = `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`;
  const mistakes = Math.max(0, totalAnswered - score);
  const accuracy = totalAnswered > 0 ? Math.min(100, Math.round(score / totalAnswered * 100)) : 0;
  const ranking = useMemo(() => isMultiplayer ? [...players].sort((a,b) => b.score - a.score) : [], [isMultiplayer, players]);
  const hardest = useMemo(() => Object.values(stats).filter(item => item.timesWrong > 0 || item.avgTimeMs > 5000).sort((a,b) => b.timesWrong - a.timesWrong || b.avgTimeMs - a.avgTimeMs)[0], [stats]);
  const typeQuiz = gameMode === "TYPE_STANDARD" || gameMode === "TYPE_HARD";
  return <main className="arena-page arena-completion"><div className="arena-results-wrap">
    <header className="arena-results-header"><Link className="arena-brand" href="/play"><span className="game-ball" aria-hidden="true" /><span>Poké<span>Club</span><small>GAME ARENA</small></span></Link><span>RELATÓRIO DA PARTIDA</span></header>
    <section className="arena-results-hero"><div className="arena-results-medal"><GameGlyph name="crown" /><i /><i /><i /></div><p className="game-eyebrow">{isMultiplayer ? "A DISPUTA CHEGOU AO FIM" : "MAIS UM DESAFIO NA SUA JORNADA"}</p><h1 tabIndex={-1}>{isMultiplayer ? "O pódio é de vocês." : "Você acaba de evoluir."}</h1><p>{isMultiplayer ? "Cada turno contou. Confira o resultado dos treinadores." : "Acertos para celebrar. Descobertas para levar à próxima partida."}</p></section>
    <div className="arena-results-layout"><section className="arena-accuracy-panel"><div className="arena-accuracy-ring" style={{ "--accuracy": `${accuracy}%` } as CSSProperties}><div><strong>{accuracy}<span>%</span></strong><small>PRECISÃO</small></div></div><h2>{accuracy === 100 ? "Uma partida perfeita." : accuracy >= 70 ? "Seu treino está dando resultado." : "Sua próxima vitória começa aqui."}</h2><p>{score} acertos em {totalAnswered} respostas.</p></section><section className="arena-result-metrics" aria-label="Estatísticas da partida">{[{ name: "ACERTOS", value: score, className: "is-green", icon: "check" }, { name: "ERROS", value: mistakes, className: "is-red", icon: "flag" }, { name: "DESAFIOS", value: totalInRegion, className: "is-blue", icon: "target" }, { name: "TEMPO DE JOGO", value: time, className: "is-yellow", icon: "bolt" }].map(item => <div className={item.className} key={item.name}><GameGlyph name={item.icon as "check" | "flag" | "target" | "bolt"} /><small>{item.name}</small><strong>{item.value}</strong></div>)}</section></div>
    {ranking.length > 0 && <section className="arena-results-ranking"><h2>Placar final</h2>{ranking.map((player,index) => <div key={player.id} className={index === 0 ? "is-winner" : ""}><span>{index === 0 ? <GameGlyph name="crown" /> : String(index + 1).padStart(2,"0")}</span><strong>{player.name}</strong><b>{player.score}<small> acertos</small></b></div>)}</section>}
    {!typeQuiz && hardest && <div className="arena-result-review"><div className="arena-result-review-image"><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${hardest.id}.png`} alt="" fill sizes="54px" unoptimized /></div><div><small>NO SEU HISTÓRICO DE APRENDIZADO</small><p>O Pokémon #{String(hardest.id).padStart(4,"0")} merece mais um treino.</p></div><Link href="/play/review">Revisar <GameGlyph name="arrow" /></Link></div>}
    <div className="arena-result-actions"><button className="arena-primary" onClick={restartCurrentGame}><GameGlyph name="play" />Jogar novamente<GameGlyph name="arrow" /></button><Link className="arena-secondary" href="/play">Escolher outro desafio <GameGlyph name="arrow" /></Link></div>{!typeQuiz && <Link className="arena-result-study" href="/play/review"><GameGlyph name="learn" />Revisar meu aprendizado</Link>}
    <p className="arena-results-foot">POKÉCLUB · NUNCA DEIXE DE SER TREINADOR.</p>
  </div></main>;
}
