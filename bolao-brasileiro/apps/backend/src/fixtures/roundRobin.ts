export interface Fixture {
  homeTeamId: string;
  awayTeamId: string;
}

/**
 * Gera o calendário de returno (cada dupla de times se enfrenta 2x, uma em
 * casa e uma fora) pelo método do círculo: fixa o primeiro time e roda os
 * demais a cada rodada do primeiro turno; o returno espelha as mesmas
 * partidas com mandante/visitante invertidos.
 *
 * Para N times (par), gera 2×(N-1) rodadas de N/2 jogos cada — para 20
 * times, 38 rodadas de 10 jogos, igual ao Brasileirão.
 */
export function generateDoubleRoundRobin(teamIds: string[]): Fixture[][] {
  const firstTurn = generateSingleRoundRobin(teamIds);
  const secondTurn = firstTurn.map((round) =>
    round.map(({ homeTeamId, awayTeamId }) => ({
      homeTeamId: awayTeamId,
      awayTeamId: homeTeamId,
    }))
  );
  return [...firstTurn, ...secondTurn];
}

function generateSingleRoundRobin(teamIds: string[]): Fixture[][] {
  const n = teamIds.length;
  if (n < 2 || n % 2 !== 0) {
    throw new Error("generateSingleRoundRobin precisa de um número par de times (>= 2)");
  }

  const fixed = teamIds[0];
  const rotating = teamIds.slice(1);
  const rounds: Fixture[][] = [];

  for (let round = 0; round < n - 1; round++) {
    const roundTeams = [fixed, ...rotating];
    const fixtures: Fixture[] = [];

    for (let i = 0; i < n / 2; i++) {
      const teamA = roundTeams[i];
      const teamB = roundTeams[n - 1 - i];
      // Alterna quem manda em casa a cada rodada para equilibrar o turno.
      fixtures.push(
        round % 2 === 0
          ? { homeTeamId: teamA, awayTeamId: teamB }
          : { homeTeamId: teamB, awayTeamId: teamA }
      );
    }

    rounds.push(fixtures);
    rotating.unshift(rotating.pop()!);
  }

  return rounds;
}
