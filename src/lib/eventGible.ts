import type { GameEvent } from './events';

const extendedSchedule = { mode: 'local' as const, windows: [{ start: '2026-09-12T14:00', end: '2026-09-12T21:00' }] };

export const GIBLE_COMMUNITY_CLASSIC: GameEvent = {
  id: 'gible-classico-2026-09', name: 'Gible — Dia Comunitário Clássico', categoryId: 'community-classic', imageId: 443,
  announced: '2026-08-31',
  summary: 'O Pokémon Tubarão Terrestre toma conta da natureza! Encontre mais Gible, aproveite 3× PE por captura e evolua seu Garchomp com Poder da Terra.',
  schedule: { mode: 'local', label: 'Evento principal · horário local', windows: [{ start: '2026-09-12T14:00', end: '2026-09-12T17:00' }] },
  featured: [{ id: 443, name: 'Gible', dexNumber: 443, types: ['Dragão', 'Terrestre'], shiny: true }],
  highlights: [
    { icon: '✨', text: 'Shiny disponível' }, { icon: '🖼️', text: 'Fundo Especial' },
    { icon: '⭐', text: '3× PE por captura' }, { icon: '🌎', text: 'Poder da Terra' },
    { icon: '🧲', text: 'Módulo Atrair até 21h' }, { icon: '🎟️', text: 'Pesquisa: US$ 1,99' },
  ],
  sections: [
    { id: 'encontros', icon: '🦈', title: 'Encontros na natureza', description: 'Gible, o Pokémon Tubarão Terrestre, aparecerá com muito mais frequência durante o evento.', items: ['Com sorte, você poderá encontrar Gible Brilhante.', 'Alguns Gible encontrados também poderão possuir um Fundo Especial.'] },
    { id: 'bonus', icon: '⭐', title: 'Bônus do evento', description: 'Bônus principais: 12 de setembro, das 14h às 17h, no horário local.', items: ['3× PE ao capturar Pokémon.', 'Incensos ativados durante o evento durarão 3 horas. Não se aplica ao Incenso de Aventura Diário.', 'Tire fotos durante o evento para receber uma surpresa.', 'Módulos Atrair ativados durarão 1 hora e poderão atrair Gible. Esse bônus se estende das 14h às 21h.'] },
    { id: 'colecao', icon: '🏅', title: 'Mega Desafio de Coleção', description: 'Um Desafio de Coleção temático estará disponível durante o evento. Evolua Gible e Gabite para concluí-lo.', items: ['Recompensas: PE, Poeira Estelar e Megaenergia do Garchomp.'] },
    { id: 'ataque', icon: '🌎', title: 'Ataque em destaque: Poder da Terra', description: 'Evolua Gabite para Garchomp a partir do início do evento e até as 21h de 12 de setembro para obter o ataque carregado Poder da Terra.', schedule: extendedSchedule, items: ['Batalhas de Treinador: 90 pontos de poder.', 'Ginásios e Reides: 100 pontos de poder.'] },
    { id: 'modulo', icon: '🧲', title: 'Mais Gible com Módulos Atrair', description: 'A aventura continua depois das 17h! Bônus especial ativo em 12 de setembro, das 14h às 21h, no horário local.', schedule: extendedSchedule, items: ['Gible terá uma probabilidade muito alta de aparecer em Poképaradas com Módulos Atrair comuns ativos.', 'Módulos Atrair ativados nesse período durarão 1 hora.', 'Gible atraídos dessa maneira terão maior chance de serem Brilhantes e poderão possuir um Fundo Especial.'] },
    { id: 'pesquisa-especial', icon: '🎟️', title: 'Pesquisa Especial do Dia Comunitário', description: 'Pesquisa Especial exclusiva do Clássico com Gible por US$ 1,99 ou o preço equivalente na moeda local. Os ingressos serão disponibilizados posteriormente na loja.', items: ['3 encontros com Gible com Fundo Especial.', 'Encontros adicionais com Gible.', '1 Passe de Batalha Premium.', '1 Doce Raro GG e outras recompensas.'] },
    { id: 'presente', icon: '🎁', title: 'Presenteie um amigo', description: 'Você também poderá comprar e presentear o ingresso a amigas ou amigos com nível de Grande Amizade ou superior.', items: ['Na Loja, abra o ingresso da Pesquisa Especial e selecione Presente em vez de Comprar.'] },
    { id: 'pesquisa-campo', icon: '🔎', title: 'Pesquisa de Campo', description: 'Pesquisa de Campo temática do Clássico do Dia Comunitário de setembro, com tarefas de capturar Gible.', items: ['Recompensas: Poeira Estelar, Grandes Bolas, encontros adicionais com Gible e outras recompensas.', 'Com sorte, algumas pesquisas também poderão conceder encontros com Gible com Fundo Especial.'] },
    { id: 'loja', icon: '🛍️', title: 'Combo Ultraespecial Dia Comunitário', description: 'Disponível na Loja Online Pokémon GO por US$ 1,99 ou o equivalente na moeda local.', items: ['1 ingresso para o evento.', '5 Ultra Bolas.'] },
  ],
};
