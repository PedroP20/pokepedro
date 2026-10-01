import type { EventPokemon, EventSchedule, GameEvent } from './events';
import { GOFEST_DAYS, GOFEST_POKEMON } from './goFest2026';

const local = (start: string, end: string): EventSchedule => ({ mode: 'local', windows: [{ start, end }] });
const pokemon = (id: number, name: string, shiny = false): EventPokemon => ({ id, name, shiny });

export const SCENERY_SUNDAYS: GameEvent[] = [13, 20, 27].map(day => ({
  id: `domingo-paisagens-2026-09-${day}`, name: `Domingo de Paisagens — ${day}/09/2026`, categoryId: 'scenery',
  summary: 'Um domingo inteiro de evento. Os detalhes da programação serão informados posteriormente.',
  schedule: local(`2026-09-${day}T00:00`, `2026-09-${day + 1}T00:00`),
  highlights: [{ icon: '🖼️', text: 'Domingo de Paisagens' }, { icon: '☀️', text: 'Dia todo · 0:00–23:59' }],
}));

export const GOFEST_PHASES: GameEvent[] = [
  { id: 'mega-ascensao', name: 'Mega Ascensão', categoryId: 'general', imageId: 10061,
    summary: 'Calendário de 31 de agosto a 4 de setembro, bônus, capturas e estratégias de Megarreides do GOFEST.',
    schedule: { mode: 'absolute', label: 'Programação original: America/Sao_Paulo', windows: [{ start: '2026-08-31T00:00:00-03:00', end: '2026-09-05T00:00:00-03:00' }] } },
  { id: 'megafinal-2026', name: 'Festival de Pokémon GO 2026: Megafinal', categoryId: 'general', imageId: 150,
    summary: 'Os dias 5 e 6 de setembro do GOFEST, com rotações, Super Megarreides, bônus e seu checklist de capturas.',
    schedule: { mode: 'absolute', label: 'Programação original: America/Sao_Paulo', windows: [{ start: '2026-09-05T00:00:00-03:00', end: '2026-09-07T00:00:00-03:00' }] } },
].map(event => ({ ...event, schedule: event.schedule as EventSchedule,
  pokemon: [...new Set(GOFEST_DAYS.filter(day => day.event === (event.id === 'mega-ascensao' ? 'MEGA ASCENSÃO' : 'MEGAFINAL')).flatMap(day => [...(day.superRaids ?? []), ...(day.specialRaids ?? []), ...day.slots.flatMap(slot => [...slot.wild, ...slot.raids])]))].map(key => { const p = GOFEST_POKEMON[key]; return { id: p.pokeApiId ?? p.fallbackPokeApiId!, name: p.name, types: p.types }; }),
}));

const firstPhase = local('2026-09-08T10:00', '2026-09-11T10:00');
const secondPhase = local('2026-09-11T10:00', '2026-09-14T20:00');

