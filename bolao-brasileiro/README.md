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
  **Palpites**, **Grupos** e **Menu** — este é o mapa final do redesign, mas
  hoje só a fase 1 (Grupos + a própria barra) está construída de verdade;
  Mata-Mata é um placeholder e Ranking/Palpites/Menu ainda são as telas
  simples de antes do redesign (ver `## Redesign do app (em fases)` abaixo).
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

## Redesign do app (em fases)

O app está sendo redesenhado para a estrutura final de 5 abas (Ranking,
Mata-Mata, Palpites, Grupos, Menu), cada uma com telas bem mais profundas do
que as atuais (rankings por grupo, gráficos de histórico, motor de
mata-mata configurável, formulário de perguntas ilustrado, gestão de
grupos/equipes). É grande demais pra construir de uma vez, então está sendo
feito em fases, cada uma completa antes de passar pra próxima:

1. **Grupos + nova barra de 5 abas** ✅ concluída — ver abaixo.
2. Palpites (rodadas 1-38 + formulário de perguntas) — pendente.
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
