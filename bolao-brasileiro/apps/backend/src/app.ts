import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { betsRouter } from "./routes/bets.js";
import { groupsRouter } from "./routes/groups.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { longTermRouter } from "./routes/longterm.js";
import { matchesRouter } from "./routes/matches.js";
import { env } from "./env.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRouter);
  app.use("/matches", matchesRouter);
  app.use("/bets", betsRouter);
  app.use("/longterm", longTermRouter);
  app.use("/leaderboard", leaderboardRouter);
  app.use("/groups", groupsRouter);

  return app;
}
