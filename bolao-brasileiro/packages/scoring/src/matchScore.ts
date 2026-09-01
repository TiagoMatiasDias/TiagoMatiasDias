import type {
  FixedScoreCategory,
  Outcome,
  OutcomeDifficultyBonus,
  Score,
  ScoreBreakdown,
} from "./types.js";

export const FIXED_POINTS: Record<Exclude<FixedScoreCategory, "MISS">, number> = {
  EXACT_SCORE: 10,
  DRAW: 6,
  GOAL_DIFFERENCE: 6,
  WINNER_OR_LOSER_GOALS: 4,
};

export const FOUR_PLUS_GOALS_BONUS = 4;
export const FOUR_PLUS_GOALS_THRESHOLD = 4;

export const ZERO_DIFFICULTY_BONUS: OutcomeDifficultyBonus = {
  home: 0,
  draw: 0,
  away: 0,
};

export function outcomeOf(score: Score): Outcome {
  if (score.home > score.away) return "HOME";
  if (score.home < score.away) return "AWAY";
  return "DRAW";
}

function isExactScore(prediction: Score, result: Score): boolean {
  return prediction.home === result.home && prediction.away === result.away;
}

function goalDifference(score: Score): number {
  return score.home - score.away;
}

/**
 * Calcula a categoria de pontuação fixa (as quatro faixas não se somam:
 * vale a melhor faixa atingida pelo palpite).
 */
export function calculateFixedCategory(
  prediction: Score,
  result: Score
): FixedScoreCategory {
  const predictedOutcome = outcomeOf(prediction);
  const realOutcome = outcomeOf(result);

  if (isExactScore(prediction, result)) {
    return "EXACT_SCORE";
  }

  // Errou a direção do resultado (não acertou vencedor nem empate).
  if (predictedOutcome !== realOutcome) {
    return "MISS";
  }

  if (realOutcome === "DRAW") {
    // Acertou que seria empate, mas não o placar exato.
    return "DRAW";
  }

  // Acertou o vencedor. Verifica saldo de gols.
  if (goalDifference(prediction) === goalDifference(result)) {
    return "GOAL_DIFFERENCE";
  }

  // Acertou o número de gols do vencedor OU do perdedor (não os dois, senão
  // seria EXACT_SCORE).
  const winnerIsHome = realOutcome === "HOME";
  const realWinnerGoals = winnerIsHome ? result.home : result.away;
  const realLoserGoals = winnerIsHome ? result.away : result.home;
  const predictedWinnerGoals = winnerIsHome ? prediction.home : prediction.away;
  const predictedLoserGoals = winnerIsHome ? prediction.away : prediction.home;

  if (
    predictedWinnerGoals === realWinnerGoals ||
    predictedLoserGoals === realLoserGoals
  ) {
    return "WINNER_OR_LOSER_GOALS";
  }

  // Acertou apenas a direção do resultado (vencedor certo), sem nenhuma
  // das faixas acima. Não há pontuação fixa prevista para esse caso.
  return "MISS";
}

function outcomeDifficultyBonusFor(
  outcome: Outcome,
  bonus: OutcomeDifficultyBonus
): number {
  switch (outcome) {
    case "HOME":
      return bonus.home;
    case "AWAY":
      return bonus.away;
    case "DRAW":
      return bonus.draw;
  }
}

/**
 * Calcula a pontuação completa de um palpite para uma partida encerrada.
 *
 * Regras:
 * - Pontuação fixa (não somam entre si, vale a melhor faixa):
 *   Placar exato = 10, Empate (sem placar exato) = 6,
 *   Saldo de gols = 6, Gols do vencedor ou perdedor = 4.
 * - Bônus por dificuldade do resultado (`difficultyBonus`): somado sempre
 *   que o participante acerta a direção do resultado (vencedor ou empate),
 *   isto é, sempre que a categoria fixa não é "MISS". O valor depende de
 *   qual lado (mandante/empate/visitante) realmente ocorreu, refletindo a
 *   probabilidade daquele resultado (ex: favorito x lanterna).
 * - Bônus de 4+ gols: +4 pontos se o palpite E o resultado real tiveram,
 *   cada um, 4 gols ou mais no total. É somado independente das faixas
 *   acima (inclusive quando a direção do resultado foi errada).
 */
export function calculateMatchBetScore(
  prediction: Score,
  result: Score,
  difficultyBonus: OutcomeDifficultyBonus = ZERO_DIFFICULTY_BONUS
): ScoreBreakdown {
  const fixedCategory = calculateFixedCategory(prediction, result);
  const fixedPoints = fixedCategory === "MISS" ? 0 : FIXED_POINTS[fixedCategory];

  const outcomeDifficultyBonus =
    fixedCategory === "MISS"
      ? 0
      : outcomeDifficultyBonusFor(outcomeOf(result), difficultyBonus);

  const predictedTotalGoals = prediction.home + prediction.away;
  const realTotalGoals = result.home + result.away;
  const fourPlusGoalsBonus =
    predictedTotalGoals >= FOUR_PLUS_GOALS_THRESHOLD &&
    realTotalGoals >= FOUR_PLUS_GOALS_THRESHOLD
      ? FOUR_PLUS_GOALS_BONUS
      : 0;

  return {
    fixedCategory,
    fixedPoints,
    outcomeDifficultyBonus,
    fourPlusGoalsBonus,
    total: fixedPoints + outcomeDifficultyBonus + fourPlusGoalsBonus,
  };
}
