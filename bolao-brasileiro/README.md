# Bolão Brasileirão

App de bolão do Campeonato Brasileiro: palpites de placar exato com pontuação
em tempo real (atualiza a cada gol) + perguntas de longo prazo (artilheiro,
assistências, campeão etc).

## Arquitetura

Monorepo com pnpm workspaces:

```
bolao-brasileiro/
├── apps/
│   ├── mobile/    # App React Native (Expo + Expo Router) — Android e iOS
│   └── backend/   # API Node.js/TypeScript (Express + Socket.IO)
└── packages/
    ├── scoring/       # Motor de pontuação (puro, testado, sem I/O)
    └── shared-types/  # Tipos compartilhados entre backend e mobile
```

- **Mobile**: Expo Router (navegação por abas), TypeScript, tema escuro
  verde/dourado. Barra de navegação com 5 abas: **Ranking**, **Mata-Mata**,
  **Palpites**, **Grupos** e **Menu** — este é o mapa final do redesign;
  Grupos e Palpites (rodadas 1-38) já estão na versão nova, Mata-Mata é um
  placeholder e Ranking/Menu ainda são as telas simples de antes do redesign
  (ver `## Redesign do app (em fases)` abaixo).
- **Backend**: Express + Socket.IO. Hoje roda com um repositório **em
  memória** (`apps/backend/src/store.ts`) para não depender de um Postgres
  provisionado — inclui um simulador de partidas ao vivo
  (`MockLiveProvider`) que gera gols periodicamente. O `prisma/schema.prisma`
  já modela o banco de produção (Postgres); trocar o store em memória por
  Prisma é o próximo passo antes de ir para produção.
- **Dados ao vivo**: a interface `LiveMatchProvider`
  (`apps/backend/src/liveProvider/types.ts`) isola a fonte dos dados. Para
  plugar um provedor real (API-Football, Sportradar, etc.), basta implementar
  essa interface chamando `onTick` a cada gol/fim de jogo — nenhum outro
  código muda.

## Rodando localmente

```bash
pnpm install

# Backend (porta 4000, com simulador de partidas ao vivo)
pnpm backend:dev

# Mobile (abre o Expo Dev Tools; aponta para http://localhost:4000)
pnpm mobile:start
```

Login de demonstração: `tiagomatiasdias@hotmail.com` / senha `bolao123`
(existe um segundo usuário demo, `maria@exemplo.com` / mesma senha, útil para
testar convite/entrada em grupo com dois usuários).

Testes do motor de pontuação:

```bash
pnpm scoring:test
```

## Escudos dos times

O app não vem com os brasões oficiais dos 20 times (é imagem licenciada de
cada clube — o mesmo motivo pelo qual as perguntas com jogador vão usar
ilustração em vez de foto, na fase 2b). Em vez disso, dá pra subir os
escudos você mesmo, sem mexer em nenhum código:

1. Consiga o PNG do escudo de cada time (fundo transparente, quadrado,
   uns 256×256px fica ótimo).
2. Salve o arquivo em `apps/mobile/assets/images/teams/`, **substituindo**
   o placeholder que já existe lá, com o nome exato (tudo minúsculo):

   | Arquivo | Time | Arquivo | Time |
   |---|---|---|---|
   | `fla.png` | Flamengo | `cam.png` | Atlético-MG |
   | `pal.png` | Palmeiras | `san.png` | Santos |
   | `cru.png` | Cruzeiro | `cor.png` | Corinthians |
   | `mir.png` | Mirassol | `vas.png` | Vasco da Gama |
   | `flu.png` | Fluminense | `vit.png` | Vitória |
   | `bot.png` | Botafogo | `int.png` | Internacional |
   | `bah.png` | Bahia | `cfc.png` | Coritiba |
   | `sao.png` | São Paulo | `cap.png` | Athletico-PR |
   | `gre.png` | Grêmio | `cha.png` | Chapecoense |
   | `bra.png` | Bragantino | `rem.png` | Clube do Remo |

3. Reinicie `pnpm mobile:start` (Ctrl+C e rode de novo) pra garantir que o
   Metro pegue o arquivo novo.

Pode fazer time por time, sem pressa — os times que ainda não têm arquivo
de verdade continuam mostrando o escudo estilizado (a silhueta colorida com
a sigla) normalmente. A lista de arquivos fica em
`apps/mobile/constants/teamCrests.ts`.

## Redesign do app (em fases)

O app está sendo redesenhado para a estrutura final de 5 abas (Ranking,
Mata-Mata, Palpites, Grupos, Menu), cada uma com telas bem mais profundas do
que as atuais (rankings por grupo, gráficos de histórico, motor de
mata-mata configurável, formulário de perguntas ilustrado, gestão de
grupos/equipes). É grande demais pra construir de uma vez, então está sendo
feito em fases, cada uma completa antes de passar pra próxima:

1. **Grupos + nova barra de 5 abas** ✅ concluída — ver abaixo.
2. Palpites:
   - **2a. Jogos (rodadas 1-38)** ✅ concluída — ver abaixo.
   - 2b. Perguntas (formulário com as 17 perguntas ilustradas) — pendente.
