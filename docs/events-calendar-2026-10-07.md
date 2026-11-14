# Importação do calendário oficial — 07/10/2026

A agenda combina os eventos disponíveis na consulta autorizada ao calendário com os anúncios públicos atualizados pelo servidor. A versão foi preparada e verificada localmente.

## Cobertura observada

- Outubro: 58 registros em 16 tópicos oficiais.
- Novembro: cinco registros que também aparecem em outubro, pois atravessam o mês. A navegação oficial não oferecia outro mês seguinte.
- Calendário consolidado: 58 IDs únicos, com imagens, Pokémon e horários locais.
- Feed importado: 63 eventos únicos após complementar o calendário com anúncios públicos. Esses anúncios também incluem períodos de dezembro de 2026 e de 2027.
- Eventos encerrados continuam disponíveis durante sete dias após o último término. A API conserva a margem de fuso; a tela aplica o prazo exato no aparelho.

## Implementação

O importador lê registros do calendário em JSON/RSC, segue links de meses publicados e preserva os IDs e tópicos oficiais. Tópicos desconhecidos ganham categorias navegáveis. Anúncios vinculados fornecem títulos, detalhes e horários precisos ao mesmo evento, evitando duplicações. Ocorrências distintas continuam separadas. Links e favoritos antigos usam aliases.

O cache inclui a data da importação para que um novo snapshot seja usado imediatamente após a publicação. URLs são limitadas aos domínios oficiais e as imagens aos hosts conhecidos. Cookies, senha, perfil, localização e RSVP da conta não foram guardados no projeto.

## Limitação da atualização automática

O Vercel continua consultando automaticamente os anúncios públicos. A conta autenticada no navegador não fornece uma sessão autenticada ao servidor. Por isso, a cobertura atual é `calendar-snapshot`, com a data da consulta ao calendário separada da data de atualização dos anúncios. Novas entradas exclusivas do calendário exigem outra importação autenticada enquanto não houver uma integração autorizada e persistente com a fonte.

## Validação

- `npm test`, `npm run lint` e `npm run build`: aprovados.
- API real: HTTP 200, `health: ok`, 58 eventos de calendário e IDs sem duplicação.
- Testes de vários meses, navegação cíclica, tópicos novos, mais de 40 anúncios, imagens, sanitização, privacidade, recorrências, aliases, 404/410, mudança de ano e retenção.
- Desktop: filtro de Hora de Holofote, cards e imagens oficiais carregados.
- Mobile: detalhes do Dia Comunitário de Zorua e calendário de novembro; largura do conteúdo igual à largura útil do aparelho, sem rolagem horizontal.
- Console do navegador: nenhum erro observado nos fluxos verificados.

O servidor local foi mantido em `http://localhost:3000`. Instruções de nova importação: `docs/events.md`.
