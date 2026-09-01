/**
 * Perguntas de longo prazo (ex: "Quem será o artilheiro do campeonato?").
 * Cada pergunta tem um valor de pontos fixo, definido pelo admin ao criá-la,
 * concedido integralmente a quem acertar a resposta quando ela é resolvida
 * ao final do campeonato (ou do período definido para a pergunta).
 */
export interface LongTermQuestionScoreInput {
  pointsIfCorrect: number;
  userAnswerOptionId: string;
  correctOptionId: string;
}

export function calculateLongTermQuestionScore(
  input: LongTermQuestionScoreInput
): number {
  return input.userAnswerOptionId === input.correctOptionId
    ? input.pointsIfCorrect
    : 0;
}
