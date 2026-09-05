import { expectedScore } from "./elo.js";
import type { OutcomeDifficultyBonus } from "./types.js";

export interface DifficultyBonusOptions {
  /**
   * Bônus máximo concedido ao favorito quando um time é um favorito quase
   * absoluto (diferença de Elo muito grande). Empate = 2x esse valor, zebra
   * (azarão vencendo) = 4x esse valor.
   * Default: 2 (reproduz o exemplo do enunciado com uma diferença de Elo de
   * 400 pontos: favorito = 2, empate = 4, zebra = 8).
   */
  maxFavoriteBonus?: number;
}

const DEFAULT_OPTIONS: Required<DifficultyBonusOptions> = {
  maxFavoriteBonus: 2,
};

/**
 * Calcula o bônus extra por dificuldade do resultado a partir do rating de
 * Elo de cada time (ver `elo.ts`) — não da posição na tabela, que é um proxy
 * ruim logo no início do campeonato.
 *
 * Dois times parelhos em força (Elo parecido) geram bônus baixo ou nulo,
 * mesmo que estejam em posições bem diferentes na tabela num dado momento
 * (ex: dois favoritos ao título que se enfrentam cedo, com um deles ainda
 * mal posicionado por causa de poucos jogos). Quanto maior a diferença de
 * Elo, maior o bônus: o favorito ganha um bônus pequeno por vencer, o
 * empate vale o dobro e a zebra vale o quádruplo — refletindo a raridade de
 * cada resultado, do jeito que casas de apostas precificam um jogo.
 */
export function computeOutcomeDifficultyBonus(
  eloHome: number,
  eloAway: number,
  options: DifficultyBonusOptions = {}
): OutcomeDifficultyBonus {
  const { maxFavoriteBonus } = { ...DEFAULT_OPTIONS, ...options };

  // 0 (jogo equilibrado) a 1 (favorito quase certo de vencer).
  const favoriteStrength = Math.abs(expectedScore(eloHome, eloAway) - 0.5) * 2;
  const favoriteBonus = Math.round(maxFavoriteBonus * favoriteStrength);
  const drawBonus = favoriteBonus * 2;
  const underdogBonus = favoriteBonus * 4;

  const homeIsFavorite = eloHome >= eloAway;

  return {
    home: homeIsFavorite ? favoriteBonus : underdogBonus,
    away: homeIsFavorite ? underdogBonus : favoriteBonus,
    draw: drawBonus,
  };
}
