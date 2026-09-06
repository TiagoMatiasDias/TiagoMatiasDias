import Constants from "expo-constants";
import type {
  Bet,
  Group,
  GroupIcon,
  GroupMember,
  LeaderboardEntry,
  LongTermAnswer,
  LongTermQuestion,
  Match,
  Team,
  User,
} from "@bolao/shared-types";

export const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "http://localhost:4000";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(json?.error?.toString() ?? "Erro inesperado", res.status);
  }
  return json as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  getMatches: () => request<{ matches: Match[]; teams: Team[] }>("/matches"),

  getMyBets: (token: string) => request<{ bets: Bet[] }>("/bets", { token }),

  upsertBet: (token: string, matchId: string, homeGoals: number, awayGoals: number) =>
    request<{ bet: Bet }>("/bets", {
      method: "POST",
      token,
      body: { matchId, homeGoals, awayGoals },
    }),

  getLongTermQuestions: () =>
    request<{ questions: LongTermQuestion[] }>("/longterm"),

  getMyLongTermAnswers: (token: string) =>
    request<{ answers: LongTermAnswer[] }>("/longterm/answers", { token }),

  answerLongTermQuestion: (token: string, questionId: string, optionId: string) =>
    request<{ answer: LongTermAnswer }>("/longterm/answers", {
      method: "POST",
      token,
      body: { questionId, optionId },
    }),

  getLeaderboard: () => request<{ entries: LeaderboardEntry[] }>("/leaderboard"),

  listGroups: (token: string) => request<{ groups: Group[] }>("/groups", { token }),

  createGroup: (token: string, name: string, icon: GroupIcon) =>
    request<{ group: Group }>("/groups", { method: "POST", token, body: { name, icon } }),

  joinGroup: (token: string, inviteCode: string) =>
    request<{ group: Group }>("/groups/join", { method: "POST", token, body: { inviteCode } }),

  getGroup: (token: string, groupId: string) =>
    request<{ group: Group; members: GroupMember[] }>(`/groups/${groupId}`, { token }),
};

export { ApiError };
