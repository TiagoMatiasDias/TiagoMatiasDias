import { Router } from "express";
import type { LeaderboardEntry } from "@bolao/shared-types";
import { leaderboardEntries } from "../services/scoringService.js";
import { users } from "../store.js";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", (_req, res) => {
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

  res.json({ entries });
});
