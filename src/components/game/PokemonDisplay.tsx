"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PokemonDisplayProps {
  imageUrl: string;
  name: string;
  isRevealed: boolean;
  isSilhouetteMode: boolean; // 👈 Recebe a configuração do modo
}

export default function PokemonDisplay({
  imageUrl,
  name,
  isRevealed,
  isSilhouetteMode,
}: PokemonDisplayProps) {
  // A silhueta preta só deve aparecer se o Modo Silhueta estiver ativo E a resposta ainda não foi revelada!
  const shouldShowSilhouette = isSilhouetteMode && !isRevealed;

  return (
    <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center shrink-0 my-2 sm:my-4">
      {/* Brilho de fundo */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-700 ${
          isRevealed ? "bg-yellow-500/20 opacity-100" : "bg-slate-800/30 opacity-50"
        }`}
      />

      {imageUrl && (
        <motion.div
          key={imageUrl}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative z-10 w-full h-full"
        >
          <Image
            src={imageUrl}
            alt={isRevealed ? name : "Pokémon misterioso"}
            fill
            sizes="(max-width: 640px) 208px, (max-width: 768px) 256px, 320px"
            className={`object-contain transition-all duration-500 select-none pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] ${
              shouldShowSilhouette
                ? "brightness-0 contrast-200 select-none"
                : "brightness-100 contrast-100 filter-none scale-105"
            }`}
            priority
          />
        </motion.div>
      )}
    </div>
  );
}