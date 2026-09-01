import { calculateMatchBetScore } from "@bolao/scoring";
import type { Bet, Match } from "@bolao/shared-types";
import { bets, matchesById } from "../store.js";

/**
 * Recalcula a pontuação de todos os palpites de uma partida a partir do
 * placar atual (ao vivo ou final) e do bônus de dificuldade já fixado na
 * partida. Retorna os palpites que tiveram a pontuação alterada.
 */
export function recomputeBetsForMatch(matchId: string): Bet[] {
  const match = matchesById.get(matchId);
  if (!match) return [];

  const changed: Bet[] = [];

  for (const bet of bets) {
    if (bet.matchId !== matchId) continue;

    const breakdown = calculateMatchBetScore(
      { home: bet.homeGoals, away: bet.awayGoals },
      { home: match.homeGoals, away: match.awayGoals },
      match.difficultyBonus
    );

    const previousTotal = bet.breakdown?.total;
    bet.breakdown = breakdown;
    bet.updatedAt = new Date().toISOString();

    if (previousTotal !== breakdown.total) {
      changed.push(bet);
    }
  }

  return changed;
}

export function leaderboardEntries() {
  const totals = new Map<string, number>();
  for (const bet of bets) {
    if (!bet.breakdown) continue;
    totals.set(bet.userId, (totals.get(bet.userId) ?? 0) + bet.breakdown.total);
  }
  return totals;
}

export function applyGoal(match: Match, side: "home" | "away") {
  if (side === "home") match.homeGoals += 1;
  else match.awayGoals += 1;
}
