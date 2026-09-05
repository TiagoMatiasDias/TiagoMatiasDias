import { describe, expect, it } from "vitest";
import { calculateMatchBetScore, calculateFixedCategory } from "./matchScore.js";
import { computeOutcomeDifficultyBonus } from "./difficultyBonus.js";
import { expectedScore, updateElo } from "./elo.js";
import { calculateLongTermQuestionScore } from "./longTermQuestion.js";

describe("calculateFixedCategory", () => {
  it("placar exato", () => {
    expect(calculateFixedCategory({ home: 2, away: 1 }, { home: 2, away: 1 })).toBe(
      "EXACT_SCORE"
    );
  });

  it("acertou o empate mas não o placar exato", () => {
    expect(calculateFixedCategory({ home: 1, away: 1 }, { home: 2, away: 2 })).toBe(
      "DRAW"
    );
  });

  it("acertou o saldo de gols (mandante vence)", () => {
    // saldo previsto = +1, saldo real = +1
    expect(calculateFixedCategory({ home: 2, away: 1 }, { home: 3, away: 2 })).toBe(
      "GOAL_DIFFERENCE"
    );
  });

  it("acertou o saldo de gols (visitante vence)", () => {
    expect(calculateFixedCategory({ home: 0, away: 1 }, { home: 1, away: 2 })).toBe(
      "GOAL_DIFFERENCE"
    );
  });

  it("acertou os gols do vencedor (mas não o saldo nem placar exato)", () => {
    // real: 3x1 (mandante vence, saldo +2). previsto: 3x0 (mandante vence, saldo +3)
    // gols do vencedor (mandante) batem: 3 == 3
    expect(calculateFixedCategory({ home: 3, away: 0 }, { home: 3, away: 1 })).toBe(
      "WINNER_OR_LOSER_GOALS"
    );
  });

  it("acertou os gols do perdedor (mas não o saldo nem placar exato)", () => {
    // real: 3x1 (visitante perde com 1 gol). previsto: 4x1 (mandante vence, saldo +3)
    expect(calculateFixedCategory({ home: 4, away: 1 }, { home: 3, away: 1 })).toBe(
      "WINNER_OR_LOSER_GOALS"
    );
  });

  it("acertou só a direção do resultado, sem nenhuma faixa de gols", () => {
    // real: 2x0. previsto: 5x1 -> vencedor certo (mandante), mas nem saldo (+2 vs +4)
    // nem gols do vencedor (2 vs 5) nem gols do perdedor (0 vs 1) batem
    expect(calculateFixedCategory({ home: 5, away: 1 }, { home: 2, away: 0 })).toBe(
      "MISS"
    );
  });

  it("errou a direção do resultado (empate previsto, houve vencedor)", () => {
    expect(calculateFixedCategory({ home: 1, away: 1 }, { home: 2, away: 1 })).toBe(
      "MISS"
    );
  });

  it("errou completamente o vencedor", () => {
    expect(calculateFixedCategory({ home: 2, away: 0 }, { home: 0, away: 1 })).toBe(
      "MISS"
    );
  });
});

