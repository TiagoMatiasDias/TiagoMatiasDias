import type { OutcomeDifficultyBonus, ScoreBreakdown } from "@bolao/scoring";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  crestUrl?: string;
  /** Posição atual na tabela do campeonato (1 = líder). */
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";

export interface Match {
  id: string;
  round: number;
  kickoffAt: string;
  status: MatchStatus;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  minute: number;
  /** Bônus de dificuldade calculado a partir da classificação dos dois times. */
  difficultyBonus: OutcomeDifficultyBonus;
}

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  /** Preenchido assim que a partida termina (ou parcialmente, ao vivo). */
  breakdown?: ScoreBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface LongTermOption {
  id: string;
  label: string;
}

export interface LongTermQuestion {
  id: string;
  title: string;
  description?: string;
  pointsIfCorrect: number;
  options: LongTermOption[];
  correctOptionId?: string;
  resolved: boolean;
  closesAt: string;
}

export interface LongTermAnswer {
  id: string;
  userId: string;
  questionId: string;
  optionId: string;
  points?: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalPoints: number;
  position: number;
}

/** Eventos emitidos pelo servidor via Socket.IO. */
export interface ServerToClientEvents {
  "match:update": (match: Match) => void;
  "bet:scored": (bet: Bet) => void;
  "leaderboard:update": (entries: LeaderboardEntry[]) => void;
}

export interface ClientToServerEvents {
  "subscribe:match": (matchId: string) => void;
  "subscribe:leaderboard": (poolId: string | null) => void;
}
