import type { EventSchedule, GameEvent } from './events';

const mainSchedule: EventSchedule = {
  mode: 'local', label: 'Evento principal · horário local',
  windows: [{ start: '2026-09-19T14:00', end: '2026-09-19T17:00' }],
};

export const STARAPTOR_SUPER_MEGA: GameEvent = {
  id: 'staraptor-super-megarreides-2026-09', name: 'Dia de Super Megarreides — Staraptor',
  categoryId: 'super-mega', imageId: 398, announced: '2026-09-01',
  summary: 'Mega Staraptor estreia em Super Megarreides! Descubra o Super Nível Máximo, o ataque Pássaro Bravo+ e os bônus para aproveitar cada batalha.',
  schedule: mainSchedule,
  // Use Staraptor's real Pokédex entry and artwork, not a made-up Mega form ID.
  featured: [{ id: 398, dexNumber: 398, name: 'Staraptor', types: ['Normal', 'Voador'], shiny: true }],
  highlights: [
    { icon: '◆', text: 'Estreia de Mega Staraptor' },
    { icon: '⬆️', text: 'Super Nível Máximo' },
    { icon: '🪽', text: 'Pássaro Bravo+ · 70 PvP / 150 Reides' },
    { icon: '🎟️', text: 'Até 6 passes gratuitos' },
    { icon: '✨', text: 'Maior chance de Shiny' },
    { icon: '🌐', text: 'Até 20 Reides a Distância' },
    { icon: '🔓', text: 'Meganível 1 desbloqueado' },
    { icon: '🔎', text: 'Pesquisa com passe e Gardevoir' },
    { icon: '🛍️', text: 'Ingresso: US$ 4,99' },
    { icon: '🎁', text: 'Com ingresso: até 14 passes e bônus' },
  ],
  sections: [
    { id: 'estreia', icon: '◆', title: 'Estreia de Mega Staraptor', description: 'Mega Staraptor fará sua estreia no Pokémon GO através das Super Megarreides.', items: ['Com sorte, será possível encontrar Staraptor Brilhante após as batalhas.', 'A arte e a entrada da Pokédex exibidas nesta página são de Staraptor em sua forma normal.'] },
    { id: 'meganivel', icon: '⬆️', title: 'Novo Meganível: Super Nível Máximo', description: 'Mega Staraptor poderá alcançar, pela primeira vez, o Super Nível Máximo.', items: ['Primeiro, eleve o Pokémon até o terceiro Meganível, o Nível Máximo.', 'Depois, continue fortalecendo-o até o Super Nível Máximo.', 'Megaevoluir não será suficiente: participe de Megarreides e utilize Megaenergia do próprio Pokémon para continuar fortalecendo-o.'] },
    { id: 'ataque', icon: '🪽', title: 'Novo ataque carregado: Pássaro Bravo+', description: 'Pokémon elegíveis ao Super Nível Máximo poderão utilizar um ataque carregado adicional enquanto estiverem Megaevoluídos. Mega Staraptor poderá utilizar Pássaro Bravo+.', items: ['Batalhas de Treinador: 70 pontos de dano; reduz a Defesa do próprio usuário em 3 estágios.', 'Batalhas de Reide: 150 pontos de dano.', 'O poder do ataque aumentará de acordo com o Meganível do Pokémon.'] },
    { id: 'bonus', icon: '🎟️', title: 'Bônus gratuitos do evento', schedule: mainSchedule, items: ['Receba até 6 Passes de Reide gratuitos ao girar Fotodiscos em Ginásios.', 'Staraptor capturados em Super Megarreides terão o Meganível 1 desbloqueado.', 'Maior chance de encontrar Staraptor Brilhante em Super Megarreides.'] },
    {
      id: 'reides-distancia', icon: '🌐', title: 'Limite de Reides a Distância: 20',
      description: 'O limite de Reides a Distância aumentará para 20 durante este período especial. Os horários abaixo são convertidos para o seu fuso.',
      schedule: { mode: 'absolute', label: 'Período global · PDT (UTC−7)', windows: [{ start: '2026-09-18T17:00:00-07:00', end: '2026-09-19T20:00:00-07:00' }] },
      items: ['Início: sexta-feira, 18/09, às 17h PDT — 21h em Brasília.', 'Fim: sábado, 19/09, às 20h PDT — domingo, 20/09, à 0h em Brasília.'],
    },
    { id: 'pesquisa', icon: '🔎', title: 'Pesquisa Temporária', description: 'Uma Pesquisa Temporária estará disponível durante o evento.', items: ['Recompensas: 1 Passe de Batalha Premium e 1 encontro com Gardevoir.', 'A pesquisa possui prazo limitado. Conclua as tarefas e resgate as recompensas antes do encerramento da Pesquisa Temporária.'] },
    { id: 'ingresso', icon: '🛍️', title: 'Ingresso do evento — US$ 4,99', description: 'US$ 4,99 ou o preço equivalente na moeda local. Os benefícios do ingresso ficam ativos em 19 de setembro, das 14h às 17h, no horário local.', schedule: mainSchedule, items: ['Até 14 Passes de Reide gratuitos ao girar Fotodiscos em Ginásios.', 'Maior chance de receber Doce Raro GG em Batalhas de Reide.', '+5.000 PE em Batalhas de Super Megarreide.', '+5.000 Poeira Estelar em Batalhas de Super Megarreide.'] },
    { id: 'presentes', icon: '🎁', title: 'Presentear ingressos', description: 'Compre o ingresso como presente para amigas ou amigos com nível de Grande Amizade ou superior.', items: ['Compras, incluindo presentes, não são reembolsáveis, salvo quando exigido por lei ou previsto nos Termos de Serviço.', 'Ingressos não podem ser comprados utilizando Pokémoedas.'] },
    { id: 'disponibilidade', icon: '⏳', title: 'Disponibilidade do ingresso', description: 'O ingresso ficará disponível na loja do jogo somente até sábado, 19 de setembro de 2026, às 17h, no horário local.', items: ['Os bônus do ingresso são válidos das 14h às 17h do dia do evento.'] },
  ],
};
