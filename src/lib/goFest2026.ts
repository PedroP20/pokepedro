export type GoFestPokemon = {
  key: string;
  name: string;
  pokeApiId?: number;
  fallbackPokeApiId?: number;
  types?: string[];
};

export type GoFestSlot = {
  label: string;
  hours?: number[];
  wild: string[];
  raids: string[];
};

export type GoFestDay = {
  key: string;
  weekday: string;
  label: string;
  event: "MEGA ASCENSÃO" | "MEGAFINAL";
  slots: GoFestSlot[];
  superRaids?: string[];
  specialRaids?: string[];
};

const wild: Record<string, [string, number]> = {
  weedle: ["Weedle", 13], bellsprout: ["Bellsprout", 69], scyther: ["Scyther", 123], pinsir: ["Pinsir", 127], roselia: ["Roselia", 315], snover: ["Snover", 459], venipede: ["Venipede", 543], chespin: ["Chespin", 650], fennekin: ["Fennekin", 653], froakie: ["Froakie", 656], skiddo: ["Skiddo", 672],
  abra: ["Abra", 63], slowpoke: ["Slowpoke", 79], staryu: ["Staryu", 120], ralts: ["Ralts", 280], meditite: ["Meditite", 307], espurr: ["Espurr", 677], binacle: ["Binacle", 688], clauncher: ["Clauncher", 692],
  gastly: ["Gastly", 92], houndour: ["Houndour", 228], shuppet: ["Shuppet", 353], zorua: ["Zorua", 570], litwick: ["Litwick", 607], inkay: ["Inkay", 686], phantump: ["Phantump", 708], pumpkaboo: ["Pumpkaboo", 710],
  pikachu: ["Pikachu", 25], mareep: ["Mareep", 179], electrike: ["Electrike", 309], emolga: ["Emolga", 587], tynamo: ["Tynamo", 602], stunfisk: ["Stunfisk", 618], helioptile: ["Helioptile", 694], dedenne: ["Dedenne", 702],
  onix: ["Onix", 95], skarmory: ["Skarmory", 227], aron: ["Aron", 304], snorunt: ["Snorunt", 361], beldum: ["Beldum", 374], drilbur: ["Drilbur", 529], amaura: ["Amaura", 698], bergmite: ["Bergmite", 712],
  machop: ["Machop", 66], carvanha: ["Carvanha", 318], numel: ["Numel", 322], buneary: ["Buneary", 427], sandile: ["Sandile", 551], scraggy: ["Scraggy", 559], pancham: ["Pancham", 674], falinks: ["Falinks", 870],
  magikarp: ["Magikarp", 129], aerodactyl: ["Aerodactyl", 142], dratini: ["Dratini", 147], swablu: ["Swablu", 333], bagon: ["Bagon", 371], fletchling: ["Fletchling", 661], tyrunt: ["Tyrunt", 696], noibat: ["Noibat", 714],
  clefairy: ["Clefairy", 35], sableye: ["Sableye", 302], mawile: ["Mawile", 303], audino: ["Audino", 531], furfrou: ["Furfrou", 676], spritzee: ["Spritzee", 682], carbink: ["Carbink", 703],
};

