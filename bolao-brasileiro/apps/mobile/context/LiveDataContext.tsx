import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LeaderboardEntry, Match, Team } from "@bolao/shared-types";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

interface LiveDataContextValue {
  matches: Match[];
  teams: Team[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  teamById: Map<string, Team>;
  refresh: () => Promise<void>;
}

const LiveDataContext = createContext<LiveDataContextValue | null>(null);

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [matchesRes, leaderboardRes] = await Promise.all([
      api.getMatches(),
      api.getLeaderboard(),
    ]);
    setMatches(matchesRes.matches);
    setTeams(matchesRes.teams);
    setLeaderboard(leaderboardRes.entries);
    setLoading(false);
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));

    const socket = getSocket();

    const onMatchUpdate = (updated: Match) => {
      setMatches((prev) => {
        const exists = prev.some((m) => m.id === updated.id);
        return exists
          ? prev.map((m) => (m.id === updated.id ? updated : m))
          : [...prev, updated];
      });
    };

    const onLeaderboardUpdate = (entries: LeaderboardEntry[]) => {
      setLeaderboard(entries);
    };

    socket.on("match:update", onMatchUpdate);
    socket.on("leaderboard:update", onLeaderboardUpdate);

    return () => {
      socket.off("match:update", onMatchUpdate);
      socket.off("leaderboard:update", onLeaderboardUpdate);
    };
  }, []);

  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const value = useMemo(
    () => ({ matches, teams, leaderboard, loading, teamById, refresh }),
    [matches, teams, leaderboard, loading, teamById]
  );

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
}

export function useLiveData() {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error("useLiveData precisa estar dentro de <LiveDataProvider>");
  return ctx;
}
