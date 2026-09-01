import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { calculateMatchBetScore } from "@bolao/scoring";
import { bets, matchesById } from "../store.js";
import { requireAuth } from "../middleware/auth.js";

export const betsRouter = Router();

const upsertBetSchema = z.object({
  matchId: z.string(),
  homeGoals: z.number().int().min(0).max(20),
  awayGoals: z.number().int().min(0).max(20),
});

betsRouter.get("/", requireAuth, (req, res) => {
  const userBets = bets.filter((b) => b.userId === req.userId);
  res.json({ bets: userBets });
});

betsRouter.post("/", requireAuth, (req, res) => {
  const parsed = upsertBetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { matchId, homeGoals, awayGoals } = parsed.data;

  const match = matchesById.get(matchId);
  if (!match) {
    res.status(404).json({ error: "Partida não encontrada" });
    return;
  }
  if (match.status !== "SCHEDULED") {
    res.status(409).json({ error: "Palpites travam a partir do início da partida" });
    return;
  }

  const userId = req.userId!;
  let bet = bets.find((b) => b.userId === userId && b.matchId === matchId);
  const now = new Date().toISOString();

  if (bet) {
    bet.homeGoals = homeGoals;
    bet.awayGoals = awayGoals;
    bet.updatedAt = now;
  } else {
    bet = {
      id: randomUUID(),
      userId,
      matchId,
      homeGoals,
      awayGoals,
      createdAt: now,
      updatedAt: now,
    };
    bets.push(bet);
  }

  // Pré-visualização da pontuação caso o placar previsto se confirme
  // (apenas informativo — o valor real é recalculado a cada gol ao vivo).
  const preview = calculateMatchBetScore(
    { home: homeGoals, away: awayGoals },
    { home: homeGoals, away: awayGoals },
    match.difficultyBonus
  );

  res.status(200).json({ bet, previewIfExact: preview });
});
