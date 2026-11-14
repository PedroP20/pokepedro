"use client";

import { useState } from "react";
import Image from "next/image";

interface PokemonDisplayProps { id?: number; imageUrl: string; name: string; isRevealed: boolean; isSilhouetteMode: boolean }
export default function PokemonDisplay({ id, imageUrl, name, isRevealed, isSilhouetteMode }: PokemonDisplayProps) {
  const [failed, setFailed] = useState(false);
  const source = failed && id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` : imageUrl;
  return <div className={`arena-pokemon-art ${isSilhouetteMode && !isRevealed ? "is-silhouette" : ""}`}><Image src={source} alt={isRevealed ? name : "Pokémon misterioso"} fill sizes="(max-width: 600px) 240px, (max-width: 900px) 340px, 400px" priority unoptimized className="arena-pokemon-image" onError={() => setFailed(true)} /></div>;
}
