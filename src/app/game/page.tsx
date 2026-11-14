"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { fetchPokemonDetails, fetchPokemonOption } from "@/queries/pokeApi";
import PokemonDisplay from "@/components/game/PokemonDisplay";
import AudioChallengeDisplay from "@/components/game/AudioChallengeDisplay";
import OptionButton from "@/components/game/OptionButton";
import PokemonInfoCard from "@/components/game/PokemonInfoCard";
import GameCompletionScreen from "@/components/game/GameCompletionScreen";
import TypeQuizGame from "@/components/game/TypeQuizGame";
import ArenaShell, { ArenaNotice } from "@/components/game/ArenaShell";
import GameGlyph from "@/components/game/GameGlyph";
import Image from "next/image";

export default function GamePage() {
  const { status, gameMode, currentCorrectId, currentTypeQuestion } = useGameStore();
  const typeQuestionKey = currentTypeQuestion?.key;
  useEffect(() => {
    // Each new round starts at its heading, including after replaying a match.
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector<HTMLElement>(".arena-page h1")?.focus({ preventScroll: true });
  }, [status, currentCorrectId, typeQuestionKey]);
  if (status === "IDLE") return <ArenaNotice title="Sua arena está esperando."><p>Escolha um desafio ou continue sua partida salva para começar.</p></ArenaNotice>;
  if (status === "FINISHED") return <GameCompletionScreen />;
  if (gameMode === "TYPE_STANDARD" || gameMode === "TYPE_HARD") return <TypeQuizGame key={currentTypeQuestion?.key} />;
  // A new question gets fresh input and comparison state; learning phases keep the same Pokémon.
  return <PokemonRound key={currentCorrectId} />;
}

