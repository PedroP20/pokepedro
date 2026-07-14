// 🌟 INTERFACES EXPORTADAS PARA O TYPESCRIPT NÃO SE PERDER
export interface TypeInfo {
  name: string;
  icon: string;
  colorBg: string;
  colorText: string;
}

export interface DefenseMultipliers {
  doubleWeakness: string[];
  weakness: string[];
  resistance: string[];
  doubleResistance: string[];
  immune: string[];
}

export const POKEMON_TYPES: Record<string, TypeInfo> = {
  Normal: { name: "Normal", icon: "⭐", colorBg: "bg-neutral-500", colorText: "text-white" },
  Fogo: { name: "Fogo", icon: "🔥", colorBg: "bg-red-600", colorText: "text-white" },
  Água: { name: "Água", icon: "💧", colorBg: "bg-blue-600", colorText: "text-white" },
  Planta: { name: "Planta", icon: "🌿", colorBg: "bg-green-600", colorText: "text-white" },
  Elétrico: { name: "Elétrico", icon: "⚡", colorBg: "bg-yellow-400", colorText: "text-black" },
  Gelo: { name: "Gelo", icon: "❄️", colorBg: "bg-cyan-400", colorText: "text-black" },
  Lutador: { name: "Lutador", icon: "🥊", colorBg: "bg-orange-700", colorText: "text-white" },
  Venenoso: { name: "Venenoso", icon: "☠️", colorBg: "bg-purple-600", colorText: "text-white" },
  Terrestre: { name: "Terrestre", icon: "🌍", colorBg: "bg-amber-700", colorText: "text-white" },
  Voador: { name: "Voador", icon: "🦅", colorBg: "bg-indigo-500", colorText: "text-white" },
  Psíquico: { name: "Psíquico", icon: "🔮", colorBg: "bg-pink-600", colorText: "text-white" },
  Inseto: { name: "Inseto", icon: "🐛", colorBg: "bg-lime-600", colorText: "text-white" },
  Pedra: { name: "Pedra", icon: "🪨", colorBg: "bg-stone-600", colorText: "text-white" },
  Fantasma: { name: "Fantasma", icon: "👻", colorBg: "bg-purple-900", colorText: "text-white" },
  Dragão: { name: "Dragão", icon: "🐉", colorBg: "bg-violet-700", colorText: "text-white" },
  Aço: { name: "Aço", icon: "⚙️", colorBg: "bg-slate-500", colorText: "text-white" },
  Sombrio: { name: "Sombrio", icon: "🌙", colorBg: "bg-neutral-800", colorText: "text-white" },
  Fada: { name: "Fada", icon: "✨", colorBg: "bg-pink-400", colorText: "text-black" },
};

export const ATTACK_EFFECTIVENESS: Record<string, { superEffective: string[]; notVeryEffective: string[]; noEffect: string[] }> = {
  Normal: { superEffective: [], notVeryEffective: ["Pedra", "Aço"], noEffect: ["Fantasma"] },
  Fogo: { superEffective: ["Planta", "Gelo", "Inseto", "Aço"], notVeryEffective: ["Fogo", "Água", "Pedra", "Dragão"], noEffect: [] },
  Água: { superEffective: ["Fogo", "Terrestre", "Pedra"], notVeryEffective: ["Água", "Planta", "Dragão"], noEffect: [] },
  Planta: { superEffective: ["Água", "Terrestre", "Pedra"], notVeryEffective: ["Fogo", "Planta", "Venenoso", "Voador", "Inseto", "Dragão", "Aço"], noEffect: [] },
  Elétrico: { superEffective: ["Água", "Voador"], notVeryEffective: ["Planta", "Elétrico", "Dragão"], noEffect: ["Terrestre"] },
  Gelo: { superEffective: ["Planta", "Terrestre", "Voador", "Dragão"], notVeryEffective: ["Fogo", "Água", "Gelo", "Aço"], noEffect: [] },
  Lutador: { superEffective: ["Normal", "Gelo", "Pedra", "Sombrio", "Aço"], notVeryEffective: ["Venenoso", "Voador", "Psíquico", "Inseto", "Fada"], noEffect: ["Fantasma"] },
  Venenoso: { superEffective: ["Planta", "Fada"], notVeryEffective: ["Venenoso", "Terrestre", "Pedra", "Fantasma"], noEffect: ["Aço"] },
  Terrestre: { superEffective: ["Fogo", "Elétrico", "Venenoso", "Pedra", "Aço"], notVeryEffective: ["Planta", "Inseto"], noEffect: ["Voador"] },
  Voador: { superEffective: ["Planta", "Lutador", "Inseto"], notVeryEffective: ["Elétrico", "Pedra", "Aço"], noEffect: [] },
  Psíquico: { superEffective: ["Lutador", "Venenoso"], notVeryEffective: ["Psíquico", "Aço"], noEffect: ["Sombrio"] },
  Inseto: { superEffective: ["Planta", "Psíquico", "Sombrio"], notVeryEffective: ["Fogo", "Lutador", "Venenoso", "Voador", "Fantasma", "Aço", "Fada"], noEffect: [] },
  Pedra: { superEffective: ["Fogo", "Gelo", "Voador", "Inseto"], notVeryEffective: ["Lutador", "Terrestre", "Aço"], noEffect: [] },
  Fantasma: { superEffective: ["Psíquico", "Fantasma"], notVeryEffective: ["Sombrio"], noEffect: ["Normal"] },
  Dragão: { superEffective: ["Dragão"], notVeryEffective: ["Aço"], noEffect: ["Fada"] },
  Aço: { superEffective: ["Gelo", "Pedra", "Fada"], notVeryEffective: ["Fogo", "Água", "Elétrico", "Aço"], noEffect: [] },
  Sombrio: { superEffective: ["Psíquico", "Fantasma"], notVeryEffective: ["Lutador", "Sombrio", "Fada"], noEffect: [] },
  Fada: { superEffective: ["Lutador", "Dragão", "Sombrio"], notVeryEffective: ["Fogo", "Venenoso", "Aço"], noEffect: [] },
};

export function calculateDefenseMultipliers(defendingTypes: string[]): DefenseMultipliers {
  const multipliers: Record<string, number> = {};

  Object.keys(POKEMON_TYPES).forEach((type) => {
    multipliers[type] = 1.0;
  });

  defendingTypes.forEach((defType) => {
    Object.entries(ATTACK_EFFECTIVENESS).forEach(([atkType, rules]) => {
      if (rules.superEffective.includes(defType)) {
        multipliers[atkType] *= 2.0;
      } else if (rules.notVeryEffective.includes(defType)) {
        multipliers[atkType] *= 0.5;
      } else if (rules.noEffect.includes(defType)) {
        multipliers[atkType] *= 0.0;
      }
    });
  });

  const doubleWeakness: string[] = [];
  const weakness: string[] = [];
  const resistance: string[] = [];
  const doubleResistance: string[] = [];
  const immune: string[] = [];

  Object.entries(multipliers).forEach(([type, mult]) => {
    if (mult === 4.0) doubleWeakness.push(type);
    else if (mult === 2.0) weakness.push(type);
    else if (mult === 0.5) resistance.push(type);
    else if (mult === 0.25) doubleResistance.push(type);
    else if (mult === 0.0) immune.push(type);
  });

  return { doubleWeakness, weakness, resistance, doubleResistance, immune };
}