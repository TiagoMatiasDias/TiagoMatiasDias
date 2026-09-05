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
  verde/dourado. Telas: Ao Vivo, Palpites, Ranking, Perguntas, Perfil.
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

Login de demonstração: `tiagomatiasdias@hotmail.com` / senha `bolao123`.

Testes do motor de pontuação:

```bash
pnpm scoring:test
```

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
do enunciado — dois times com 400 pontos de diferença de Elo: favorito
vencendo = +2, empate = +4, zebra (azarão vencendo) = +8.

Posição na tabela foi descartada de propósito: logo no início do campeonato,
ela é um proxy ruim de dificuldade (poucos jogos, muito ruído). Dois
candidatos ao título que se enfrentam cedo — um deles temporariamente mal
posicionado — continuam tendo Elo parecido, então o bônus fica baixo, do
jeito que uma casa de apostas precificaria esse jogo. Cada time começa com
um Elo inicial (hoje, um placeholder de demonstração em `store.ts` — numa
integração real valeria semear com o Elo final da temporada anterior) e ele
evolui sozinho: toda vez que uma partida termina, `recordMatchResultForElo`
atualiza o Elo dos dois times com base no resultado real (vitória, empate,
derrota, e a diferença de gols conta — uma goleada move mais pontos que uma
vitória de 1 gol). Isso afeta o bônus dos **próximos** jogos desses times; o
bônus de uma partida que já começou nunca muda, como a linha de uma casa de
apostas antes do apito inicial.

O bônus é somado **sempre que o participante acerta a direção do resultado**
(vencedor certo ou empate certo), qualquer que seja a faixa fixa atingida —
inclusive quando acertou só a direção (faixa "0 pontos fixos"). Times mais
parelhos em força geram bônus menor/nulo.

> **Fórmula é um ponto de partida, não está fechada.** O enunciado só deu um
> exemplo (2/4/8); a escala usada (`maxFavoriteBonus × força do favorito`,
> empate = 2×, zebra = 4×) bate com esse exemplo, mas o valor máximo, o fator
> K do Elo e a vantagem de jogar em casa são ajustáveis
> (`computeOutcomeDifficultyBonus(..., { maxFavoriteBonus })` e os parâmetros
> de `updateElo`). Vale revisar com dados reais do campeonato antes de travar
> os valores.

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
