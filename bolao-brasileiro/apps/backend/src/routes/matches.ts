import { Router } from "express";
import { matches, teams } from "../store.js";

export const matchesRouter = Router();

matchesRouter.get("/", (_req, res) => {
  res.json({ matches, teams });
});

matchesRouter.get("/:id", (req, res) => {
  const match = matches.find((m) => m.id === req.params.id);
  if (!match) {
    res.status(404).json({ error: "Partida não encontrada" });
    return;
  }
  res.json({ match });
});