const mega: Record<string, GoFestPokemon> = {
  "mega-beedrill": { key: "mega-beedrill", name: "Mega Beedrill", pokeApiId: 10090, types: ["Inseto", "Venenoso"] },
  "mega-victreebel": { key: "mega-victreebel", name: "Mega Victreebel", fallbackPokeApiId: 71, types: ["Planta", "Venenoso"] },
  "mega-pinsir": { key: "mega-pinsir", name: "Mega Pinsir", pokeApiId: 10040, types: ["Inseto", "Voador"] },
  "mega-abomasnow": { key: "mega-abomasnow", name: "Mega Abomasnow", pokeApiId: 10060, types: ["Planta", "Gelo"] },
  "mega-alakazam": { key: "mega-alakazam", name: "Mega Alakazam", pokeApiId: 10037, types: ["Psíquico"] },
  "mega-slowbro": { key: "mega-slowbro", name: "Mega Slowbro", pokeApiId: 10071, types: ["Água", "Psíquico"] },
  "mega-starmie": { key: "mega-starmie", name: "Mega Starmie", fallbackPokeApiId: 121, types: ["Água", "Psíquico"] },
  "mega-medicham": { key: "mega-medicham", name: "Mega Medicham", pokeApiId: 10054, types: ["Lutador", "Psíquico"] },
  "mega-gengar": { key: "mega-gengar", name: "Mega Gengar", pokeApiId: 10038, types: ["Fantasma", "Venenoso"] },
  "mega-houndoom": { key: "mega-houndoom", name: "Mega Houndoom", pokeApiId: 10048, types: ["Sombrio", "Fogo"] },
  "mega-banette": { key: "mega-banette", name: "Mega Banette", pokeApiId: 10056, types: ["Fantasma"] },
  "mega-malamar": { key: "mega-malamar", name: "Mega Malamar", fallbackPokeApiId: 687, types: ["Sombrio", "Psíquico"] },
  "mega-raichu-x": { key: "mega-raichu-x", name: "Mega Raichu X", fallbackPokeApiId: 26 },
  "mega-raichu-y": { key: "mega-raichu-y", name: "Mega Raichu Y", fallbackPokeApiId: 26 },
  "mega-ampharos": { key: "mega-ampharos", name: "Mega Ampharos", pokeApiId: 10045, types: ["Elétrico", "Dragão"] },
  "mega-manectric": { key: "mega-manectric", name: "Mega Manectric", pokeApiId: 10055, types: ["Elétrico"] },
  "mega-mewtwo-x": { key: "mega-mewtwo-x", name: "Mega Mewtwo X", pokeApiId: 10043, types: ["Psíquico", "Lutador"] },
  "mega-mewtwo-y": { key: "mega-mewtwo-y", name: "Mega Mewtwo Y", pokeApiId: 10044, types: ["Psíquico"] },
  "mega-steelix": { key: "mega-steelix", name: "Mega Steelix", pokeApiId: 10072, types: ["Aço", "Terrestre"] },
  "mega-skarmory": { key: "mega-skarmory", name: "Mega Skarmory", fallbackPokeApiId: 227, types: ["Aço", "Voador"] },
  "mega-aggron": { key: "mega-aggron", name: "Mega Aggron", pokeApiId: 10053, types: ["Aço"] },
  "mega-glalie": { key: "mega-glalie", name: "Mega Glalie", pokeApiId: 10074, types: ["Gelo"] },
  "mega-sharpedo": { key: "mega-sharpedo", name: "Mega Sharpedo", pokeApiId: 10070, types: ["Água", "Sombrio"] },
  "mega-camerupt": { key: "mega-camerupt", name: "Mega Camerupt", pokeApiId: 10081, types: ["Fogo", "Terrestre"] },
  "mega-lopunny": { key: "mega-lopunny", name: "Mega Lopunny", pokeApiId: 10088, types: ["Normal", "Lutador"] },
  "mega-falinks": { key: "mega-falinks", name: "Mega Falinks", fallbackPokeApiId: 870, types: ["Lutador"] },
  "mega-gyarados": { key: "mega-gyarados", name: "Mega Gyarados", pokeApiId: 10041, types: ["Água", "Sombrio"] },
  "mega-aerodactyl": { key: "mega-aerodactyl", name: "Mega Aerodactyl", pokeApiId: 10042, types: ["Pedra", "Voador"] },
  "mega-dragonite": { key: "mega-dragonite", name: "Mega Dragonite", fallbackPokeApiId: 149, types: ["Dragão", "Voador"] },
  "mega-altaria": { key: "mega-altaria", name: "Mega Altaria", pokeApiId: 10067, types: ["Dragão", "Fada"] },
  "mega-sableye": { key: "mega-sableye", name: "Mega Sableye", pokeApiId: 10066, types: ["Sombrio", "Fantasma"] },
  "mega-mawile": { key: "mega-mawile", name: "Mega Mawile", pokeApiId: 10052, types: ["Aço", "Fada"] },
  "mega-audino": { key: "mega-audino", name: "Mega Audino", pokeApiId: 10069, types: ["Normal", "Fada"] },
};

export const GOFEST_POKEMON: Record<string, GoFestPokemon> = {
  ...Object.fromEntries(Object.entries(wild).map(([key, [name, pokeApiId]]) => [key, { key, name, pokeApiId }])),
  ...mega,
  "mega-latios": { key: "mega-latios", name: "Mega Latios", pokeApiId: 10061, types: ["Dragão", "Psíquico"] },
  "mega-latias": { key: "mega-latias", name: "Mega Latias", pokeApiId: 10062, types: ["Dragão", "Psíquico"] },
  "mewtwo-armored": { key: "mewtwo-armored", name: "Mewtwo Armored", fallbackPokeApiId: 150, types: ["Psíquico"] },
};

const ascensionWild = ["bellsprout", "staryu", "dratini", "skarmory", "chespin", "fennekin", "froakie", "inkay", "falinks"];
const slot = (wildPokemon: string[], raids: string[], label = "Dia todo", hours?: number[]): GoFestSlot => ({ label, hours, wild: wildPokemon, raids });