export const MEGA_SQUADS: GameEvent = {
  id: 'megaesquadroes-2026-09', name: 'Megaesquadrões', categoryId: 'general', imageId: 942, announced: '2026-08-31',
  summary: 'A aventura continua depois do Megafinal: estreias de Maschiff e Mabosstiff, Flamigo Brilhante e novas possibilidades para suas Megaevoluções.',
  schedule: local('2026-09-08T10:00', '2026-09-14T20:00'),
  featured: [pokemon(942, 'Maschiff'), pokemon(943, 'Mabosstiff'), pokemon(973, 'Flamigo', true)],
  pokemon: [pokemon(13, 'Weedle', true), pokemon(16, 'Pidgey', true), pokemon(821, 'Rookidee', true), pokemon(228, 'Houndour', true), pokemon(318, 'Carvanha', true)],
  megaRaids: [pokemon(10090, 'Mega Beedrill', true), pokemon(10048, 'Mega Houndoom', true)],
  highlights: [{ icon: '🐾', text: 'Maschiff e Mabosstiff estreiam' }, { icon: '✨', text: 'Flamigo Brilhante estreia' }, { icon: '⬆️', text: 'Super Nível Máximo' }, { icon: '◆', text: 'Mega Beedrill e Mega Houndoom' }, { icon: '🎟️', text: 'Bônus do Passe GO' }, { icon: '⭐', text: 'Duas Horas de Holofote' }, { icon: '🥚', text: 'Ovos de 5 km' }],
  sections: [
    { id: 'estreias', icon: '🐾', title: 'Maschiff e Mabosstiff', description: 'Maschiff, o Pokémon Traiçoeiro, e Mabosstiff, o Pokémon Chefe, estreiam no Pokémon GO.', items: ['Obtenha Maschiff em Ovos, Pesquisa de Campo e Passe GO.', 'Evolução: Maschiff + 50 Doces de Maschiff → Mabosstiff.'] },
    { id: 'flamigo', icon: '✨', title: 'Estreia de Flamigo Brilhante', items: ['Pela primeira vez, com sorte, será possível encontrar Flamigo Brilhante.', 'Flamigo poderá aparecer na natureza, em Pesquisas de Campo, pelo Passe GO e em Ovos.'] },
    { id: 'shiny-pidgey', icon: '✨', title: 'Pidgey: chance aumentada de Brilhante', schedule: firstPhase, items: ['Chance aumentada de encontrar Pidgey Brilhante de 8 de setembro, às 10h, a 11 de setembro, às 10h.'] },
    { id: 'shiny-carvanha', icon: '✨', title: 'Carvanha: chance aumentada de Brilhante', schedule: secondPhase, items: ['Chance aumentada de encontrar Carvanha Brilhante de 11 de setembro, às 10h, a 14 de setembro, às 20h.'] },
    { id: 'meganivel', icon: '⬆️', title: 'Super Nível Máximo', description: 'Mega Beedrill e Mega Houndoom poderão alcançar o Super Nível Máximo pela primeira vez.', items: ['Primeiro, alcance o terceiro Meganível: Nível Máximo → Super Nível Máximo.', 'Apenas Megaevoluir não basta: utilize Megaenergia do próprio Pokémon para continuar fortalecendo-o.', 'Participar de Megarreides e capturar Weedle, Pidgey, Houndour e Carvanha durante o evento ajudará a obter Megaenergia.'] },
    { id: 'ferrao', icon: '🐝', title: 'Mega Beedrill — Ferrão Letal+', description: 'Enquanto estiver Megaevoluído, Beedrill poderá usar um ataque carregado adicional.', items: ['Batalhas de Treinador: 40 pontos e aumento do Ataque do usuário em 1 nível.', 'Batalhas de Reide: 140 pontos.', 'O poder aumenta conforme o Meganível.'] },
    { id: 'pulso', icon: '🌑', title: 'Mega Houndoom — Pulso Sombrio+', items: ['Batalhas de Treinador: 60 pontos.', 'Batalhas de Reide: 150 pontos.', 'O poder aumenta conforme o Meganível.'] },
    { id: 'megarreides', icon: '◆', title: 'Mega Beedrill — Megarreides', schedule: local('2026-09-08T00:00', '2026-09-16T00:00'), description: 'Rotação de 8 a 15 de setembro, incluindo todo o último dia. Continua após o encerramento do evento principal.', items: ['Com sorte, será possível encontrar um Brilhante após as batalhas.'] },
    { id: 'megarreides-houndoom', icon: '◆', title: 'Mega Houndoom — Megarreides', schedule: local('2026-09-11T00:00', '2026-09-16T00:00'), description: 'Rotação de 11 a 15 de setembro, incluindo todo o último dia. Continua após o encerramento do evento principal.', items: ['Com sorte, será possível encontrar um Brilhante após as batalhas.'] },
    { id: 'passe', icon: '🎟️', title: 'Bônus do Passe GO', description: 'Conquistas Principais desbloqueiam bônus adicionais. Também haverá tarefas de bônus adicionais durante o evento.', items: ['Nível 1, a partir do Ranque 1: chance de receber Megaenergia ao capturar Weedle, Pidgey, Houndour, Carvanha ou suas evoluções.', 'Nível 2, a partir do Ranque 15: 2× Poeira Estelar.', 'Passe GO Deluxe, no Nível 2: metade da distância para chocar Ovos colocados em Incubadoras durante o evento.'] },
    { id: 'holofote-weedle', icon: '⭐', title: 'Hora de Holofote — Weedle', schedule: local('2026-09-10T18:00', '2026-09-10T19:00'), items: ['Weedle poderá ser Brilhante, com sorte.', 'Com sorte, também será possível encontrar Kakuna e Beedrill.'] },
    { id: 'holofote-houndour', icon: '⭐', title: 'Hora de Holofote — Houndour', schedule: local('2026-09-13T18:00', '2026-09-13T19:00'), items: ['Houndour poderá ser Brilhante, com sorte.', 'Com sorte, também será possível encontrar Houndoom.'] },
    { id: 'natureza', icon: '🌿', title: 'Encontros na natureza', items: ['Durante todo o evento: Weedle e Flamigo, ambos com possibilidade de Brilhante.', 'De 8 a 11 de setembro: Pidgey, Rookidee e outros Pokémon. Pidgey e Rookidee poderão ser Brilhantes.', 'De 11 a 14 de setembro: Houndour, Carvanha e outros Pokémon. Houndour e Carvanha poderão ser Brilhantes.'] },
    { id: 'ovos-primeira', icon: '🥚', title: 'Ovos de 5 km — primeira fase', schedule: firstPhase, description: 'Conteúdo apresentado originalmente como “Oferta gratuita”.', items: ['Emolga, Fletchling, Rookidee e Flamigo.', 'Com sorte, todos os Pokémon desta lista poderão nascer Brilhantes.'] },
    { id: 'ovos-segunda', icon: '🥚', title: 'Ovos de 5 km — segunda fase', schedule: secondPhase, items: ['Sandile, Pancham, Maschiff e Flamigo.', 'Sandile, Pancham e Flamigo poderão nascer Brilhantes, com sorte.'] },
    { id: 'campo-primeira', icon: '🔎', title: 'Pesquisa de Campo — primeira fase', schedule: firstPhase, items: ['Encontros possíveis: Weedle, Pidgey, Fletchling e Flamigo.', 'Com sorte, todos os Pokémon desta lista poderão ser Brilhantes.'] },
    { id: 'campo-segunda', icon: '🔎', title: 'Pesquisa de Campo — segunda fase', schedule: secondPhase, items: ['Encontros possíveis: Houndour, Carvanha, Nickit, Maschiff e Flamigo.', 'Houndour, Carvanha, Nickit e Flamigo poderão ser Brilhantes, com sorte.'] },
  ],
};

