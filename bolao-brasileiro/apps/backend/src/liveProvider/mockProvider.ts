import { matches } from "../store.js";
import type { LiveMatchProvider, MatchTickEvent } from "./types.js";

const TICK_INTERVAL_MS = 5000;
const MINUTES_PER_TICK = 2;
const GOAL_PROBABILITY_PER_TICK = 0.12;
const MATCH_END_MINUTE = 90;

/**
 * Simula partidas ao vivo: a cada tick avança o relógio e, com uma certa
 * probabilidade, marca um gol para um dos lados. Usado em desenvolvimento no
 * lugar de um provedor real de dados (ver `types.ts`).
 */
export class MockLiveProvider implements LiveMatchProvider {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(onTick: (event: MatchTickEvent) => void): void {
    this.intervalId = setInterval(() => {
      for (const match of matches) {
        if (match.status !== "LIVE") continue;

        match.minute = Math.min(MATCH_END_MINUTE, match.minute + MINUTES_PER_TICK);

        let goalScoredBy: "home" | "away" | null = null;
        if (Math.random() < GOAL_PROBABILITY_PER_TICK) {
          goalScoredBy = Math.random() < 0.5 ? "home" : "away";
          if (goalScoredBy === "home") match.homeGoals += 1;
          else match.awayGoals += 1;
        }

        const justFinished = match.minute >= MATCH_END_MINUTE;
        if (justFinished) match.status = "FINISHED";

        onTick({ match, goalScoredBy, justFinished });
      }

      // Promove a próxima partida agendada mais próxima para "ao vivo".
      const nextScheduled = matches
        .filter((m) => m.status === "SCHEDULED")
        .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt))[0];
      if (nextScheduled && new Date(nextScheduled.kickoffAt).getTime() <= Date.now()) {
        nextScheduled.status = "LIVE";
        nextScheduled.minute = 1;
        onTick({ match: nextScheduled, goalScoredBy: null, justFinished: false });
      }
    }, TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }
}
