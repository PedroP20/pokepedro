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

O relógio atualiza a cada segundo e ao retomar a aba. Hoje, amanhã e calendário usam o dia do aparelho. Esta semana corresponde a segunda a domingo. O calendário usa sobreposição de intervalos, incluindo eventos que atravessam a meia-noite. Eventos encerrados permanecem consultáveis por sete dias após o término.

Favoritos são persistidos neste navegador, sem alterar o checklist. O campo opcional `reminder` é reservado para uma futura integração de notificações; não solicita permissão nem agenda notificações atualmente.

## Verificação

Execute `node scripts/test-events.mjs`, `npx tsc --noEmit` e `npm run build`.

## Atualização automática do Pokémon GO

`GET /api/events` consulta os anúncios públicos em `https://pokemongo.com/pt-BR/news`. O importador roda exclusivamente no servidor, com cache de uma hora. A tela consulta a agenda ao abrir, ao recuperar o foco e a cada 15 minutos. Um snapshot de metadados permite mostrar os cards imediatamente enquanto os detalhes são atualizados. Atualizações que falham não substituem o último resultado bem-sucedido por uma lista vazia.

A consulta começa no mês atual e segue a navegação publicada pela fonte, incluindo outros meses e anos disponíveis, sem uma lista fixa de meses nem limite de 40 anúncios. O importador aceita os eventos em JSON-LD e os registros do calendário enviados no HTML/RSC. Nunca executa scripts da fonte. As categorias numéricas do calendário são preservadas; tópicos novos ganham uma categoria navegável automaticamente.

Em 07/10/2026, o calendário exige login. A sessão usada no navegador não é compartilhada com o servidor Vercel. Foi feita uma consulta autorizada em outubro e novembro: 58 eventos únicos, em 16 tópicos. Novembro contém cinco eventos que atravessam o mês, já presentes em outubro; a navegação oficial não oferecia um mês seguinte. `src/data/calendar-events.json` guarda somente metadados públicos desses eventos. Não contém cookies, senha, conta, localização nem encontros/RSVPs do jogador.

Quando a consulta pública pede login, a API combina esse calendário importado com os anúncios que continuam sendo atualizados automaticamente. A cobertura é `calendar-snapshot`, e a data da consulta ao calendário fica separada da atualização dos anúncios. A interface informa que novas entradas exclusivas do calendário precisam de uma nova consulta autenticada. **Não há acesso autenticado automático do Vercel ao calendário nesta implementação.** Uma atualização integral automática requer uma integração autorizada e persistente com essa fonte; o login no navegador, sozinho, não a fornece.

Caso a fonte passe a fornecer os registros sem login, os meses vinculados no HTML passam a ser lidos automaticamente. Uma falha geral na fonte preserva a agenda anterior. Anúncios ausentes (HTTP 404/410) não derrubam os eventos do calendário: o link do evento aponta para o calendário oficial.

Cada anúncio reconhecido gera um ID estável, categoria, período principal, seções com informações, Pokémon identificados pelo catálogo e URLs das imagens oficiais. Os IDs do calendário são baseados no identificador oficial, evitando repetir eventos entre meses. Um anúncio vinculado enriquece o mesmo evento com detalhes e horários precisos, mantendo a categoria oficial. Links e favoritos antigos continuam funcionando por aliases. Ocorrências semanais distintas permanecem separadas mesmo quando usam o mesmo anúncio. Os cards, busca, calendário e página de detalhes compartilham o mesmo feed. Os textos são tratados como texto simples; HTML e scripts externos não são executados. Só são aceitas páginas HTTPS dos domínios oficiais e imagens de hosts conhecidos. As imagens são carregadas da fonte, com atribuição e acesso ao anúncio original.

O intervalo principal vem da introdução do evento, nunca da data de publicação. Prazos de pesquisas e ingressos permanecem nas seções correspondentes. Datas sem horários confirmados são exibidas como “horário a confirmar”, sem status ao vivo. Anúncios sem intervalo reconhecido são ignorados para evitar inventar uma programação. Anúncios sem categoria explícita entram em “Eventos”; tópicos desconhecidos do calendário mantêm o nome oficial e recebem sua própria categoria. Listas cronológicas de sessões sem ano explícito continuam no próximo ano ao passar de dezembro para um mês anterior; anos explícitos têm prioridade.

Eventos encerrados ficam na agenda durante **168 horas após o último término**. A remoção é calculada em cada resposta da API e a cada segundo no aparelho, inclusive ao retomar a aba. Em eventos de horário local, a tela usa o fuso do treinador; o servidor mantém uma margem para UTC-12 para não remover um evento antecipadamente. Favoritos antigos não fazem o evento voltar à agenda. O checklist histórico do GO Fest continua sendo uma ferramenta separada.

### Rotina na Vercel

`vercel.json` agenda `/api/events/sync` diariamente às 09:00 UTC (06:00 em Brasília). A rota exige `Authorization: Bearer <CRON_SECRET>`. Configure `CRON_SECRET` como variável privada no projeto Vercel e publique o código para ativar essa rotina. No desenvolvimento local o cron não é executado; a abertura da agenda já consulta a fonte. O endpoint programado aquece o mesmo cache usado pelo público, sem permitir que visitantes forcem atualizações ilimitadas.

A atualização de hora em hora depende de acesso ao app; o cron garante uma consulta diária mesmo sem visitas. Esse comportamento usa o Data Cache do Next.js e requer uma hospedagem que o suporte, como a Vercel. A atualização dos anúncios públicos não depende de credenciais Pokémon GO. O calendário autenticado permanece uma importação separada, com data própria.

Para atualizar o snapshot inicial antes de publicar, use `npm run events:update`. O comando consulta a mesma fonte, aplica a retenção e grava apenas metadados em `src/data/official-events.json`. Os detalhes completos são consultados em tempo de execução. Não há requisições à fonte no build.

### Validação da integração

`npm test` inclui fixtures sintéticas de anúncios, categorias, datas, mudança de mês/ano, meia-noite, prazo de pesquisa distinto do evento, múltiplos períodos, URLs inválidas, calendário autenticado, falha de rede, autorização do cron e retenção em três fusos. Também execute `npm run lint`, `npx tsc --noEmit` e `npm run build`.

### Atualizar a importação do calendário autenticado

Após uma consulta autorizada no navegador, exporte somente os campos públicos dos eventos em um JSON no formato `{ capturedAt, months: [{ month, events }] }`. `month` é o slug oficial, por exemplo `october-2026`. Os registros devem conter `eventId`, `title`, `startTimeUnixMs`, `endTimeUnixMs`, `eventType` e, quando disponíveis, `imageUrl`, `blogUrl` e `pokemon` (`nameKey`, `imageUrl`). Não exporte o HTML inteiro nem dados de sessão/conta.

Execute `npm run events:calendar-import -- caminho-do-arquivo.json`, seguido de `npm run events:update`. A importação valida todos os registros antes de substituir o snapshot e seleciona somente campos de eventos. O segundo comando atualiza os anúncios e regenera os metadados usados para a exibição imediata. Os textos completos dos anúncios continuam sendo consultados em tempo de execução.

`npm test` também cobre os frames RSC divididos em scripts, navegação entre vários meses, ciclos de links, todos os registros sem limite de 40, categorias novas, horários locais, meia-noite inclusiva da fonte, imagens oficiais, ausência de dados de conta, duplicações, ocorrências semanais, favoritos antigos, anúncios removidos e mudança de ano.
