import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { calculateLongTermQuestionScore } from "@bolao/scoring";
import { longTermAnswers, longTermQuestions } from "../store.js";
import { requireAuth } from "../middleware/auth.js";

export const longTermRouter = Router();

longTermRouter.get("/", (_req, res) => {
  res.json({ questions: longTermQuestions });
});

const answerSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
});

longTermRouter.post("/answers", requireAuth, (req, res) => {
  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { questionId, optionId } = parsed.data;

  const question = longTermQuestions.find((q) => q.id === questionId);
  if (!question) {
    res.status(404).json({ error: "Pergunta não encontrada" });
    return;
  }
  if (question.resolved) {
    res.status(409).json({ error: "Pergunta já foi resolvida, não é mais possível responder" });
    return;
  }
  if (!question.options.some((o) => o.id === optionId)) {
    res.status(400).json({ error: "Opção inválida" });
    return;
  }

  const userId = req.userId!;
  let answer = longTermAnswers.find((a) => a.userId === userId && a.questionId === questionId);
  if (answer) {
    answer.optionId = optionId;
  } else {
    answer = { id: randomUUID(), userId, questionId, optionId };
    longTermAnswers.push(answer);
  }

  res.json({ answer });
});

longTermRouter.get("/answers", requireAuth, (req, res) => {
  const userAnswers = longTermAnswers.filter((a) => a.userId === req.userId);
  res.json({ answers: userAnswers });
});

/**
 * Resolve uma pergunta de longo prazo (uso administrativo): define a opção
 * correta e concede os pontos a todos que responderam certo.
 */
longTermRouter.post("/:id/resolve", (req, res) => {
  const question = longTermQuestions.find((q) => q.id === req.params.id);
  if (!question) {
    res.status(404).json({ error: "Pergunta não encontrada" });
    return;
  }
  const { correctOptionId } = z.object({ correctOptionId: z.string() }).parse(req.body);
  if (!question.options.some((o) => o.id === correctOptionId)) {
    res.status(400).json({ error: "Opção inválida" });
    return;
  }

  question.correctOptionId = correctOptionId;
  question.resolved = true;

  const scored = longTermAnswers
    .filter((a) => a.questionId === question.id)
    .map((answer) => {
      answer.points = calculateLongTermQuestionScore({
        pointsIfCorrect: question.pointsIfCorrect,
        userAnswerOptionId: answer.optionId,
        correctOptionId,
      });
      return answer;
    });

  res.json({ question, scoredAnswers: scored });
});
