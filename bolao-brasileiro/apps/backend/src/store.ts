import { randomUUID } from "node:crypto";
import { computeOutcomeDifficultyBonus, DEFAULT_ELO, updateElo } from "@bolao/scoring";
import { REAL_FIXTURES_2026 } from "./fixtures/brasileirao2026.js";
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

/**
 * Os 20 clubes confirmados na Série A 2026: os 16 que permaneceram da Série
 * A 2025 (nesta ordem, a posição final de 2025 — melhor lá em cima) mais os
 * 4 que subiram da Série B 2025 (Coritiba campeão, Athletico-PR,
 * Chapecoense e Remo). Usar a posição de 2025 como ordem aqui só serve pra
 * dar um ponto de partida razoável pro Elo inicial (`eloByTeamId` abaixo) —
 * não é usada pra nada além disso.
 */
const CLUB_NAMES: Array<[string, string]> = [
  ["Flamengo", "FLA"],
  ["Palmeiras", "PAL"],
  ["Cruzeiro", "CRU"],
  ["Mirassol", "MIR"],
  ["Fluminense", "FLU"],
  ["Botafogo", "BOT"],
  ["Bahia", "BAH"],
  ["São Paulo", "SAO"],
  ["Grêmio", "GRE"],
  ["Bragantino", "BRA"],
  ["Atlético-MG", "CAM"],
  ["Santos", "SAN"],
  ["Corinthians", "COR"],
  ["Vasco da Gama", "VAS"],
  ["Vitória", "VIT"],
  ["Internacional", "INT"],
  ["Coritiba", "CFC"],
  ["Athletico-PR", "CAP"],
  ["Chapecoense", "CHA"],
  ["Clube do Remo", "REM"],
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
 * Jogos que, segundo o calendário real, já deveriam ter acontecido (data no
 * passado) mas ainda não têm resultado registrado (adiados, ou é hoje e o
 * usuário só nos passou o calendário, não o resultado ao vivo). Escolhemos
 * um deles pra ficar "ao vivo" agora (pro simulador de gols ter o que
 * simular) e empurramos os outros pra um horário seguro mais à frente — sem
 * isso, o `MockLiveProvider` promoveria vários pra "ao vivo" de uma vez só
 * assim que o servidor subisse, já que a data real deles já passou.
 */
function scheduleUpcomingMatches(pending: Match[], now: number): void {
  const due = pending
    .filter((m) => new Date(m.kickoffAt).getTime() <= now)
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());

  due.forEach((match, index) => {
    if (index === 0) {
      match.status = "LIVE";
      match.minute = 1;
      match.kickoffAt = new Date(now - 5 * 60 * 1000).toISOString();
    } else {
      match.kickoffAt = new Date(now + index * 3 * 60 * 60 * 1000).toISOString();
    }
  });
}

function buildCalendar(): Match[] {
  const now = Date.now();
  const allMatches: Match[] = [];
  const pending: Match[] = [];

  const sortedFixtures = [...REAL_FIXTURES_2026].sort((a, b) => a.round - b.round);

  for (const fixture of sortedFixtures) {
    const homeTeamId = `team-${fixture.home}`;
    const awayTeamId = `team-${fixture.away}`;
    const played = fixture.homeGoals !== null && fixture.awayGoals !== null;

    const match: Match = {
      id: randomUUID(),
      round: fixture.round,
      kickoffAt: fixture.isoDate,
      status: played ? "FINISHED" : "SCHEDULED",
      homeTeamId,
      awayTeamId,
      homeGoals: fixture.homeGoals ?? 0,
      awayGoals: fixture.awayGoals ?? 0,
      minute: 0,
      // Calculado com o Elo ANTES desse jogo — para os já encerrados isso
      // reconstitui a "linha de aposta" da época; para os pendentes, é o
      // bônus vigente até que outro jogo pendente termine.
      difficultyBonus: difficultyBonusFor(homeTeamId, awayTeamId),
    };

    if (played) {
      recordMatchResultForElo(match);
    } else {
      pending.push(match);
    }

    allMatches.push(match);
  }

  scheduleUpcomingMatches(pending, now);

  return allMatches;
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
