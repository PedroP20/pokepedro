# Jogar e Game Arena — revisão de 7 de outubro de 2026

Reformulação completa do lobby, do jogo em andamento, dos desafios de tipos e do resultado final. O lobby organiza modo, região e preferências em etapas, com resumo da partida e lançamento animado. A arena tem palco próprio, HUD, alternativas, digitação, comparação de respostas, ficha do Pokémon e placares por treinador.

Preservados os filtros, modos, regras de pontuação, aprendizado em três etapas, turnos, evolução, retomada e reinício. A troca de um quiz de tipos para Versus agora configura uma disputa de Pokémon corretamente. Respostas e comparações reiniciam a cada Pokémon; uma nova rodada retorna ao cabeçalho. O quiz de tipos retomado apresenta o resultado da resposta já registrada.

Validação concluída:
- npm run lint e npx tsc --noEmit sem erros.
- npm test passou: eventos, catálogo, filtros, API, pontuação, retomada, modelos 3D, áudio e autenticação com Firebase simulado.
- npm run build passou, incluindo TypeScript e geração de todas as rotas.
- Navegador: início pelo lobby, resposta correta e incorreta, evolução, conclusão, reinício, digitação, três etapas de Aprender, áudio de Pikachu e Charizard, quiz Rápido, quiz Mestre com repetição e respostas sem acentos, avanço automático, turnos e pódio Versus, retomada da partida salva e aviso de filtros sem resultados.
- Layouts inspecionados em 320, 390, 768 e 1280 pixels, sem overflow horizontal. Ações no mobile permanecem acessíveis; animações respeitam a preferência de movimento reduzido.
- O auxiliar temporário de QA foi removido. Na versão otimizada local, /play e /game retornaram 200 e /design-preview retornou 404.

Os registros de respostas e conquistas usados na verificação visual foram substituídos por operações locais sem contabilizar respostas de teste na conta. A autenticação e as gravações reais não foram alteradas no código entregue.

Reformulação publicada em https://pokepedro.vercel.app/ no deployment `dpl_CXbrwToFPaqrhLpd3Hc2UZE7jQLQ`. A revisão e as evidências da publicação estão em [release-game-2026-10-07.md](release-game-2026-10-07.md).
