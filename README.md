# PokéClub 2.0

Clube Pokémon com Pokédex, análise de tipos, treinos, conquistas, perfil e agenda de Pokémon GO. Construído com Next.js, React, TanStack Query, Zustand e Firebase.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra http://localhost:3000. As variáveis do Firebase estão descritas em `.env.example`; configure sua cópia em `.env.local` para habilitar a conta Google e o progresso na nuvem.

## Validação

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Catálogo da Pokédex

O arquivo versionado `public/data/pokemon.json` contém as 1.025 espécies, nomes, tipos, altura, peso e possibilidade de evolução. A abertura da Pokédex, os filtros, a seleção no Combate e os desafios de tipos usam esse catálogo local. Descrições, formas e famílias evolutivas são consultadas na PokéAPI quando uma ficha é aberta; imagens dos cards carregam por página.

Para atualizar os dados e as ilustrações locais do início:

```bash
npm run catalog:update
```

Esse comando precisa de internet e usa os CSVs oficiais do [repositório da PokéAPI](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv) e as imagens do [repositório de sprites](https://github.com/PokeAPI/sprites). O build normal usa os arquivos existentes e não executa a atualização.

## Identidade e comportamento

- Início com boas-vindas, atalhos e sugestões de treino.
- Navegação imediata, menu mobile com diálogo nativo, foco e fechamento por Escape.
- Pokédex paginada com imagens centralizadas e filtros locais.
- Combate com seleção de espécie ou tipos, defesa, ataque e guia.
- Perfil com passe de treinador, estatísticas, maestria e conquistas reais.
- Login, treinos, revisão e eventos com a identidade azul, vermelha e amarela do clube.
- Layouts adaptados a desktop e mobile, com respeito à preferência de movimento reduzido.

Os identificadores antigos do armazenamento local foram preservados para manter a compatibilidade com o progresso e as partidas salvas. A autenticação libera a interface antes da sincronização; o início de partidas aguarda o progresso da nuvem.

Projeto de fãs. Pokémon e seus personagens pertencem aos respectivos criadores.

## Agenda automática

A central de eventos importa os anúncios públicos oficiais do Pokémon GO, incluindo categorias, datas, informações e imagens com crédito à fonte. Eventos encerrados saem da agenda após sete dias. Há cache de uma hora, atualização ao abrir a tela e cron diário configurado para Vercel. A rotina agendada precisa de `CRON_SECRET` privado e deploy; o calendário oficial autenticado tem cobertura limitada aos anúncios públicos.

Use `npm run events:update` para atualizar o snapshot inicial. Consulte [a documentação de eventos](docs/events.md) para a configuração e os limites da fonte.
