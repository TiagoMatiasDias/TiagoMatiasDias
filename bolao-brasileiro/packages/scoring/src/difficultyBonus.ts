import { DEFAULT_HOME_ADVANTAGE, expectedScore } from "./elo.js";
import type { OutcomeDifficultyBonus } from "./types.js";

export interface DifficultyBonusOptions {
  /**
   * Bônus de vitória (mandante ou visitante) num jogo sem favorito nenhum
   * (Elo igual, ignorando o mando de campo). Default: 4.
   */
  baselineBonus?: number;
  /**
   * Bônus do empate num jogo sem favorito nenhum. Um pouco menor que o
   * baseline de vitória, já que empate é um resultado relativamente comum
   * mesmo em jogos equilibrados. Default: 3.
   */
  baselineDrawBonus?: number;
  /**
   * Bônus do favorito quando a diferença de força é máxima (um dos times é
   * um favorito quase absoluto). Empate e zebra nesse extremo valem,
   * respectivamente, 2x e 4x esse valor — reproduz o exemplo do enunciado
   * (favorito = 2, empate = 4, zebra = 8). Default: 2.
   */
  extremeFavoriteBonus?: number;
  /**
   * Vantagem de jogar em casa, em pontos de Elo — usada aqui só para decidir
   * quem é o favorito "de boca de urna" quando os dois times têm força
   * praticamente igual (ver `elo.ts`). Default: `DEFAULT_HOME_ADVANTAGE`.
   */
  homeAdvantage?: number;
}

const DEFAULT_OPTIONS: Required<DifficultyBonusOptions> = {
  baselineBonus: 4,
  baselineDrawBonus: 3,
  extremeFavoriteBonus: 2,
  homeAdvantage: DEFAULT_HOME_ADVANTAGE,
};

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * Calcula o bônus extra por dificuldade do resultado a partir do rating de
 * Elo de cada time (ver `elo.ts`) — não da posição na tabela, que é um proxy
 * ruim logo no início do campeonato.
 *
 * Um jogo parelho (Elo parecido) **não zera o bônus** — ele fica perto do
 * "baseline" (ex: 4 de vitória / 3 de empate), porque acertar qualquer
 * resultado num jogo difícil de prever já tem seu mérito. Só nos extremos
 * (um time claramente muito mais forte que o outro) o bônus se afasta desse
 * baseline: o favorito cai até `extremeFavoriteBonus` (2), o empate sobe até
 * o dobro disso (4) e a zebra sobe até o quádruplo (8) — do jeito que uma
 * casa de apostas precificaria um jogo, cada vez mais junto quanto mais
 * parelhos os times, cada vez mais espalhado quanto mais um deles domina.
 */
export function computeOutcomeDifficultyBonus(
  eloHome: number,
  eloAway: number,
  options: DifficultyBonusOptions = {}
): OutcomeDifficultyBonus {
  const { baselineBonus, baselineDrawBonus, extremeFavoriteBonus, homeAdvantage } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const extremeDrawBonus = extremeFavoriteBonus * 2;
  const extremeUnderdogBonus = extremeFavoriteBonus * 4;

  const homeWinProbability = expectedScore(eloHome + homeAdvantage, eloAway);
  // 0 = jogo totalmente equilibrado, 1 = um dos times é um favorito quase absoluto.
  const strength = Math.abs(homeWinProbability - 0.5) * 2;

  const favoriteBonus = Math.round(lerp(baselineBonus, extremeFavoriteBonus, strength));
  const drawBonus = Math.round(lerp(baselineDrawBonus, extremeDrawBonus, strength));
  const underdogBonus = Math.round(lerp(baselineBonus, extremeUnderdogBonus, strength));

  const homeIsFavorite = homeWinProbability >= 0.5;

  return {
    home: homeIsFavorite ? favoriteBonus : underdogBonus,
    away: homeIsFavorite ? underdogBonus : favoriteBonus,
    draw: drawBonus,
  };
}
