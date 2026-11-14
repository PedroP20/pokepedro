# Publicação do lobby e da Game Arena — 07/10/2026

## Deploy Result

- **URL**: https://pokepedro.vercel.app/
- **Target**: production.
- **Status**: READY.
- **Commit**: `d3f0659`, com as alterações autorizadas ainda não commitadas do checkout atual. Publicação pela CLI; nenhum commit ou push foi feito.
- **Framework**: Next.js 16.4.0; Node.js 24.x no Vercel.
- **Build Duration**: 18 segundos; etapa posterior ao build de 25 segundos.
- **Projeto**: `pokepedro`, `prj_MsL0QUNTsPlwLAV8j4qGNEZT57v9`, equipe `pedropauloephgmailcoms-projects`.
- **Deployment**: `dpl_CXbrwToFPaqrhLpd3Hc2UZE7jQLQ`.
- **URL imutável**: https://pokepedro-3ojolfedr-pedropauloephgmailcoms-projects.vercel.app/

O build foi criado com `--prod --skip-domain`, verificado e promovido sem reconstrução. A consulta ao domínio público e ao projeto confirmou que o deployment acima é o deployment ativo de produção.

## Revisão e evidências

O fluxo revisado parte da configuração no lobby, prepara a fila pelo catálogo ou as combinações de tipos, inicia o store de jogo, busca dados na PokéAPI e renderiza a arena. Pontuação, aprendizado, retomada e progresso continuam usando os stores existentes. A revisão não encontrou uma falha que exigisse outra alteração no código de produção.

| Verificação | Evidência |
| --- | --- |
| `npm test` | Passou: ingestão e retenção de eventos, fuso/DST, catálogo, filtros, tipos, jogos, pontuação, retomada, áudio, 3D e autenticação com Firebase simulado |
| `npm run lint` | Passou |
| `npm run build` local | Passou, incluindo TypeScript e geração de 17 páginas |
| Build remoto | Compilação, TypeScript e geração concluídos; READY |
| `npm audit --omit=dev` | Zero vulnerabilidades reportadas nas dependências de produção |
| Arquivos enviados | 113 arquivos; manifesto de 1.264.533 bytes. Ambientes, `.vercel`, `.git`, dependências instaladas e auxiliar de QA excluídos |
| Fonte conferida | Novas páginas `/play` e `/game`, `ArenaShell`, `GameGlyph` e `arena.css` incluídos no manifesto |
| Deployment antes da promoção | `/play`, `/game`, catálogo e agenda: 200; cron sem autorização: 401; `/design-preview`: 404 |
| Navegador no deployment | Pokédex, busca e ficha de Umbreon; seleção de Charizard em Combate com multiplicadores corretos; agenda e login de visitante; tela de arena sem partida |
| HTTP público após promoção | 21 respostas esperadas: páginas, detalhes, manifest e assets disponíveis, redirecionamentos antigos preservados, cron protegido e auxiliar de QA ausente |
| Catálogo público | 1.025 espécies, IDs 1 a 1.025, nenhuma entrada sem tipos |
| Agenda pública | `health: ok`, 19 eventos, 14 com fonte oficial, retenção de 7 dias |
| Autenticação existente em produção | Sessão restaurada; lobby e botão de início disponíveis após a sincronização |
| Partida em produção | Clássico em Kanto e ordem da Pokédex abriu Bulbasaur com quatro alternativas; início dos cinco modos verificado |
| Aprender e Versus em produção | Aprender avançou da ficha para alternativas sem contabilizar resposta; Versus carregou Pokémon, alternativas e os dois treinadores |
| Áudio em produção | Arquivo do Pokémon atual carregou (`readyState: 4`) e reproduziu após toque, sem erro no elemento de áudio |
| Layout em produção | Lobby, arena e quizzes em 390 px sem overflow horizontal; botão fixo do mobile iniciou o quiz. Desktop também conferido |
| Console do navegador | Nenhum erro nos fluxos de produção verificados |

Os fluxos completos de respostas, comparação, conclusão, reinício, evolução, aprendizado em três etapas, áudio entre Pokémon, turnos, quiz Mestre e retomada foram verificados localmente antes desta publicação, conforme [game-redesign-2026-10-07.md](game-redesign-2026-10-07.md). Os testes automatizados foram executados novamente nesta revisão.

O manifesto obtido com `vercel deploy --dry --json` tem SHA-256 `E571C52528F3AD4B4EF833D83988072B15F57F5D5FA20E04E6C64ECAB573F0B1`. A reprodução exata desta versão depende do conteúdo do checkout, incluindo arquivos não commitados, e não apenas do commit-base.

## Post-Deploy Observability

- **Error scan**: consulta de erros limitada a este deployment, com `--level error --since 1h --limit 100`; nenhum registro de erro retornado após a publicação.
- **Drains**: zero configurados na equipe consultada.
- **Monitoring**: logs de execução do Vercel disponíveis e consultados; nenhuma nova integração de monitoramento foi instalada.
- **Cron**: ativo no novo deployment, `/api/events/sync`, agenda diária `0 9 * * *` (09:00 UTC).

As seis variáveis públicas do Firebase e o secret privado do cron estão presentes em produção. Nenhum valor privado foi adicionado ao upload ou ao relatório.

## Limites e recuperação

Os testes do navegador em produção usaram partidas rápidas e não registraram respostas de teste na conta. Salvamento e restauração foram exercitados pelos testes de stores com Firebase simulado; novas gravações de respostas em dados pessoais de produção e um novo login Google não foram executados nesta publicação. A sessão já existente foi restaurada normalmente no navegador.

A revisão confirma os fluxos e respostas observados; não representa uma garantia de disponibilidade futura das APIs externas. O deployment anterior permanece disponível para recuperação: `dpl_BoJwH4dGaAyBzWnrP5AtMo3EzfKg`.
