"use client";

import { type FormEvent, useEffect, useState } from "react";
import { POKEMON_TYPES } from "@/lib/typeEffectiveness";
import { useGameStore } from "@/store/useGameStore";
import ArenaShell, { ArenaNotice } from "./ArenaShell";
import GameGlyph from "./GameGlyph";
import OptionButton from "./OptionButton";
import TypeBadge, { typeStyle } from "@/components/ui/TypeBadge";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
export default function TypeQuizGame() {
  const { gameMode, currentTypeQuestion: question, typeFoundAnswers: found, typeQuestionAnswered: answered, typeStandardOptions: options, streak, completeTypeQuestion, nextTypeQuestion, setTypeFoundAnswers } = useGameStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "correct" | "wrong" | "duplicate"; text: string } | null>(null);
  const hard = gameMode === "TYPE_HARD";
  useEffect(() => {
    if (!hard || !answered) return;
    const timer = window.setTimeout(nextTypeQuestion, 1000);
    return () => window.clearTimeout(timer);
  }, [hard, answered, nextTypeQuestion]);
  if (!question) return <ArenaNotice title="Seu próximo desafio está no lobby."><p>Escolha um modo e teste seu conhecimento dos tipos.</p></ArenaNotice>;
  const total = question.effectiveTypes.length;
  const displayedFeedback = feedback ?? (!hard && answered ? { kind: streak > 0 ? "correct" : "wrong", text: streak > 0 ? "Supereficaz! Você escolheu o ataque certo." : "Resposta registrada. Veja os tipos supereficazes antes de avançar." } : null);
  function choose(option: string) {
    if (answered || !question) return;
    const correct = question.effectiveTypes.includes(option);
    setSelected(option); setFeedback({ kind: correct ? "correct" : "wrong", text: correct ? "Supereficaz! Você escolheu o ataque certo." : `${option} não é supereficaz contra essa combinação.` }); completeTypeQuestion(correct);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (answered || !question) return;
    const answer = Object.keys(POKEMON_TYPES).find(type => normalize(type) === normalize(input));
    if (!answer) { setFeedback({ kind: "wrong", text: "Digite um tipo Pokémon válido." }); return; }
    if (found.includes(answer)) { setFeedback({ kind: "duplicate", text: `${answer} já foi encontrado. Tente outro tipo.` }); setInput(""); return; }
    if (!question.effectiveTypes.includes(answer)) { setFeedback({ kind: "wrong", text: `${answer} não é supereficaz contra esta combinação.` }); setInput(""); return; }
    const next = [...found, answer]; setTypeFoundAnswers(next); setInput("");
    if (next.length === total) { setFeedback({ kind: "correct", text: "Perfeito! Todas as fraquezas encontradas. Próximo desafio…" }); completeTypeQuestion(true); }
    else setFeedback({ kind: "correct", text: `${answer} é supereficaz! Continue procurando.` });
  }
  return <ArenaShell title="O ataque certo muda tudo." subtitle={hard ? "Encontre todos os tipos supereficazes contra a combinação." : "Qual tipo de ataque é supereficaz contra esse adversário?"}>
    <div className={`arena-board arena-type-board ${answered ? streak > 0 ? "is-correct" : "is-wrong" : ""}`}>
      <section className="arena-stage" aria-label="Tipos do adversário"><div className="arena-stage-meta"><span><i />ANÁLISE DE TIPAGEM</span><span>ESTRATÉGIA / ×2</span></div><div className="arena-orbit" aria-hidden="true"><i /><i /><i /></div><span className="arena-stage-watermark" aria-hidden="true">VS</span><div className="arena-defense-types"><p className="game-eyebrow">SEU ADVERSÁRIO</p><div>{question.defendingTypes.map(type => <div className="arena-defense-type" style={typeStyle(type)} key={type}><span aria-hidden="true">{POKEMON_TYPES[type]?.icon || "◉"}</span><strong>{type}</strong><small>TIPO DEFENSIVO</small></div>)}</div><span className="arena-defense-caption">{question.defendingTypes.length > 1 ? "Os dois tipos influenciam a defesa." : "Um tipo. Qual é a fraqueza?"}</span></div><div className="arena-stage-caption"><span className="arena-reveal-label">CONHEÇA OS TIPOS. DOMINE A BATALHA.</span><span className="arena-scan-bars" aria-hidden="true"><i /><i /><i /><i /><i /></span></div><span className="arena-stage-corner" aria-hidden="true" /></section>
      <section className="arena-response" aria-label="Seu ataque"><div className="arena-console-heading"><span className="arena-console-icon"><GameGlyph name={hard ? "crown" : "bolt"} /></span><span className="game-eyebrow">{hard ? "DESAFIO MESTRE" : "ESCOLHA SEU ATAQUE"}</span></div><h2>{hard ? "Revele cada fraqueza." : "Qual é seu próximo golpe?"}</h2><p className="arena-console-description">{hard ? `Existem ${total} tipos de ataque supereficazes. Encontre todos para avançar.` : "Uma escolha supereficaz é o suficiente para pontuar."}</p>
        {hard ? <><div className="arena-found-progress"><span>FRAQUEZAS ENCONTRADAS</span><strong>{found.length}<small> / {total}</small></strong><div><i style={{ width: `${found.length / total * 100}%` }} /></div></div><div className="arena-found-types">{found.length ? found.map(type => <TypeBadge key={type} type={type} />) : <span>Seus acertos aparecem aqui.</span>}</div><form className="arena-answer-form" onSubmit={submit}><label htmlFor="type-answer">Tipo do ataque</label><input id="type-answer" value={input} onChange={event => setInput(event.target.value)} autoComplete="off" spellCheck={false} placeholder="Ex.: Fogo, Água, Planta…" disabled={answered} /><button className="arena-primary" disabled={!input.trim() || answered}>Enviar ataque <GameGlyph name="arrow" /></button></form></> : <div className="arena-options">{options.map((option, index) => <OptionButton key={option} index={index} name={`${POKEMON_TYPES[option]?.icon || ""} ${option}`} isSelected={selected === option} isCorrect={question.effectiveTypes.includes(option)} isRevealed={answered} disabled={answered} onClick={() => choose(option)} />)}</div>}
        {displayedFeedback && <div className={`arena-quiz-feedback ${displayedFeedback.kind}`} role="status"><GameGlyph name={displayedFeedback.kind === "correct" ? "check" : "flag"} /><p>{displayedFeedback.text}</p></div>}
        {!hard && answered && <><div className="arena-effective-list"><small>ATAQUES SUPEREFICAZES</small><div>{question.effectiveTypes.map(type => <TypeBadge key={type} type={type} />)}</div></div><button className="arena-primary" onClick={nextTypeQuestion}>Próximo desafio <GameGlyph name="arrow" /></button></>}
        {!answered && <div className="arena-console-tip"><GameGlyph name="learn" /><p>{hard ? "Os nomes dos tipos aceitam respostas sem acentos." : "Pense na combinação inteira, incluindo as resistências."}</p></div>}
      </section>
    </div>
  </ArenaShell>;
}