function PokemonRound() {
  const { gameMode, answerMode, mediaStyle, currentCorrectId, currentOptionIds, selectedOptionId, isSilhouetteMode, toggleSilhouetteMode, answerQuestion, answerByTyping, nextQuestion, isMultiplayer, learningPhase } = useGameStore();
  const [showComparison, setShowComparison] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const { data: pokemon, isPending, isError, refetch } = useQuery({ queryKey: ["pokemon", currentCorrectId], queryFn: () => fetchPokemonDetails(currentCorrectId!), enabled: currentCorrectId !== null });
  const optionsQueries = useQueries({ queries: currentOptionIds.map(id => ({ queryKey: ["pokemon-option", id], queryFn: () => fetchPokemonOption(id), enabled: answerMode === "OPTIONS" })) });
  const marked = useLearningStore(state => currentCorrectId ? state.stats[currentCorrectId]?.isMarkedDifficult : false);
  const toggleDifficulty = useLearningStore(state => state.toggleDifficultyMark);
  const learningReveal = gameMode === "ADVANCED" && learningPhase === 1;
  const revealed = selectedOptionId !== null || learningReveal;
  const correct = learningReveal || selectedOptionId === currentCorrectId || (answerMode === "TYPING" && selectedOptionId !== null && selectedOptionId > 0);
  const optionsReady = optionsQueries.length > 0 && optionsQueries.every(query => Boolean(query.data));
  const optionsError = answerMode === "OPTIONS" && optionsQueries.some(query => query.isError);

  function choose(id: number) {
    if (revealed) return;
    answerQuestion(id); setShowComparison(id !== currentCorrectId);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (revealed || !typedInput.trim() || !pokemon) return;
    answerByTyping(typedInput, pokemon.name);
    setShowComparison(useGameStore.getState().selectedOptionId === -1);
  }
  function next() { setShowComparison(false); setTypedInput(""); nextQuestion(); }

  if (isError || optionsError) return <ArenaNotice title="O desafio não carregou." onRetry={() => { void refetch(); optionsQueries.forEach(query => { if (query.isError) void query.refetch(); }); }}><p>Confira sua conexão e tente novamente.</p></ArenaNotice>;
  const title = learningReveal ? "Conheça seu próximo Pokémon." : revealed ? correct ? "Mais um passo na evolução." : "Cada tentativa ensina." : mediaStyle === "AUDIO" ? "De quem é esse som?" : "Quem é esse Pokémon?";
  const subtitle = learningReveal ? "Observe a ficha e memorize o nome. Depois, teste sua memória." : revealed ? "Explore a ficha antes de continuar o desafio." : gameMode === "ADVANCED" ? learningPhase === 3 ? "Última etapa: digite o nome sem ver as alternativas." : "Você acabou de conhecê-lo. Agora escolha o nome certo." : answerMode === "TYPING" ? "Confie na sua memória e digite o nome." : "Observe com atenção e escolha a resposta certa.";

  return <ArenaShell title={title} subtitle={subtitle} tools={<>
    {!isMultiplayer && currentCorrectId !== null && <button aria-pressed={Boolean(marked)} onClick={() => void toggleDifficulty(currentCorrectId)} className={marked ? "is-selected" : ""}><GameGlyph name="flag" />{marked ? "Marcado como difícil" : "Marcar dificuldade"}</button>}
    {mediaStyle !== "AUDIO" && gameMode !== "ADVANCED" && <button onClick={toggleSilhouetteMode} aria-pressed={isSilhouetteMode}><GameGlyph name="target" />{isSilhouetteMode ? "Silhueta ativada" : "Ativar silhueta"}</button>}
  </>}>
    {gameMode === "ADVANCED" && <ol className="arena-learning-track" aria-label="Etapas do aprendizado">{["Memorize", "Reconheça", "Digite"].map((step, index) => <li key={step} className={learningPhase === index + 1 ? "is-current" : learningPhase > index + 1 ? "is-done" : ""} aria-current={learningPhase === index + 1 ? "step" : undefined}><b>{learningPhase > index + 1 ? <GameGlyph name="check" /> : index + 1}</b>{step}</li>)}</ol>}
    <div className={`arena-board ${revealed ? correct ? "is-correct" : "is-wrong" : ""}`}>
      <section className="arena-stage" aria-label="Pokémon do desafio">
        <div className="arena-stage-meta"><span><i />{mediaStyle === "AUDIO" ? "IDENTIFICAÇÃO POR SOM" : isSilhouetteMode && !revealed ? "IDENTIFICAÇÃO POR SILHUETA" : "IDENTIFICAÇÃO VISUAL"}</span><span>POKÉCLUB / 02</span></div>
        <div className="arena-orbit" aria-hidden="true"><i /><i /><i /><span className="arena-orbit-dot" /></div>
        <span className="arena-stage-watermark" aria-hidden="true">{revealed && pokemon ? String(pokemon.id).padStart(3, "0") : "?"}</span>
        {isPending || !pokemon ? <div className="arena-stage-loading" role="status"><span className="game-ball is-spinning" /><span>Buscando Pokémon…</span></div> : mediaStyle === "AUDIO" ? <AudioChallengeDisplay key={pokemon.id} id={pokemon.id} name={pokemon.name} isRevealed={revealed} imageUrl={pokemon.artworkUrl} /> : <PokemonDisplay key={pokemon.id} id={pokemon.id} imageUrl={pokemon.artworkUrl} name={pokemon.name} isRevealed={revealed} isSilhouetteMode={isSilhouetteMode} />}
        <div className="arena-stage-caption">{revealed && pokemon ? <><span className="arena-reveal-label">{learningReveal ? "ARQUIVO DA POKÉDEX" : correct ? "POKÉMON IDENTIFICADO" : "RESPOSTA REVELADA"}</span><strong>{pokemon.name}</strong></> : <><span className="arena-reveal-label">{mediaStyle === "AUDIO" ? "OUÇA. LEMBRE. RESPONDA." : "UM NOVO DESAFIO A CADA ENCONTRO"}</span><span className="arena-scan-bars" aria-hidden="true"><i /><i /><i /><i /><i /></span></>}</div>
        <span className="arena-stage-corner" aria-hidden="true" />
      </section>
      <section className="arena-response" aria-label="Sua resposta" aria-busy={isPending || (!revealed && answerMode === "OPTIONS" && !optionsReady)}>
        {!pokemon ? <div className="arena-response-loading" role="status"><p className="game-eyebrow">PREPARANDO SEU DESAFIO</p><h2>Sua próxima descoberta está chegando.</h2><div className="arena-option-skeleton" /><div className="arena-option-skeleton" /></div> : !revealed ? <>
          <div className="arena-console-heading"><span className="arena-console-icon"><GameGlyph name={answerMode === "TYPING" ? "keyboard" : "target"} /></span><span className="game-eyebrow">SUA VEZ, TREINADOR</span></div><h2>{answerMode === "TYPING" ? "Qual é o nome?" : "Faça sua escolha."}</h2><p className="arena-console-description">{answerMode === "TYPING" ? "Digite o nome do Pokémon e confirme sua resposta." : "Uma destas alternativas é o Pokémon que você procura."}</p>
          {answerMode === "OPTIONS" ? <div className="arena-options">{optionsReady ? optionsQueries.map((query, index) => { const option = query.data!; return <OptionButton key={option.id} index={index} name={option.name} isSelected={false} isCorrect={option.id === pokemon.id} isRevealed={false} disabled={false} onClick={() => choose(option.id)} />; }) : <><p className="arena-loading-label" role="status">Carregando alternativas…</p>{[0,1,2,3].map(index => <div className="arena-option-skeleton" key={index} />)}</>}</div> : <form className="arena-answer-form" onSubmit={submit}><label htmlFor="pokemon-answer">Nome do Pokémon</label><input id="pokemon-answer" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Sua resposta aqui…" value={typedInput} onChange={event => setTypedInput(event.target.value)} /><button type="submit" className="arena-primary" disabled={!typedInput.trim()}>Confirmar resposta <GameGlyph name="arrow" /></button><small>Pressione Enter para responder.</small></form>}
          <div className="arena-console-tip"><GameGlyph name="bolt" /><p>{gameMode === "ADVANCED" ? "A cada etapa, sua memória fica mais forte." : "Acerte em sequência para aumentar seu combo."}</p></div>
        </> : !correct && showComparison ? <div className="arena-comparison"><div className="arena-feedback is-wrong" role="status"><span>!</span><div><strong>Ainda não foi dessa vez.</strong><small>{gameMode === "ADVANCED" ? "Esse Pokémon voltará para você treinar." : "Observe os detalhes e aprenda com a tentativa."}</small></div></div><h2>Compare os Pokémon.</h2><div className="arena-compare-grid"><div><small>SUA RESPOSTA</small>{selectedOptionId && selectedOptionId > 0 ? <><div className="arena-compare-art"><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedOptionId}.png`} alt="" fill sizes="140px" unoptimized /></div><strong>{optionsQueries.find(query => query.data?.id === selectedOptionId)?.data?.name || "Pokémon escolhido"}</strong></> : <div className="arena-typed-guess">{typedInput || "Resposta incorreta"}</div>}</div><div><small>RESPOSTA CERTA</small><div className="arena-compare-art"><Image src={pokemon.artworkUrl} alt="" fill sizes="140px" unoptimized /></div><strong>{pokemon.name}</strong></div></div><button className="arena-primary" onClick={() => setShowComparison(false)}>Conhecer esse Pokémon <GameGlyph name="arrow" /></button></div> : <PokemonInfoCard key={`${pokemon.id}-${learningPhase}`} details={pokemon} onNext={next} isCorrect={correct} learning={learningReveal} nextLabel={gameMode === "ADVANCED" && learningPhase === 1 ? "Testar minha memória" : gameMode === "ADVANCED" && learningPhase === 2 && correct ? "Agora, digitar o nome" : "Próximo Pokémon"} />}
      </section>
    </div>
  </ArenaShell>;
}
