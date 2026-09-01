import type { Server } from "socket.io";
import type { ClientToServerEvents, LeaderboardEntry, ServerToClientEvents } from "@bolao/shared-types";
import { MockLiveProvider } from "./liveProvider/mockProvider.js";
import { leaderboardEntries, recomputeBetsForMatch } from "./services/scoringService.js";
import { users } from "./store.js";

export function startLiveEngine(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  const provider = new MockLiveProvider();

  provider.start(({ match }) => {
    io.emit("match:update", match);

    const changedBets = recomputeBetsForMatch(match.id);
    for (const bet of changedBets) {
      io.emit("bet:scored", bet);
    }

    if (changedBets.length > 0) {
      const totals = leaderboardEntries();
      const entries: LeaderboardEntry[] = [...totals.entries()]
        .map(([userId, totalPoints]) => ({
          userId,
          userName: users.find((u) => u.id === userId)?.name ?? "?",
          totalPoints,
          position: 0,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((entry, index) => ({ ...entry, position: index + 1 }));

      io.emit("leaderboard:update", entries);
    }
  });

  return provider;
}
