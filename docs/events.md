# Central de Eventos

A aba fica em `/events`. O GOFEST original está em `/events/gofest`, com o mesmo store e a mesma chave `pokepedro-gofest-2026`. `/gofest` redireciona para esse caminho.

## Cadastro

Adicione categorias em `src/lib/events.ts` e eventos confirmados em `src/lib/eventCatalog.ts`, usando `GameEvent`. A categoria `live` é uma visão calculada: não cadastre eventos nela. Os IDs dos eventos devem ser únicos, estáveis e adequados a uma URL. As imagens de categoria são ilustrativas; não representam uma programação confirmada.

Cada evento pode ter Pokémon, destaques, bônus, reides, Mega Raids, reides de cinco estrelas, batalhas Max, pesquisas, recompensas e notas. A rota `/events/[eventId]` monta os detalhes automaticamente. `id` de um Pokémon é seu ID na PokéAPI; para formas alternativas, informe `dexNumber` separadamente. Só marque `shiny: true` quando confirmado. O modal da Pokédex é carregado ao abrir um Pokémon e reutiliza o cache existente.

## Horários

- `schedule.mode: 'local'`: use `2026-09-04T18:00`, sem offset. Cada aparelho interpreta 18h no próprio fuso.
- `schedule.mode: 'absolute'`: use `2026-09-04T18:00:00-03:00` ou UTC com `Z`. O instante é fixo e a exibição é convertida ao fuso do usuário. Para eventos em cidades com horário de verão, cadastre o offset correto de cada ocorrência.
- `windows` contém sessões independentes. Não una sessões com intervalos sem atividade. O início é inclusivo e o término exclusivo. Eventos de dia inteiro terminam à meia-noite do dia seguinte.
- Sem programação confirmada, omita `schedule`; o evento não recebe status ao vivo.
- O GOFEST mantém o período e o fuso de sua programação original. Seus horários detalhados continuam na tela original.

O relógio atualiza a cada segundo e ao retomar a aba. Hoje, amanhã e calendário usam o dia do aparelho. Esta semana corresponde a segunda a domingo. O calendário usa sobreposição de intervalos, incluindo eventos que atravessam a meia-noite. Eventos encerrados permanecem consultáveis.

Favoritos são persistidos neste navegador, sem alterar o checklist. O campo opcional `reminder` é reservado para uma futura integração de notificações; não solicita permissão nem agenda notificações atualmente.

## Verificação

Execute `node scripts/test-events.mjs`, `npx tsc --noEmit` e `npm run build`.
