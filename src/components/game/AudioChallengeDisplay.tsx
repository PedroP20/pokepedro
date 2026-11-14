// src/components/game/AudioChallengeDisplay.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PokemonDisplay from "./PokemonDisplay";
import GameGlyph from "./GameGlyph";

interface AudioChallengeDisplayProps {
  id: number;
  name: string;
  isRevealed: boolean;
  imageUrl?: string;
}

export default function AudioChallengeDisplay({ id, name, isRevealed, imageUrl }: AudioChallengeDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

  const playCry = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError(false);
    audio.currentTime = 0;
    void audio.play().catch((error: unknown) => {
      if (audioRef.current !== audio) return;
      setIsPlaying(false);
      if (error instanceof Error && (error.name === "NotAllowedError" || error.name === "AbortError")) return;
      setAudioError(true);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!isRevealed) {
      timer = setTimeout(() => {
        playCry();
      }, 0);
    }
    return () => {
      clearTimeout(timer);
      audio?.pause();
    };
  }, [audioUrl, isRevealed, playCry]);

  return <div className={`arena-audio ${isPlaying ? "is-playing" : ""}`}>
    <audio key={id} ref={audioRef} src={audioUrl} preload="auto" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onError={() => { setIsPlaying(false); setAudioError(true); }} />
    {isRevealed ? <PokemonDisplay id={id} imageUrl={imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`} name={name} isRevealed isSilhouetteMode={false} /> : <>
      <button type="button" onClick={playCry} aria-label="Ouvir som do Pokémon" className="arena-audio-trigger"><GameGlyph name="sound" /></button>
      <div className="arena-waveform" aria-hidden="true">{[24,40,28,58,80,45,65,90,56,32,62,40,22].map((height,index) => <i key={index} style={{ height: `${height}%`, animationDelay: `${index * .07}s` }} />)}</div>
      <button className="arena-replay" onClick={playCry} disabled={isPlaying}><GameGlyph name="sound" />{isPlaying ? "Ouvindo o Pokémon…" : "Ouvir som novamente"}</button>
    </>}
    {audioError && !isRevealed && <p role="status" className="arena-audio-error">O som não carregou. Toque no botão para tentar novamente.</p>}
  </div>;
}
