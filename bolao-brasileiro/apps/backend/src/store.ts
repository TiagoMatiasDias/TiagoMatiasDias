import { randomUUID } from "node:crypto";
import { computeOutcomeDifficultyBonus, DEFAULT_ELO, updateElo } from "@bolao/scoring";
import { generateDoubleRoundRobin } from "./fixtures/roundRobin.js";
import type {
  Bet,
  Group,
  GroupMember,
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

/**
 * Rating de força de cada time (ver `@bolao/scoring/elo`). Ao contrário da
 * posição na tabela, não reseta a cada rodada — evolui aos poucos conforme
 * os jogos terminam (ver `recordMatchResultForElo`). A semente inicial abaixo
 * é só um placeholder de demonstração; numa integração real valeria semear
 * com o Elo final da temporada anterior.
 */
const eloByTeamId = new Map<string, number>(
  teams.map((team, index) => [team.id, DEFAULT_ELO + (9 - index) * 22])
);

function difficultyBonusFor(homeTeamId: string, awayTeamId: string) {
  return computeOutcomeDifficultyBonus(
    eloByTeamId.get(homeTeamId) ?? DEFAULT_ELO,
    eloByTeamId.get(awayTeamId) ?? DEFAULT_ELO
  );
}

/**
 * Atualiza o Elo dos dois times a partir do resultado final de uma partida.
 * Chamado quando uma partida termina (ver `liveEngine.ts`) — afeta o bônus
 * de dificuldade calculado para os PRÓXIMOS jogos desses times, nunca o da
 * partida que acabou de terminar (o bônus de uma partida é fixado quando ela
 * é criada, como a linha de uma casa de apostas antes do apito inicial).
 */
export function recordMatchResultForElo(match: Match) {
  const eloHome = eloByTeamId.get(match.homeTeamId) ?? DEFAULT_ELO;
  const eloAway = eloByTeamId.get(match.awayTeamId) ?? DEFAULT_ELO;

  const updated = updateElo({
    eloHome,
    eloAway,
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
  });

  eloByTeamId.set(match.homeTeamId, updated.eloHome);
  eloByTeamId.set(match.awayTeamId, updated.eloAway);
}

/**
 * Amostra de uma distribuição de Poisson (algoritmo de Knuth) — usada só
 * para gerar placares plausíveis para as rodadas simuladas do calendário
 * de demonstração (mais gols pra quem tem Elo mais alto, dentro do razoável
 * pro futebol: média em torno de 1 a 2 gols por time).
 */
function poissonGoals(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function simulatedGoalsFor(eloFor: number, eloAgainst: number): number {
  // Elo mais alto puxa a média de gols um pouco pra cima (e vice-versa),
  // mantendo a média geral do futebol (~1.3 gols por time).
  const lambda = Math.min(3, Math.max(0.5, 1.3 + (eloFor - eloAgainst) / 500));
  return poissonGoals(lambda);
}

const ROUND_INTERVAL_DAYS = 7;
/** Rodada "atual": as anteriores já aconteceram (FINISHED), as seguintes são futuras. */
const CURRENT_ROUND = 21;

// Espalha os 10 jogos de uma rodada ao longo de ~4 dias (sexta a segunda),
// como uma rodada de futebol de verdade — evita 10 jogos todos na mesma
// hora do mesmo dia.
const ROUND_DAY_SPREAD = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3];
const ROUND_HOUR_SPREAD = [16, 19, 11, 16, 18, 11, 16, 18, 20, 20];

function kickoffFor(round: number, indexInRound: number, forcePast: boolean): Date {
  if (forcePast) {
    // Garante que o jogo escolhido pra abrir a rodada atual já esteja
    // "rolando" quando o servidor sobe, sem depender de coincidência de horário.
    return new Date(Date.now() - 5 * 60 * 1000);
  }

  const roundBaseDaysFromNow = (round - CURRENT_ROUND) * ROUND_INTERVAL_DAYS;
  const dayOffset = ROUND_DAY_SPREAD[indexInRound % ROUND_DAY_SPREAD.length];
  const hour = ROUND_HOUR_SPREAD[indexInRound % ROUND_HOUR_SPREAD.length];
  // Na rodada atual, os outros jogos (que não o escolhido pra estar ao vivo)
  // nunca podem cair "hoje ou antes" — senão o simulador os promoveria pra
  // ao vivo sozinho assim que o servidor iniciasse.
  const effectiveDayOffset = round === CURRENT_ROUND ? Math.max(dayOffset, 1) : dayOffset;

  const kickoff = new Date(Date.now() + (roundBaseDaysFromNow + effectiveDayOffset) * 24 * 60 * 60 * 1000);
  kickoff.setHours(hour, 0, 0, 0);
  return kickoff;
}

function buildCalendar(): Match[] {
  const fixturesByRound = generateDoubleRoundRobin(teams.map((t) => t.id));
  const allMatches: Match[] = [];

  fixturesByRound.forEach((fixtures, roundIndex) => {
    const round = roundIndex + 1;

    fixtures.forEach(({ homeTeamId, awayTeamId }, indexInRound) => {
      const isPast = round < CURRENT_ROUND;
      const isFirstOfCurrentRound = round === CURRENT_ROUND && indexInRound === 0;
      const kickoffAt = kickoffFor(round, indexInRound, isFirstOfCurrentRound);
      const difficultyBonus = difficultyBonusFor(homeTeamId, awayTeamId);

      const match: Match = {
        id: randomUUID(),
        round,
        kickoffAt: kickoffAt.toISOString(),
        status: isPast ? "FINISHED" : isFirstOfCurrentRound ? "LIVE" : "SCHEDULED",
        homeTeamId,
        awayTeamId,
        homeGoals: 0,
        awayGoals: 0,
        minute: isFirstOfCurrentRound ? 1 : 0,
        difficultyBonus,
      };

      if (isPast) {
        const homeElo = currentEloOf(homeTeamId);
        const awayElo = currentEloOf(awayTeamId);
        match.homeGoals = simulatedGoalsFor(homeElo, awayElo);
        match.awayGoals = simulatedGoalsFor(awayElo, homeElo);
        recordMatchResultForElo(match);
      }

      allMatches.push(match);
    });
  });

  return allMatches;
}

function currentEloOf(teamId: string): number {
  return eloByTeamId.get(teamId) ?? DEFAULT_ELO;
}

export const matches: Match[] = buildCalendar();
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
  {
    id: "user-demo-2",
    name: "Maria",
    email: "maria@exemplo.com",
    passwordHash: DEMO_PASSWORD_HASH, // mesma senha de demo: "bolao123"
  },
];

