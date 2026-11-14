// Área Selvagem do Pokémon GO: Global — 14 e 15 de novembro de 2026.
// Fonte: https://pokemongo.com/pt-BR/gowildarea/global (conferida em 13/11/2026).

export type WildAreaPokemon = {
  key: string;
  name: string;
  /** ID usado nas artes oficiais da PokeAPI (formas regionais/Gigamax usam IDs 10xxx). */
  pokeApiId: number;
  types: string[];
  /** Arte alternativa (ex.: letras de Unown). */
  artUrl?: string;
  /** Observação curta exibida no card (ex.: "Jaqueta moderna"). */
  tag?: string;
};

export type DayKey = "sat" | "sun";

const ART = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
export const artworkUrl = (pokemon: WildAreaPokemon, shiny = false) =>
  pokemon.artUrl ?? `${ART}/other/official-artwork/${shiny ? "shiny/" : ""}${pokemon.pokeApiId}.png`;

const p = (key: string, name: string, pokeApiId: number, types: string[], extra: Partial<WildAreaPokemon> = {}): [string, WildAreaPokemon] =>
  [key, { key, name, pokeApiId, types, ...extra }];

const unown = (letter: string) =>
  p(`unown-${letter}`, `Unown ${letter.toUpperCase()}`, 201, ["Psíquico"], { artUrl: `${ART}/other/home/201-${letter}.png`, tag: `Letra ${letter.toUpperCase()}` });