export const GOFEST_DAYS: GoFestDay[] = [
  { key: "2026-08-31", weekday: "Segunda-feira", label: "31 AGO", event: "MEGA ASCENSÃO", slots: [slot(ascensionWild, ["mega-victreebel", "mega-dragonite", "mega-malamar", "mega-latios", "mega-latias"])] },
  { key: "2026-09-01", weekday: "Terça-feira", label: "01 SET", event: "MEGA ASCENSÃO", slots: [slot(ascensionWild, ["mega-falinks", "mega-latios", "mega-latias"])] },
  { key: "2026-09-02", weekday: "Quarta-feira", label: "02 SET", event: "MEGA ASCENSÃO", slots: [slot(ascensionWild, ["mega-skarmory", "mega-latios", "mega-latias"])] },
  { key: "2026-09-03", weekday: "Quinta-feira", label: "03 SET", event: "MEGA ASCENSÃO", slots: [slot(ascensionWild, ["mega-starmie", "mega-latios", "mega-latias"])] },
  { key: "2026-09-04", weekday: "Sexta-feira", label: "04 SET", event: "MEGA ASCENSÃO", slots: [slot(ascensionWild, ["mega-raichu-x", "mega-raichu-y", "mega-latios", "mega-latias"])] },
  { key: "2026-09-05", weekday: "Sábado", label: "05 SET", event: "MEGAFINAL", superRaids: ["mega-mewtwo-x"], specialRaids: ["mewtwo-armored"], slots: [
    slot(["weedle", "bellsprout", "scyther", "pinsir", "roselia", "snover", "venipede", "chespin", "fennekin", "froakie", "skiddo"], ["mega-beedrill", "mega-victreebel", "mega-pinsir", "mega-abomasnow"], "10h–11h e 14h–15h", [10, 14]),
    slot(["abra", "slowpoke", "staryu", "ralts", "meditite", "chespin", "fennekin", "froakie", "espurr", "binacle", "clauncher"], ["mega-alakazam", "mega-slowbro", "mega-starmie", "mega-medicham"], "11h–12h e 15h–16h", [11, 15]),
    slot(["gastly", "houndour", "shuppet", "zorua", "litwick", "chespin", "fennekin", "froakie", "inkay", "phantump", "pumpkaboo"], ["mega-gengar", "mega-houndoom", "mega-banette", "mega-malamar"], "12h–13h e 16h–17h", [12, 16]),
    slot(["pikachu", "mareep", "electrike", "emolga", "tynamo", "stunfisk", "chespin", "fennekin", "froakie", "helioptile", "dedenne"], ["mega-raichu-x", "mega-ampharos", "mega-manectric"], "13h–14h e 17h–18h", [13, 17]),
  ] },
  { key: "2026-09-06", weekday: "Domingo", label: "06 SET", event: "MEGAFINAL", superRaids: ["mega-mewtwo-y"], specialRaids: ["mewtwo-armored"], slots: [
    slot(["onix", "skarmory", "aron", "snorunt", "beldum", "drilbur", "chespin", "fennekin", "froakie", "amaura", "bergmite"], ["mega-steelix", "mega-skarmory", "mega-aggron", "mega-glalie"], "10h–11h e 14h–15h", [10, 14]),
    slot(["machop", "carvanha", "numel", "buneary", "sandile", "scraggy", "chespin", "fennekin", "froakie", "pancham", "falinks"], ["mega-sharpedo", "mega-camerupt", "mega-lopunny", "mega-falinks"], "11h–12h e 15h–16h", [11, 15]),
    slot(["magikarp", "aerodactyl", "dratini", "swablu", "bagon", "chespin", "fennekin", "froakie", "fletchling", "tyrunt", "noibat"], ["mega-gyarados", "mega-aerodactyl", "mega-dragonite", "mega-altaria"], "12h–13h e 16h–17h", [12, 16]),
    slot(["pikachu", "clefairy", "sableye", "mawile", "audino", "chespin", "fennekin", "froakie", "furfrou", "spritzee", "carbink"], ["mega-raichu-y", "mega-sableye", "mega-mawile", "mega-audino"], "13h–14h e 17h–18h", [13, 17]),
  ] },
];

export const GOFEST_BONUSES = {
  ASCENSION: [
    ["🎟️", "Passes a distância", "Limite aumentado para 30 de 31 de agosto a 4 de setembro."],
    ["🧭", "Pesquisa temporária", "Escolha Chespin, Fennekin ou Froakie para o Passe GO: Megafinal."],
    ["🖼️", "Fundos especiais", "Megarreides podem render Fundo Especial de Megaevolução."],
  ],
  FINAL: [
    ["♾️", "Reides a distância", "Sem limite em 5 e 6 de setembro."],
    ["📈", "PC Mega aumentado", "Megaevoluções recebem aumento adicional de PC."],
    ["🍬", "Recompensas de reide", "Mais Doce, Doce GG e PE nas Megarreides."],
    ["✨", "Mais brilhantes", "Maior chance em encontros selecionados de reide e do evento."],
  ],
} as const;

export const ALL_GOFEST_KEYS = [...new Set(GOFEST_DAYS.flatMap((day) => [
  ...(day.superRaids || []),
  ...(day.specialRaids || []),
  ...day.slots.flatMap((item) => [...item.wild, ...item.raids]),
]))];