3. Ranking geral + telas de detalhe/gráficos — pendente.
4. Ranking de Equipes + Ranking de Perguntas — pendente.
5. Mata-Mata (motor de fases configurável pelo ADM) — pendente.
6. Menu (perfil, tema claro, notificações, regras) — pendente.

### Grupos (fase 1)

Qualquer usuário pode criar um grupo (nome + ícone: troféu, bola, medalha ou
bandeira) e vira automaticamente o `ADMIN` dele; um código de convite de 6
caracteres é gerado na hora (`apps/backend/src/store.ts`,
`generateInviteCode`). Outros usuários entram no grupo com
`POST /groups/join` usando esse código. Isso é a base para as fases
seguintes: o Ranking (fase 3/4) e o Mata-Mata (fase 5) vão ser sempre
escopados por grupo — se o usuário estiver em mais de um grupo, um seletor
no topo dessas telas deixa trocar o grupo ativo (a implementar nas
respectivas fases).

Rotas: `POST /groups`, `GET /groups`, `GET /groups/:id`, `POST /groups/join`
(`apps/backend/src/routes/groups.ts`). No mobile, `GroupsContext`
(`apps/mobile/context/GroupsContext.tsx`) busca os grupos do usuário e a aba
Grupos (`apps/mobile/app/(tabs)/grupos.tsx`) traz a lista + os modais de
criar/entrar/detalhar grupo.

### Palpites → Jogos (fase 2a)

A aba Palpites agora tem duas seções no topo, **Jogos** e **Perguntas**
(`apps/mobile/app/(tabs)/palpites.tsx`). Perguntas por enquanto é só a lista
simples que já existia (fase 2b redesenha com as 17 perguntas ilustradas).

Jogos mostra o calendário **real** do campeonato: os 20 clubes da Série A
2026 e as 380 partidas oficiais (38 rodadas de 10 jogos, returno — cada
dupla se enfrenta 2x, casa e fora), a partir da planilha oficial que o
usuário forneceu
(`apps/backend/src/fixtures/brasileirao2026.ts`, `REAL_FIXTURES_2026`).
Isso inclui os **246 resultados já ocorridos de verdade** (rodadas 1-20,
22-25 completas, mais 6 de 10 jogos da rodada 21) — nada de placar
simulado. Alguns detalhes de como os dados foram extraídos e reconciliados:

- A planilha guarda os placares como texto (`"3 - 0"`) só quando um dos
  times fica em 0 — qualquer outro placar (ex: `"1 - 3"`) o Excel
  "corrigiu" sozinho pra uma data (`1 de março`), porque interpretou como
  dia/mês. Recuperamos o placar original de volta a partir do mês/dia da
  data (`mês = gols do mandante`, `dia = gols do visitante`).
- A rodada que estava "ao vivo" no momento em que a planilha foi gerada
  (rodada 26, a única sem os times visitantes listados — só um placar de
  odds) foi reconstruída por eliminação: como cada dupla de times só pode
  se enfrentar 2x no campeonato, os 10 jogos que "faltavam" um adversário
  batem exatamente com os 10 pares que só tinham aparecido 1x no resto do
  calendário (a rodada 26 é o returno da rodada 7).
- 4 jogos da rodada 21 apareciam como "PÓS" (adiados), sem placar.

Ao subir o servidor (`apps/backend/src/store.ts`, `buildCalendar`):

- Jogos com placar real viram `FINISHED` direto, e cada resultado atualiza
  o Elo (`recordMatchResultForElo`) na ordem das rodadas — então o bônus de
  dificuldade de qualquer jogo pendente reflete um Elo que já evoluiu de
  verdade a partir dos resultados reais, não uma semente fixa.
- Jogos sem placar cuja data real já passou (os 4 adiados da rodada 21 +
  o que já tiver passado da rodada 26 até agora) são redistribuídos: o mais
  antigo vira `LIVE` (pro simulador de gols de sempre ter o que simular),
  os outros ficam `SCHEDULED` em horários seguros mais à frente — sem isso,
  o simulador promoveria vários pra "ao vivo" de uma vez só assim que o
  servidor subisse.
- Os demais jogos futuros mantêm a data real da planilha (a rodada 38, por
  exemplo, é 1-2 de dezembro de 2026, como no campeonato de verdade).

No mobile, `RoundSelector` (`apps/mobile/components/RoundSelector.tsx`)
lista as 38 rodadas com um check em quem já tem palpite em todos os jogos
daquela rodada (calculado no cliente, comparando com `GET /bets`), e entra
já selecionando a rodada atual (a menor rodada com algum jogo que não é
`FINISHED`). `RoundGameCard` mostra escudo acima do nome do time, o placar
final pra jogos encerrados, e uma pill "Palpite feito"/"Sem preenchimento"
pra jogos agendados; tocar num jogo agendado abre `BetEditorModal` pra
editar o palpite.

## Regras de pontuação implementadas (`packages/scoring`)

### Pontuação fixa (não se somam — vale a melhor faixa atingida)