export const WILD_AREA_POKEMON: Record<string, WildAreaPokemon> = Object.fromEntries([
  // Hora Sólido como Aço
  p("sandshrew-alola", "Sandshrew de Alola", 10101, ["Gelo", "Aço"]),
  p("diglett-alola", "Diglett de Alola", 10105, ["Terrestre", "Aço"]),
  p("magnemite", "Magnemite", 81, ["Elétrico", "Aço"]),
  p("shellder", "Shellder", 90, ["Água"]),
  p("onix", "Onix", 95, ["Pedra", "Terrestre"]),
  p("porygon", "Porygon", 137, ["Normal"]),
  p("shuckle", "Shuckle", 213, ["Inseto", "Pedra"]),
  p("skarmory", "Skarmory", 227, ["Aço", "Voador"]),
  p("nosepass", "Nosepass", 299, ["Pedra"]),
  p("aron", "Aron", 304, ["Aço", "Pedra"]),
  p("beldum", "Beldum", 374, ["Aço", "Psíquico"]),
  p("piplup", "Piplup", 393, ["Água"]),
  p("shieldon", "Shieldon", 410, ["Pedra", "Aço"]),
  p("bronzor", "Bronzor", 436, ["Aço", "Psíquico"]),
  p("lucario", "Lucario", 448, ["Lutador", "Aço"]),
  p("drilbur", "Drilbur", 529, ["Terrestre"]),
  p("ferroseed", "Ferroseed", 597, ["Planta", "Aço"]),
  p("klink", "Klink", 599, ["Aço"]),
  p("stunfisk-galar", "Stunfisk de Galar", 10180, ["Terrestre", "Aço"]),
  p("durant", "Durant", 632, ["Inseto", "Aço"]),
  p("rookidee", "Rookidee", 821, ["Voador"]),
  p("tinkatink", "Tinkatink", 957, ["Fada", "Aço"]),
  // Hora de Determinação de Dragão
  p("charmander", "Charmander", 4, ["Fogo"]),
  p("magikarp", "Magikarp", 129, ["Água"]),
  p("dratini", "Dratini", 147, ["Dragão"]),
  p("gligar", "Gligar", 207, ["Terrestre", "Voador"]),
  p("trapinch", "Trapinch", 328, ["Terrestre"]),
  p("swablu", "Swablu", 333, ["Normal", "Voador"]),
  p("barboach", "Barboach", 339, ["Água", "Terrestre"]),
  p("bagon", "Bagon", 371, ["Dragão"]),
  p("gible", "Gible", 443, ["Dragão", "Terrestre"]),
  p("tynamo", "Tynamo", 602, ["Elétrico"]),
  p("axew", "Axew", 610, ["Dragão"]),
  p("heatmor", "Heatmor", 631, ["Fogo"]),
  p("deino", "Deino", 633, ["Sombrio", "Dragão"]),
  p("skrelp", "Skrelp", 690, ["Venenoso", "Água"]),
  p("tyrunt", "Tyrunt", 696, ["Pedra", "Dragão"]),
  p("amaura", "Amaura", 698, ["Pedra", "Gelo"]),
  p("goomy", "Goomy", 704, ["Dragão"]),
  p("noibat", "Noibat", 714, ["Voador", "Dragão"]),
  p("turtonator", "Turtonator", 776, ["Fogo", "Dragão"]),
  p("jangmo-o", "Jangmo-o", 782, ["Dragão"]),
  p("sizzlipede", "Sizzlipede", 850, ["Fogo", "Inseto"]),
  p("frigibax", "Frigibax", 996, ["Dragão", "Gelo"]),
  // Reides
  p("machamp-jacket", "Machamp", 68, ["Lutador"], { tag: "Jaqueta moderna" }),
  p("zekrom", "Zekrom", 644, ["Dragão", "Elétrico"]),
  p("reshiram", "Reshiram", 643, ["Dragão", "Fogo"]),
  p("kyurem-white", "Kyurem Branco", 10023, ["Dragão", "Gelo"]),
  p("kyurem-black", "Kyurem Preto", 10022, ["Dragão", "Gelo"]),
  // Batalhas Max
  p("dialga-dynamax", "Dialga Dinamax", 483, ["Aço", "Dragão"], { tag: "Estreia" }),
  p("palkia-dynamax", "Palkia Dinamax", 484, ["Água", "Dragão"], { tag: "Estreia" }),
  p("duraludon-gmax", "Duraludon Gigamax", 10225, ["Aço", "Dragão"], { tag: "Estreia" }),
  // Pokémon incríveis
  p("exeggutor-alola", "Exeggutor de Alola", 10114, ["Planta", "Dragão"]),
  p("scizor", "Scizor", 212, ["Inseto", "Aço"]),
  p("flygon", "Flygon", 330, ["Terrestre", "Dragão"]),
  p("walrein", "Walrein", 365, ["Gelo", "Água"]),
  p("metagross", "Metagross", 376, ["Aço", "Psíquico"]),
  p("empoleon", "Empoleon", 395, ["Água", "Aço"]),
  p("magnezone", "Magnezone", 462, ["Elétrico", "Aço"]),
  p("conkeldurr", "Conkeldurr", 534, ["Lutador"]),
  p("haxorus", "Haxorus", 612, ["Dragão"]),
  p("azumarill", "Azumarill", 184, ["Água", "Fada"]),
  p("kingdra", "Kingdra", 230, ["Água", "Dragão"]),
  p("aggron", "Aggron", 306, ["Aço", "Pedra"]),
  p("ferrothorn", "Ferrothorn", 598, ["Planta", "Aço"]),
  p("hydreigon", "Hydreigon", 635, ["Sombrio", "Dragão"]),
  p("goodra", "Goodra", 706, ["Dragão"]),
  p("noivern", "Noivern", 715, ["Voador", "Dragão"]),
  p("tinkaton", "Tinkaton", 959, ["Fada", "Aço"]),
  p("clodsire", "Clodsire", 980, ["Venenoso", "Terrestre"]),
  // Ingresso
  p("latias", "Latias", 380, ["Dragão", "Psíquico"]),
  p("latios", "Latios", 381, ["Dragão", "Psíquico"]),
  unown("d"), unown("i"), unown("l"), unown("w"),
  // Ovos de 10 km
  p("honedge", "Honedge", 679, ["Aço", "Fantasma"]),
  p("klefki", "Klefki", 707, ["Aço", "Fada"]),
  p("drampa", "Drampa", 780, ["Normal", "Dragão"]),
  p("duraludon", "Duraludon", 884, ["Aço", "Dragão"]),
]);

export const WILD_AREA_EVENT = {
  name: "Área Selvagem do Pokémon GO: Global",
  start: { year: 2026, month: 11, day: 14 },
  days: [
    { key: "sat" as DayKey, weekday: "Sábado", date: "14 NOV", day: 14 },
    { key: "sun" as DayKey, weekday: "Domingo", date: "15 NOV", day: 15 },
  ],
  hours: { start: 10, end: 18 },
  ticketPrice: "11,99",
  sourceUrl: "https://pokemongo.com/pt-BR/gowildarea/global",
};