export const bets: Bet[] = [];
export const betsById = new Map<string, Bet>();

export const groups: Group[] = [];
export const groupMembers: GroupMember[] = [];

const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I/O/0/1, evita confusão

function generateInviteCode(): string {
  let code: string;
  do {
    code = Array.from({ length: 6 }, () =>
      INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)]
    ).join("");
  } while (groups.some((g) => g.inviteCode === code));
  return code;
}

export function createGroup(name: string, icon: Group["icon"], adminUserId: string): Group {
  const group: Group = {
    id: randomUUID(),
    name,
    icon,
    inviteCode: generateInviteCode(),
    adminUserId,
    memberCount: 1,
    createdAt: new Date().toISOString(),
  };
  groups.push(group);

  const admin = users.find((u) => u.id === adminUserId)!;
  groupMembers.push({
    id: randomUUID(),
    groupId: group.id,
    userId: admin.id,
    userName: admin.name,
    avatarUrl: admin.avatarUrl,
    role: "ADMIN",
    joinedAt: group.createdAt,
  });

  return group;
}

export function joinGroupByInviteCode(inviteCode: string, userId: string): Group | null {
  const group = groups.find((g) => g.inviteCode === inviteCode.toUpperCase());
  if (!group) return null;

  const alreadyMember = groupMembers.some(
    (m) => m.groupId === group.id && m.userId === userId
  );
  if (alreadyMember) return group;

  const user = users.find((u) => u.id === userId)!;
  groupMembers.push({
    id: randomUUID(),
    groupId: group.id,
    userId: user.id,
    userName: user.name,
    avatarUrl: user.avatarUrl,
    role: "MEMBER",
    joinedAt: new Date().toISOString(),
  });
  group.memberCount += 1;

  return group;
}

export function groupsForUser(userId: string): Group[] {
  const groupIds = new Set(
    groupMembers.filter((m) => m.userId === userId).map((m) => m.groupId)
  );
  return groups.filter((g) => groupIds.has(g.id));
}

export function membersOfGroup(groupId: string): GroupMember[] {
  return groupMembers.filter((m) => m.groupId === groupId);
}

export function isGroupMember(groupId: string, userId: string): boolean {
  return groupMembers.some((m) => m.groupId === groupId && m.userId === userId);
}

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
