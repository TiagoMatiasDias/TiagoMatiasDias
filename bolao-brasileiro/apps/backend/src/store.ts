import { randomUUID } from "node:crypto";
import { computeOutcomeDifficultyBonus } from "@bolao/scoring";
import type {
  Bet,
  LongTermAnswer,
  LongTermQuestion,
  Match,
  Team,
  User,
} from "@bolao/shared-types";

/**
 * Repositório em memória usado pelo servidor de desenvolvimento/demo, para
 * que o backend rode sem precisar de um Postgres provisionado. Substituir
 * por Prisma (ver prisma/schema.prisma) é o próximo passo antes de produção.
 */

const CLUB_NAMES: Array<[string, string]> = [
  ["Palmeiras", "PAL"],
  ["Flamengo", "FLA"],
  ["Botafogo", "BOT"],
  ["Fortaleza", "FOR"],
  ["Internacional", "INT"],
  ["Atlético-MG", "CAM"],
  ["São Paulo", "SAO"],
  ["Corinthians", "COR"],
  ["Cruzeiro", "CRU"],
  ["Grêmio", "GRE"],
  ["Bahia", "BAH"],
  ["Vasco da Gama", "VAS"],
  ["Athletico-PR", "CAP"],
  ["Fluminense", "FLU"],
  ["Bragantino", "BRA"],
  ["Criciúma", "CRI"],
  ["Cuiabá", "CUI"],
  ["Vitória", "VIT"],
  ["Juventude", "JUV"],
  ["Atlético-GO", "ACG"],
];

export const championshipId = "brasileirao-2026";

export const teams: Team[] = CLUB_NAMES.map(([name, shortName], index) => {
  const position = index + 1;
  const played = 20;
  const won = Math.max(0, 14 - index);
  const lost = Math.max(0, index - 4);
  const drawn = played - won - lost;
  return {
    id: `team-${shortName.toLowerCase()}`,
    name,
    shortName,
    position,
    points: won * 3 + drawn,
    played,
    won,
    drawn,
    lost,
    goalsFor: Math.max(10, 45 - index * 2),
    goalsAgainst: 15 + index,
  };
});

const teamsById = new Map(teams.map((t) => [t.id, t]));

function difficultyBonusFor(homeTeamId: string, awayTeamId: string) {
  const home = teamsById.get(homeTeamId)!;
  const away = teamsById.get(awayTeamId)!;
  return computeOutcomeDifficultyBonus(home.position, away.position, teams.length);
}

function makeMatch(round: number, homeTeamId: string, awayTeamId: string, hoursFromNow: number): Match {
  return {
    id: randomUUID(),
    round,
    kickoffAt: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString(),
    status: hoursFromNow <= 0 ? "LIVE" : "SCHEDULED",
    homeTeamId,
    awayTeamId,
    homeGoals: 0,
    awayGoals: 0,
    minute: hoursFromNow <= 0 ? 1 : 0,
    difficultyBonus: difficultyBonusFor(homeTeamId, awayTeamId),
  };
}

export const matches: Match[] = [
  makeMatch(21, "team-pal", "team-acg", 0), // líder x lanterna, ao vivo (exemplo do enunciado)
  makeMatch(21, "team-fla", "team-bot", -0.2),
  makeMatch(21, "team-cor", "team-sao", 2),
  makeMatch(21, "team-int", "team-gre", 24),
  makeMatch(21, "team-cru", "team-flu", 48),
];

export const matchesById = new Map(matches.map((m) => [m.id, m]));

export interface StoredUser extends User {
  passwordHash: string;
}

// Senha de demonstração: "bolao123" (hash bcrypt fixo, apenas para dev).
const DEMO_PASSWORD_HASH = "$2a$10$2Flk41T24s/aqM/YkDx.5.TY2V7WykajD/v2jrMiJEAvieehfSuca";

export const users: StoredUser[] = [
  {
    id: "user-demo",
    name: "Tiago",
    email: "tiagomatiasdias@hotmail.com",
    passwordHash: DEMO_PASSWORD_HASH,
  },
];

export const bets: Bet[] = [];
export const betsById = new Map<string, Bet>();

export const longTermQuestions: LongTermQuestion[] = [
  {
    id: "q-artilheiro",
    title: "Quem será o artilheiro do campeonato?",
    pointsIfCorrect: 20,
    resolved: false,
    closesAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    options: [
      { id: "opt-1", label: "Endrick" },
      { id: "opt-2", label: "Pedro" },
      { id: "opt-3", label: "Hulk" },
      { id: "opt-4", label: "Yuri Alberto" },
    ],
  },
  {
    id: "q-assistencias",
    title: "Quem dará mais assistências no campeonato?",
    pointsIfCorrect: 15,
    resolved: false,
    closesAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    options: [
      { id: "opt-1", label: "Arrascaeta" },
      { id: "opt-2", label: "Raphael Veiga" },
      { id: "opt-3", label: "Rony" },
    ],
  },
  {
    id: "q-campeao",
    title: "Quem será o campeão brasileiro?",
    pointsIfCorrect: 30,
    resolved: false,
    closesAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    options: teams.slice(0, 8).map((t) => ({ id: t.id, label: t.name })),
  },
];

export const longTermAnswers: LongTermAnswer[] = [];