export const WILD_SPAWNS = {
  steel: {
    title: "Hora Sólido como Aço",
    order: "Acontece primeiro",
    keys: ["sandshrew-alola", "diglett-alola", "magnemite", "shellder", "onix", "porygon", "shuckle", "skarmory", "nosepass", "aron", "beldum", "piplup", "shieldon", "bronzor", "lucario", "drilbur", "ferroseed", "klink", "stunfisk-galar", "durant", "rookidee", "tinkatink"],
  },
  dragon: {
    title: "Hora de Determinação de Dragão",
    order: "Vem logo em seguida",
    keys: ["charmander", "magikarp", "dratini", "gligar", "trapinch", "swablu", "barboach", "bagon", "gible", "tynamo", "axew", "heatmor", "deino", "skrelp", "tyrunt", "amaura", "goomy", "noibat", "turtonator", "jangmo-o", "sizzlipede", "frigibax"],
  },
} as const;

export const RAIDS: Record<DayKey, { threeStar: string[]; fiveStar: string[] }> = {
  sat: { threeStar: ["machamp-jacket"], fiveStar: ["zekrom", "kyurem-white"] },
  sun: { threeStar: ["machamp-jacket"], fiveStar: ["reshiram", "kyurem-black"] },
};

export const MAX_BATTLES: Record<DayKey, { dynamax: string[]; gigantamax: string[] }> = {
  sat: { dynamax: ["dialga-dynamax"], gigantamax: ["duraludon-gmax"] },
  sun: { dynamax: ["palkia-dynamax"], gigantamax: ["duraludon-gmax"] },
};

export const INCREDIBLE: Record<DayKey, string[]> = {
  sat: ["exeggutor-alola", "scizor", "flygon", "walrein", "metagross", "empoleon", "magnezone", "conkeldurr", "haxorus"],
  sun: ["azumarill", "kingdra", "aggron", "ferrothorn", "hydreigon", "goodra", "noivern", "tinkaton", "clodsire"],
};

export const INCENSE_ALL = ["exeggutor-alola", "azumarill", "scizor", "kingdra", "aggron", "flygon", "empoleon", "magnezone", "conkeldurr", "hydreigon"];
export const INCENSE_TICKET = ["unown-d", "unown-i", "unown-l", "unown-w"];
export const INCENSE_TICKET_INCREDIBLE = ["latias", "latios"];
export const EGGS_10KM = ["honedge", "klefki", "drampa", "duraludon"];

/** Pokémon que podem vir com o novo Fundo Especial em Reides e Batalhas Max. */
export const SPECIAL_BACKGROUND = ["machamp-jacket", "dialga-dynamax", "palkia-dynamax", "reshiram", "zekrom", "kyurem-white", "kyurem-black", "duraludon-gmax"];

export const HIGHLIGHTS = [
  { key: "duraludon-gmax", kicker: "ESTREIA GIGAMAX", title: "Duraludon Gigamax chega ao GO", text: "Aparece em Batalhas Max de 6 estrelas nos dois dias. Quem tem ingresso pode encontrá-lo com Fundo Especial ao concluir a pesquisa especial." },
  { key: "dialga-dynamax", kicker: "ESTREIA DINAMAX", title: "Dialga e Palkia Dinamax", text: "Dialga Dinamax no sábado e Palkia Dinamax no domingo, pela primeira vez no Pokémon GO." },
  { key: "machamp-jacket", kicker: "TRAJE DO EVENTO", title: "Machamp de jaqueta", text: "Machamp com uma jaqueta moderna aparece em Reides de 3 estrelas no sábado e no domingo, conhecendo Golpe de Caratê." },
  { key: "latios", kicker: "COM INGRESSO", title: "Latias e Latios incríveis", text: "Atraídos por Incenso (exceto o Incenso de Aventura Diário) nos dois dias. Fogem rápido — tenha Bolas Safári GO prontas!" },
] as const;

export const FEATURED_MOVES: [string, string][] = [
  ["machamp-jacket", "Golpe de Caratê"],
  ["flygon", "Poder da Terra"],
  ["metagross", "Meteoro Esmagador"],
  ["magnezone", "Bomba Ímã"],
  ["haxorus", "Golpe Deslizante"],
  ["hydreigon", "Balanço Violento"],
  ["tinkaton", "Martelo Gigatônico"],
];

