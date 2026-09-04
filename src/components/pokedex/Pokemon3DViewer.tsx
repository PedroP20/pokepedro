"use client";
/* eslint-disable @typescript-eslint/no-namespace */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        "camera-controls"?: boolean;
        "touch-action"?: string;
        "shadow-intensity"?: string;
        "environment-image"?: string;
        "camera-orbit"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "auto-rotate"?: boolean;
        "rotation-per-second"?: string;
        loading?: "auto" | "eager" | "lazy";
        reveal?: "auto" | "manual";
      };
    }
  }
}

interface ApiForm {
  formName: string;
  model: string;
}

interface ApiPokemon {
  id: number;
  forms: ApiForm[];
}

interface Pokemon3DViewerProps {
  pokemonId: number;
  name: string;
  baseName: string;
  formSlug: string;
  isShiny: boolean;
  gradient: string;
}

const API_URL = "https://pokemon-3d-api.onrender.com/v1/pokemon";

async function fetch3DModels(): Promise<ApiPokemon[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Não foi possível carregar o catálogo 3D.");

  const data = (await response.json()) as { pokemon?: ApiPokemon[] } | ApiPokemon[];
  return Array.isArray(data) ? data : data.pokemon || [];
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function getExactModel(pokemon: ApiPokemon | undefined, baseName: string, formSlug: string, isShiny: boolean) {
  if (!pokemon) return undefined;

  const base = normalize(baseName);
  const selected = normalize(formSlug).replace(base, "") || "regular";
  const wanted = isShiny
    ? (selected === "regular" ? "shiny" : `shiny${selected}`)
    : selected;

  return pokemon.forms.find((form) => normalize(form.formName) === wanted);
}

export default function Pokemon3DViewer({ pokemonId, name, baseName, formSlug, isShiny, gradient }: Pokemon3DViewerProps) {
  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  const { data: models = [], isLoading, isError } = useQuery({
    queryKey: ["pokemon3DModels"],
    queryFn: fetch3DModels,
    staleTime: 1000 * 60 * 60,
  });

  const pokemon = models.find((item) => item.id === pokemonId);
  const model = getExactModel(pokemon, baseName, formSlug, isShiny);

  if (isLoading) {
    return (
      <div className="h-[340px] sm:h-[420px] flex flex-col items-center justify-center gap-3 text-white">
        <div className="w-11 h-11 border-4 border-white/80 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold">Preparando modelo 3D...</p>
      </div>
    );
  }

  if (isError || !model) {
    return (
      <div className="h-[340px] sm:h-[420px] flex flex-col items-center justify-center gap-3 px-8 text-center text-white">
        <span className="text-5xl">📦</span>
        <p className="font-black">Modelo 3D indisponível</p>
        <p className="text-xs leading-relaxed text-white/75">
          Modelo 3D indisponível para esta forma{isShiny ? " shiny" : ""}: {name}.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative h-[340px] sm:h-[420px] overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} border border-white/25 shadow-inner`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_62%)] pointer-events-none" />
      <model-viewer
        src={model.model}
        alt={`Modelo 3D de ${name}`}
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1"
        environment-image="neutral"
        camera-orbit="0deg 75deg 105%"
        min-camera-orbit="auto auto 55%"
        max-camera-orbit="auto auto 180%"
        loading="eager"
        reveal="auto"
        className="relative h-full w-full cursor-grab active:cursor-grabbing"
      />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 backdrop-blur px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white whitespace-nowrap pointer-events-none">
        Arraste para girar · Pinça/rolagem para zoom
      </div>
    </div>
  );
}