| Faixa | Pontos |
|---|---|
| Placar exato | 10 |
| Acertar o empate (sem cravar o placar) | 6 |
| Acertar o saldo de gols (SG) | 6 |
| Acertar os gols do vencedor OU do perdedor | 4 |
| Acertar só a direção do resultado, sem nenhuma faixa acima | 0 |

### Bônus por dificuldade do resultado (soma à pontuação fixa)

Cada partida tem um bônus (`home`/`draw`/`away`) calculado a partir do
**rating de força (Elo)** dos dois times — não da posição na tabela
(`computeOutcomeDifficultyBonus`, em `packages/scoring/src/difficultyBonus.ts`,
usando `expectedScore` de `packages/scoring/src/elo.ts`). Reproduz o exemplo
do enunciado — um time claramente mais forte que o outro: favorito vencendo
= +2, empate = +4, zebra (azarão vencendo) = +8.

Posição na tabela foi descartada de propósito: logo no início do campeonato,
ela é um proxy ruim de dificuldade (poucos jogos, muito ruído). Dois
candidatos ao título que se enfrentam cedo — um deles temporariamente mal
posicionado — continuam tendo Elo parecido, então o jogo é tratado como o
que realmente é: difícil de prever.

**Importante: um jogo parelho não zera o bônus.** Times com Elo parecido
ficam perto de um "piso" (4 de vitória / 3 de empate) em vez de caírem a
zero — mesmo num confronto equilibrado, acertar o resultado tem seu mérito.
Só nos extremos (um time claramente mais forte) o bônus se afasta desse piso
até chegar em 2/4/8. Ou seja, quanto mais parelhos os times, mais próximos os
três valores ficam entre si; quanto mais um deles domina, mais eles se
espalham — do jeito que uma casa de apostas precifica um jogo. Exemplos reais
do simulador: Palmeiras (muito mais forte) x Atlético-GO → 2/4/8; dois times
parelhos → algo como 4/3/5; uma diferença média → 3/3/6.

Cada time começa com um Elo inicial (hoje, um placeholder de demonstração em
`store.ts` — numa integração real valeria semear com o Elo final da
temporada anterior) e ele evolui sozinho: toda vez que uma partida termina,
`recordMatchResultForElo` atualiza o Elo dos dois times com base no
resultado real (vitória, empate, derrota, e a diferença de gols conta — uma
goleada move mais pontos que uma vitória de 1 gol). Isso afeta o bônus dos
**próximos** jogos desses times; o bônus de uma partida que já começou nunca
muda, como a linha de uma casa de apostas antes do apito inicial.

O bônus é somado **sempre que o participante acerta a direção do resultado**
(vencedor certo ou empate certo), qualquer que seja a faixa fixa atingida —
inclusive quando acertou só a direção (faixa "0 pontos fixos").

> **Fórmula é um ponto de partida, não está fechada.** O enunciado só deu um
> exemplo (2/4/8) para um jogo bem desequilibrado; o piso de um jogo parelho
> (4 de vitória / 3 de empate) e a vantagem de jogar em casa usada para
> desempatar times com Elo idêntico (`homeAdvantage`, hoje 60 pontos de Elo)
> são ajustáveis em `computeOutcomeDifficultyBonus(..., { baselineBonus,
> baselineDrawBonus, extremeFavoriteBonus, homeAdvantage })`. Vale revisar
> com dados reais do campeonato antes de travar os valores.

### Bônus de 4+ gols (soma, independente das faixas acima)

+4 pontos se o palpite **e** o resultado real tiveram, cada um, 4 gols ou
mais no total (soma dos dois times). Não há bônus simétrico para acertar que
teria menos de 4 gols — o enunciado só menciona o caso "4 ou mais".

### Perguntas de longo prazo

Cada pergunta (ex: "Quem será o artilheiro do campeonato?") tem um valor de
pontos fixo definido na criação, concedido integralmente a quem acertar
quando a pergunta é resolvida (`packages/scoring/src/longTermQuestion.ts`).

### Suposições que fiz (vale confirmar)

1. As 4 faixas fixas são mutuamente exclusivas — implementei como uma
   hierarquia (exato > saldo/empate > vencedor-ou-perdedor > nada), sempre
   valendo a melhor faixa alcançada.
2. O bônus de dificuldade é pago para qualquer palpite que acerte a direção
   do resultado, mesmo sem pontuar na parte fixa (ex: acertou o vencedor mas
   errou os gols de ambos os times).
3. Não há pontuação por acertar "só o vencedor" sem nenhuma das faixas de
   gols — o enunciado não previu esse caso, então ele vale 0 de pontos fixos
   (mas ainda pode ganhar o bônus de dificuldade, ver suposição 2).

## Próximos passos sugeridos

- Trocar o store em memória do backend por Prisma + Postgres.
- Cadastro de usuário (hoje só há o usuário demo).
- Bolões privados entre amigos (o schema já tem `Pool`/`PoolMember`).
- Plugar um provedor real de dados ao vivo (API-Football/Sportradar).
- Push notifications a cada gol.
- Expandir para outras competições (Copa do Brasil, Libertadores etc.) —
  o modelo já é multi-campeonato (`Championship`).