export type Bonus = { icon: string; title: string; text: string };

export const FREE_BONUSES: Bonus[] = [
  { icon: "🎯", title: "Bolas Safári GO", text: "Chance de ganhar girando fotodiscos de Ginásios e Poképaradas." },
  { icon: "🎟️", title: "3 Passes de Reide grátis", text: "Por dia, girando fotodiscos de Ginásios." },
  { icon: "💠", title: "1.600 Partículas Max", text: "Limite diário de coleta aumentado." },
  { icon: "📸", title: "3 surpresas no Retrato GO", text: "Por dia: Pokémon de Aço e Dragão podem aparecer nas fotos." },
  { icon: "👥", title: "Jogo em Grupo por 8h", text: "Ativo durante todo o horário do evento." },
  { icon: "🛤️", title: "Incríveis nas Rotas", text: "Possibilidade de encontrar Pokémon incríveis seguindo Rotas." },
  { icon: "📋", title: "Pesquisa de campo temática", text: "Maior chance de receber tarefas com Pokémon do evento." },
];

export const TICKET_BONUSES: Bonus[] = [
  { icon: "✨", title: "Mais Brilhantes", text: "Maior chance de encontrar Pokémon Brilhantes (sem garantia)." },
  { icon: "💠", title: "3.200 Partículas Max", text: "Limite diário dobrado, e mais Partículas de Pontos de Energia e exploração." },
  { icon: "🎟️", title: "6 Passes de Reide grátis", text: "Por dia, girando fotodiscos de Ginásios." },
  { icon: "🍬", title: "2× Doces", text: "Por capturar Pokémon." },
  { icon: "🔥", title: "2× duração do Incenso", text: "Mais tempo para atrair incríveis, Latias e Latios." },
  { icon: "🥚", title: "Mais Ovos de 10 km", text: "Ao girar fotodiscos de Ginásios e Poképaradas." },
  { icon: "📸", title: "6 surpresas no Retrato GO", text: "Por dia, com Pokémon de Aço e Dragão." },
  { icon: "🧲", title: "Módulos Atrair de 2h", text: "Módulos ativados duram duas horas." },
  { icon: "🔄", title: "6 trocas especiais", text: "Por dia, da 0h às 23h59 nos dias do evento." },
  { icon: "⭐", title: "½ Poeira Estelar em trocas", text: "Da 0h às 23h59 nos dias do evento." },
  { icon: "🎈", title: "Balões de Suprimentos", text: "De hora em hora, com Bolas Safári GO." },
];

export const TIPS: { icon: string; title: string; text: string }[] = [
  { icon: "⏰", title: "Bolas Safári têm prazo", text: "Só funcionam das 10h às 18h nos dias do evento e somem do inventário quando ele acaba. Use sem dó!" },
  { icon: "🧊", title: "Energia de Fusão", text: "Vença Reides de Kyurem Preto e Kyurem Branco para ganhar Energia de Fusão. Kyurem de reide conhece Glaciar." },
  { icon: "💠", title: "Partículas primeiro", text: "Para valer o bônus de exploração, colete todas as Partículas Max do menu Proximidades. A Sincroaventura ajuda." },
  { icon: "📅", title: "Descobertas Diárias pausadas", text: "Não acontecem de 9 a 15 de novembro de 2026 (horário local)." },
  { icon: "🖼️", title: "Fundo Especial", text: "Capturas em Reides e Batalhas Max podem vir com o novo fundo comemorativo da Área Selvagem." },
  { icon: "🌐", title: "Horário local", text: "O evento segue o fuso de onde você estiver: 10h às 18h nos dois dias." },
];

/** Todas as chaves que entram no checklist, sem repetição. */
export const ALL_WILD_AREA_KEYS = [...new Set([
  ...WILD_SPAWNS.steel.keys, ...WILD_SPAWNS.dragon.keys,
  ...Object.values(RAIDS).flatMap(r => [...r.threeStar, ...r.fiveStar]),
  ...Object.values(MAX_BATTLES).flatMap(m => [...m.dynamax, ...m.gigantamax]),
  ...Object.values(INCREDIBLE).flat(),
  ...INCENSE_ALL, ...INCENSE_TICKET, ...INCENSE_TICKET_INCREDIBLE, ...EGGS_10KM,
])];