describe("calculateMatchBetScore - pontuação fixa", () => {
  it("placar exato vale 10 mesmo com poucos gols (sem bônus de 4+)", () => {
    const result = calculateMatchBetScore({ home: 1, away: 0 }, { home: 1, away: 0 });
    expect(result.fixedPoints).toBe(10);
    expect(result.fourPlusGoalsBonus).toBe(0);
    expect(result.total).toBe(10);
  });

  it("empate vale 6", () => {
    const result = calculateMatchBetScore({ home: 0, away: 0 }, { home: 1, away: 1 });
    expect(result.fixedPoints).toBe(6);
  });

  it("saldo de gols vale 6", () => {
    const result = calculateMatchBetScore({ home: 2, away: 1 }, { home: 3, away: 2 });
    expect(result.fixedPoints).toBe(6);
  });

  it("gols do vencedor/perdedor vale 4", () => {
    const result = calculateMatchBetScore({ home: 3, away: 0 }, { home: 3, away: 1 });
    expect(result.fixedPoints).toBe(4);
  });

  it("errar tudo vale 0 de pontos fixos e 0 de bônus de dificuldade", () => {
    const result = calculateMatchBetScore({ home: 2, away: 0 }, { home: 0, away: 1 });
    expect(result.fixedPoints).toBe(0);
    expect(result.outcomeDifficultyBonus).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe("calculateMatchBetScore - bônus de 4+ gols", () => {
  it("soma +4 quando palpite e resultado real têm 4 gols ou mais no total", () => {
    // 2x2 previsto (total 4), real 3x2 (total 5) -> saldo bate? previsto saldo 0, real saldo +1 -> não
    // mas ambos tem outcome diferente (empate previsto vs mandante vence) -> MISS na parte fixa,
    // porém o bônus de 4+ gols é independente
    const result = calculateMatchBetScore({ home: 2, away: 2 }, { home: 3, away: 2 });
    expect(result.fixedCategory).toBe("MISS");
    expect(result.fourPlusGoalsBonus).toBe(4);
    expect(result.total).toBe(4);
  });

  it("não soma bônus se o total previsto for menor que 4", () => {
    const result = calculateMatchBetScore({ home: 1, away: 2 }, { home: 2, away: 3 });
    expect(result.fourPlusGoalsBonus).toBe(0);
  });

  it("não soma bônus se o total real for menor que 4, mesmo com placar exato", () => {
    const result = calculateMatchBetScore({ home: 5, away: 5 }, { home: 1, away: 1 });
    expect(result.fourPlusGoalsBonus).toBe(0);
  });

  it("bônus de 4+ gols soma junto com o placar exato", () => {
    const result = calculateMatchBetScore({ home: 3, away: 2 }, { home: 3, away: 2 });
    expect(result.fixedPoints).toBe(10);
    expect(result.fourPlusGoalsBonus).toBe(4);
    expect(result.total).toBe(14);
  });
});

describe("computeOutcomeDifficultyBonus", () => {
  it("reproduz o exemplo do enunciado quando um time é um favorito quase absoluto", () => {
    const bonus = computeOutcomeDifficultyBonus(1700, 1200);
    expect(bonus).toEqual({ home: 2, draw: 4, away: 8 });
  });

  it("visitante favorito absoluto inverte os lados do bônus", () => {
    const bonus = computeOutcomeDifficultyBonus(1150, 1750);
    expect(bonus).toEqual({ home: 8, draw: 4, away: 2 });
  });

  it("jogo equilibrado (Elo igual) não zera o bônus — fica perto do baseline", () => {
    // Mandante ainda sai como leve favorito "de boca de urna" só pelo mando
    // de campo (ver homeAdvantage), mesmo com Elo idêntico.
    const bonus = computeOutcomeDifficultyBonus(1500, 1500);
    expect(bonus).toEqual({ home: 4, draw: 3, away: 5 });
  });

  it("dois favoritos ao título com Elo parecido geram bônus perto do baseline, mesmo em posições opostas na tabela", () => {
    // Cenário do enunciado: dois candidatos ao título se enfrentam cedo no
    // campeonato; um está em 1º e outro em último por causa de poucos jogos,
    // mas a força real dos dois (Elo) é praticamente a mesma — o bônus deve
    // ficar próximo do baseline (4/3/5), bem longe do extremo (2/4/8).
    const bonus = computeOutcomeDifficultyBonus(1620, 1600);
    expect(bonus).toEqual({ home: 4, draw: 3, away: 5 });
  });
});

describe("elo", () => {
  it("expectedScore é 0.5 para times com o mesmo rating", () => {
    expect(expectedScore(1500, 1500)).toBeCloseTo(0.5);
  });

  it("expectedScore favorece o time com Elo maior", () => {
    expect(expectedScore(1700, 1300)).toBeGreaterThan(0.5);
    expect(expectedScore(1300, 1700)).toBeLessThan(0.5);
  });

  it("updateElo aumenta o rating de quem venceu e diminui o do perdedor", () => {
    const result = updateElo({ eloHome: 1500, eloAway: 1500, homeGoals: 2, awayGoals: 0 });
    expect(result.eloHome).toBeGreaterThan(1500);
    expect(result.eloAway).toBeLessThan(1500);
    // soma total de Elo se conserva (é só transferência de pontos)
    expect(result.eloHome + result.eloAway).toBeCloseTo(3000, 5);
  });

  it("uma zebra (azarão vence) move o rating mais do que um resultado esperado", () => {
    const upsetResult = updateElo({ eloHome: 1300, eloAway: 1700, homeGoals: 1, awayGoals: 0 });
    const expectedResult = updateElo({ eloHome: 1700, eloAway: 1300, homeGoals: 1, awayGoals: 0 });
    const upsetGain = upsetResult.eloHome - 1300;
    const expectedGain = expectedResult.eloHome - 1700;
    expect(upsetGain).toBeGreaterThan(expectedGain);
  });

  it("uma goleada move mais pontos do que uma vitória por 1 gol", () => {
    const bigWin = updateElo({ eloHome: 1500, eloAway: 1500, homeGoals: 4, awayGoals: 0 });
    const narrowWin = updateElo({ eloHome: 1500, eloAway: 1500, homeGoals: 1, awayGoals: 0 });
    expect(bigWin.eloHome - 1500).toBeGreaterThan(narrowWin.eloHome - 1500);
  });
});

describe("calculateMatchBetScore - integração com bônus de dificuldade", () => {
  it("soma o bônus de dificuldade quando acerta a direção do resultado", () => {
    const difficultyBonus = computeOutcomeDifficultyBonus(1700, 1200); // {home:2, draw:4, away:8}
    // Palmeiras (mandante, favorito) vence por 2x0 - palpite acerta o saldo (6) mas não o placar exato
    const result = calculateMatchBetScore(
      { home: 3, away: 0 },
      { home: 2, away: 0 },
      difficultyBonus
    );
    expect(result.fixedCategory).toBe("WINNER_OR_LOSER_GOALS");
    expect(result.outcomeDifficultyBonus).toBe(2); // favorito venceu
    expect(result.total).toBe(4 + 2);
  });

  it("não soma bônus de dificuldade quando erra a direção do resultado", () => {
    const difficultyBonus = computeOutcomeDifficultyBonus(1700, 1200);
    const result = calculateMatchBetScore(
      { home: 0, away: 1 }, // previu visitante vencendo
      { home: 2, away: 0 }, // mandante venceu
      difficultyBonus
    );
    expect(result.outcomeDifficultyBonus).toBe(0);
  });

  it("zebra (azarão vence) rende o maior bônus de dificuldade", () => {
    const difficultyBonus = computeOutcomeDifficultyBonus(1700, 1200);
    const result = calculateMatchBetScore(
      { home: 0, away: 1 },
      { home: 0, away: 1 }, // lanterna (visitante) vence, zebra
      difficultyBonus
    );
    expect(result.fixedCategory).toBe("EXACT_SCORE");
    expect(result.outcomeDifficultyBonus).toBe(8);
    expect(result.total).toBe(18);
  });
});

describe("calculateLongTermQuestionScore", () => {
  it("concede os pontos ao acertar a resposta", () => {
    expect(
      calculateLongTermQuestionScore({
        pointsIfCorrect: 20,
        userAnswerOptionId: "artilheiro-1",
        correctOptionId: "artilheiro-1",
      })
    ).toBe(20);
  });

  it("não concede pontos ao errar", () => {
    expect(
      calculateLongTermQuestionScore({
        pointsIfCorrect: 20,
        userAnswerOptionId: "artilheiro-2",
        correctOptionId: "artilheiro-1",
      })
    ).toBe(0);
  });
});
