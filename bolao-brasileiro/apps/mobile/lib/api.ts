import Constants from "expo-constants";
import type {
  Bet,
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
};

export { ApiError };