export const HORIZONS: GameEvent = {
  id: 'pokemon-horizontes-2026-09', name: 'Evento de celebração da série Pokémon: Horizontes', categoryId: 'general', imageId: 4,
  summary: 'Celebre Pokémon: Horizontes com Pokémon fantasiados, bônus do Passe GO, Reides, Vitrines e encontros surpresa!',
  schedule: local('2026-09-16T10:00', '2026-09-22T20:00'),
  featured: [pokemon(4, 'Charmander com óculos de aviador do Friede', true), pokemon(25, 'Pikachu usando o chapéu do Cap', true)],
  pokemon: [pokemon(926, 'Fidough', true), pokemon(940, 'Wattrel'), pokemon(113, 'Chansey', true), pokemon(133, 'Eevee', true), pokemon(856, 'Hatenna', true), pokemon(744, 'Rockruff', true)],
  raids: [pokemon(25, 'Pikachu usando o chapéu do Cap', true), pokemon(6, 'Charizard com óculos de aviador do Friede', true), pokemon(908, 'Meowscarada', true), pokemon(911, 'Skeledirge', true), pokemon(914, 'Quaquaval', true)],
  highlights: [{ icon: '🥽', text: 'Charmander fantasiado estreia' }, { icon: '✨', text: 'Shiny e Fundo Especial' }, { icon: '🎟️', text: 'Bônus progressivos do Passe GO' }, { icon: '🔎', text: 'Mais Kecleon' }, { icon: '⚔️', text: 'Reides especiais' }, { icon: '📸', text: 'Encontros surpresa' }],
  sections: [
    { id: 'fantasiados', icon: '🥽', title: 'Óculos de aviador do Friede', description: 'Charmander com óculos de aviador do Friede estreia no evento.', items: ['Encontre-o na natureza, em Pesquisas de Campo, em Módulos Atrair regulares e pelo Passe GO.', 'Charmander + 25 Doces → Charmeleon com óculos de aviador do Friede.', 'Charmeleon + 100 Doces → Charizard com óculos de aviador do Friede.', 'Com sorte, Charmander poderá ser Brilhante ou possuir Fundo Especial.', 'As artes e entradas da Pokédex representam as espécies em suas formas normais; as fantasias estão identificadas nos nomes.'] },
    { id: 'bonus', icon: '🎟️', title: 'Bônus e Conquistas Principais do Passe GO', items: ['Maior chance de encontrar Kecleon em Poképaradas.', 'Nível 1, a partir do Ranque 1: 2× Doces por captura; Passe GO Deluxe: 3× Doces por captura.', 'Nível 2, a partir do Ranque 10: Módulos Atrair regulares durarão 1 hora e poderão atrair o Pokémon em destaque.', 'Nível 3, a partir do Ranque 20: Poeira Estelar adicional ao capturar Hatenna e Wattrel.', 'Também haverá tarefas de bônus adicionais para o Passe GO.'] },
    { id: 'natureza', icon: '🌿', title: 'Encontros na natureza', items: ['Charmander com óculos de aviador do Friede; com sorte, Pikachu usando o chapéu do Cap.', 'Ambos poderão ser Brilhantes, com sorte.'] },
    { id: 'grupo-um', icon: '☀️', title: 'Grupo 1 — das 5h às 17h', items: ['Fidough, Wattrel e outros Pokémon; com sorte, Chansey.', 'Fidough e Chansey poderão ser Brilhantes.'] },
    { id: 'grupo-dois', icon: '☀️', title: 'Grupo 2 — das 5h às 17h', description: 'Os dois grupos foram informados com o mesmo horário (5h–17h). Os horários foram preservados e aguardam revisão.', items: ['Eevee, Hatenna e outros Pokémon; com sorte, Rockruff.', 'Eevee, Hatenna e Rockruff poderão ser Brilhantes.'] },
    { id: 'reides', icon: '⚔️', title: 'Reides temáticas', items: ['Uma estrela: Pikachu usando o chapéu do Cap.', 'Três estrelas: Charizard com óculos de aviador do Friede, Meowscarada, Skeledirge e Quaquaval.', 'Com sorte, os Pokémon dessas Reides poderão ser Brilhantes ou possuir Fundo Especial.'] },
    { id: 'campo', icon: '🔎', title: 'Pesquisa de Campo', items: ['Tarefas temáticas concederão encontros com Pokémon relacionados ao evento.'] },
    { id: 'vitrines', icon: '🏆', title: 'Vitrines de Poképarada', items: ['Haverá Vitrines em diferentes Poképaradas, com uma nova categoria em destaque a cada dia.'] },
    { id: 'fotos', icon: '📸', title: 'Encontros surpresa', items: ['Tire fotos durante o evento para ter encontros surpresa com personagens e Pokémon da série Pokémon: Horizontes.'] },
  ],
};

