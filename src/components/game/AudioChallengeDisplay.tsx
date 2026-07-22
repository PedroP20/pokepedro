// src/components/game/AudioChallengeDisplay.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface AudioChallengeDisplayProps {
  id: number;
  name: string;
  isRevealed: boolean;
  imageUrl?: string;
}

export default function AudioChallengeDisplay({ id, name, isRevealed, imageUrl }: AudioChallengeDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

  const playCry = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => setIsPlaying(false);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => console.error("Erro ao reproduzir áudio"));
  }, [audioUrl]);

  // ⭐ CORREÇÃO IMAGEM 2: setTimeout(..., 0) evita o erro de "cascading render" no linter do React 19!
  useEffect(() => {
    if (!isRevealed) {
      const timer = setTimeout(() => {
        playCry();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [id, isRevealed, playCry]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1B4F9C]/10 to-[#2A75BB]/20 rounded-3xl border-2 border-[#1B4F9C]/30 shadow-inner w-full max-w-md mx-auto text-center space-y-4">
      
      {!isRevealed ? (
        <div className="relative w-36 h-36 flex items-center justify-center">
          <div className={`absolute inset-0 bg-[#FFCB05]/30 rounded-full ${isPlaying ? "animate-ping" : ""}`} />
          <div onClick={playCry} className="relative z-10 w-28 h-28 bg-[#1B4F9C] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#FFCB05] text-5xl cursor-pointer hover:scale-105 transition">
            🔊
          </div>
        </div>
      ) : (
        <div className="relative w-40 h-40 animate-fade-in">
          <Image src={imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`} alt={name} fill sizes="160px" className="object-contain drop-shadow-md" unoptimized />
        </div>
      )}

      {!isRevealed ? (
        <button
          onClick={playCry}
          disabled={isPlaying}
          className="px-6 py-3 bg-[#FFCB05] hover:bg-[#ffbe00] active:scale-95 text-[#1B4F9C] font-button font-black rounded-xl shadow transition flex items-center gap-2 text-sm"
        >
          <span>{isPlaying ? "🎶 Tocando Grito..." : "🔄 Ouvir Som Novamente"}</span>
        </button>
      ) : (
        <span className="text-lg font-heading font-black capitalize text-[#1E1E1E]">
          {name} #{String(id).padStart(4, '0')}
        </span>
      )}
    </div>
  );
}