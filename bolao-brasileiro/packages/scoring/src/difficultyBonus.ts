import type { OutcomeDifficultyBonus } from "./types.js";

export interface DifficultyBonusOptions {
  /**
   * Bônus máximo concedido ao favorito quando a diferença de posição na
   * tabela entre os dois times é a maior possível no campeonato.
   * Empate = 2x esse valor, zebra (azarão vencendo) = 4x esse valor.
   * Default: 2 (reproduz o exemplo do 1º x 20º: 2 / 4 / 8).
   */
  maxFavoriteBonus?: number;
}

const DEFAULT_OPTIONS: Required<DifficultyBonusOptions> = {
  maxFavoriteBonus: 2,
};

/**
 * Calcula o bônus extra por dificuldade do resultado a partir da posição de
 * cada time na tabela de classificação (1 = líder).
 *
 * Quanto maior a diferença de posição entre os times, maior o bônus: o
 * favorito (melhor posicionado) ganha um bônus pequeno por vencer, o
 * empate vale o dobro e a zebra (o azarão vencendo) vale o quádruplo —
 * refletindo a raridade de cada resultado. Times com posições iguais/
 * próximas geram bônus baixo ou nulo (jogo equilibrado).
 *
 * Exemplo (campeonato com 20 times, líder x lanterna, maxFavoriteBonus=2):
 * favorito vence = 2, empate = 4, zebra = 8.
 */
export function computeOutcomeDifficultyBonus(
  homePosition: number,
  awayPosition: number,
  totalTeams: number,
  options: DifficultyBonusOptions = {}
): OutcomeDifficultyBonus {
  if (totalTeams < 2) {
    throw new Error("totalTeams deve ser >= 2");
  }
  const { maxFavoriteBonus } = { ...DEFAULT_OPTIONS, ...options };

  const positionGap = Math.abs(homePosition - awayPosition);
  const normalizedGap = positionGap / (totalTeams - 1);
  const favoriteBonus = Math.round(maxFavoriteBonus * normalizedGap);
  const drawBonus = favoriteBonus * 2;
  const underdogBonus = favoriteBonus * 4;

  const homeIsFavorite = homePosition <= awayPosition;

  return {
    home: homeIsFavorite ? favoriteBonus : underdogBonus,
    away: homeIsFavorite ? underdogBonus : favoriteBonus,
    draw: drawBonus,
  };
}
