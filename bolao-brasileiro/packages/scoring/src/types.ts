/** Placar de uma partida: gols do mandante e do visitante. */
export interface Score {
  home: number;
  away: number;
}

/** Resultado direcional de uma partida a partir do placar. */
export type Outcome = "HOME" | "DRAW" | "AWAY";

/**
 * Bônus extra por dificuldade do resultado, definido por partida a partir
 * da classificação/força dos times (ex: favorito x lanterna).
 * Aplicado ao lado (mandante/empate/visitante) que de fato ocorreu, para
 * quem acertou a direção do resultado.
 */
export interface OutcomeDifficultyBonus {
  home: number;
  draw: number;
  away: number;
}

/** Categoria de pontuação fixa alcançada pelo palpite (não se somam entre si). */
export type FixedScoreCategory =
  | "EXACT_SCORE"
  | "GOAL_DIFFERENCE"
  | "WINNER_OR_LOSER_GOALS"
  | "DRAW"
  | "MISS";

export interface ScoreBreakdown {
  /** Categoria fixa alcançada. */
  fixedCategory: FixedScoreCategory;
  /** Pontos da categoria fixa (0, 4, 6 ou 10). */
  fixedPoints: number;
  /** Bônus por dificuldade do resultado (força dos times), 0 se não aplicável. */
  outcomeDifficultyBonus: number;
  /** Bônus de +4 por acertar que a partida teria 4 gols ou mais no total. */
  fourPlusGoalsBonus: number;
  /** Soma de todos os pontos. */
  total: number;
}
