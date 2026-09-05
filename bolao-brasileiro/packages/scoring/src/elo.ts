/**
 * Rating de força dos times (sistema Elo, adaptado para futebol), usado para
 * estimar a dificuldade de um resultado sem depender da posição na tabela —
 * que é um proxy ruim no início do campeonato (poucos jogos, muito ruído).
 *
 * O Elo carrega a força "histórica" de cada time e evolui aos poucos a cada
 * partida, então dois times realmente fortes que se enfrentam cedo no
 * campeonato (mesmo que um esteja mal posicionado momentaneamente) ainda
 * geram um jogo equilibrado do ponto de vista do rating.
 */

export const DEFAULT_ELO = 1500;

/** Vantagem de jogar em casa, em pontos de Elo (típico no futebol de clubes). */
export const DEFAULT_HOME_ADVANTAGE = 60;

/** Fator K padrão: o quanto um resultado pode mover o rating de um time. */
export const DEFAULT_K_FACTOR = 20;

/**
 * Probabilidade esperada (0 a 1) de o time A vencer o time B, dado seus
 * ratings de Elo. 0.5 = jogo equilibrado.
 */
export function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

export interface UpdateEloInput {
  eloHome: number;
  eloAway: number;
  homeGoals: number;
  awayGoals: number;
  kFactor?: number;
  homeAdvantage?: number;
}

export interface UpdateEloResult {
  eloHome: number;
  eloAway: number;
}

/**
 * Margem de vitória amplia o quanto o rating se move (goleadas contam mais
 * que vitórias de 1 gol de diferença) — mesma ideia usada pelo World Football
 * Elo Ratings (eloratings.net).
 */
function goalDifferenceMultiplier(goalDifference: number): number {
  const gap = Math.abs(goalDifference);
  if (gap <= 1) return 1;
  if (gap === 2) return 1.5;
  return (11 + gap) / 8;
}

/**
 * Atualiza os ratings de Elo de dois times a partir do resultado real de uma
 * partida entre eles. Times que vencem (principalmente de forma inesperada
 * ou por uma margem grande) ganham mais pontos; o adversário perde a mesma
 * quantidade.
 */
export function updateElo(input: UpdateEloInput): UpdateEloResult {
  const {
    eloHome,
    eloAway,
    homeGoals,
    awayGoals,
    kFactor = DEFAULT_K_FACTOR,
    homeAdvantage = DEFAULT_HOME_ADVANTAGE,
  } = input;

  const expectedHome = expectedScore(eloHome + homeAdvantage, eloAway);
  const actualHome = homeGoals > awayGoals ? 1 : homeGoals < awayGoals ? 0 : 0.5;
  const multiplier = goalDifferenceMultiplier(homeGoals - awayGoals);

  const delta = kFactor * multiplier * (actualHome - expectedHome);

  return {
    eloHome: eloHome + delta,
    eloAway: eloAway - delta,
  };
}