const phantumpSchedule = local('2026-09-26T10:00', '2026-09-26T20:00');
export const PHANTUMP_CATCH_MASTERY: GameEvent = {
  id: 'mestre-captura-phantump-2026-09', name: 'Mestre da Captura: Phantump', categoryId: 'general', imageId: 708, announced: '2026-08-27',
  summary: 'Aperfeiçoe seus lançamentos com Phantump, o Pokémon Toco! Mais chances de Brilhantes e recompensas por boas jogadas ou superiores.',
  schedule: phantumpSchedule,
  featured: [pokemon(708, 'Phantump', true)],
  pokemon: [pokemon(420, 'Cherubi', true), pokemon(425, 'Drifloon', true)],
  highlights: [{ icon: '👻', text: 'Phantump em destaque' }, { icon: '✨', text: 'Chance aumentada de Brilhantes' }, { icon: '⭐', text: '2× PE com boas jogadas ou superiores' }, { icon: '🍬', text: 'Mais Doces nessas capturas' }, { icon: '🔎', text: 'Pesquisa gratuita' }, { icon: '🎟️', text: 'Pesquisa paga: US$ 1,99' }],
  sections: [
    { id: 'destaque', icon: '👻', title: 'Phantump, o Pokémon Toco', items: ['Disponível pela Pesquisa de Campo, pela Pesquisa Temporária gratuita e pela Pesquisa Temporária paga.', 'Durante o evento, haverá chance aumentada de encontrar Phantump Brilhante.'] },
    { id: 'bonus', icon: '⭐', title: 'Bônus por boas jogadas ou superiores', description: 'Os bônus se aplicam às capturas realizadas com boas jogadas ou superiores.', items: ['2× PE nessas capturas.', 'Mais Doces por captura nessas jogadas.'] },
    { id: 'natureza', icon: '🌿', title: 'Encontros na natureza', items: ['Cherubi e Drifloon aparecerão com mais frequência.', 'Ambos terão maior chance de serem encontrados Brilhantes.'] },
    { id: 'campo', icon: '🔎', title: 'Pesquisa de Campo', description: 'Tarefas focadas em lançamentos de Poké Bolas.', items: ['Encontros possíveis: Cherubi, Drifloon e Phantump.', 'Cherubi e Drifloon poderão ser Brilhantes, com sorte; Phantump terá chance aumentada de ser Brilhante.'] },
    { id: 'gratuita', icon: '🎁', title: 'Pesquisa Temporária gratuita', description: 'Pesquisa focada na captura de Phantump, disponível durante o evento.', items: ['Encontros com Phantump ao concluir tarefas, com chance aumentada de Brilhante.', 'PE, Poeira Estelar e outras recompensas.'] },
    { id: 'paga', icon: '🎟️', title: 'Pesquisa Temporária paga — US$ 1,99', description: 'Pesquisa exclusiva por US$ 1,99 ou o equivalente na moeda local.', items: ['Encontros adicionais com Phantump, com chance aumentada de Brilhante.', 'PE, Poeira Estelar e outras recompensas.'] },
    { id: 'presentes', icon: '🎁', title: 'Presentear ingressos', items: ['Presenteie amigas ou amigos com nível de Grande Amizade ou superior.', 'As compras, incluindo presentes, não são reembolsáveis, salvo exigência legal ou exceções previstas nos Termos de Serviço.', 'Não é possível comprar com Pokémoedas.'] },
    { id: 'prazo', icon: '⏳', title: 'Prazo da Pesquisa Temporária', schedule: phantumpSchedule, description: 'Conclua todas as tarefas e resgate as recompensas antes de sábado, 26 de setembro de 2026, às 20h, no horário local.', items: ['A Pesquisa Temporária expira: não deixe as recompensas para depois do prazo.'] },
  ],
};
