import { StyleSheet, Text, View } from "react-native";
import type { Bet, Match, Team } from "@bolao/shared-types";
import { colors, radius, spacing, typography } from "../constants/theme";
import { LiveBadge } from "./LiveBadge";
import { PointsPill } from "./PointsPill";
import { TeamBadge } from "./TeamBadge";

const STATUS_LABEL: Record<Match["status"], string> = {
  SCHEDULED: "Agendado",
  LIVE: "Ao vivo",
  FINISHED: "Encerrado",
  POSTPONED: "Adiado",
};

function formatKickoff(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MatchCardProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  myBet?: Bet;
  children?: React.ReactNode;
}

export function MatchCard({ match, homeTeam, awayTeam, myBet, children }: MatchCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <View style={[styles.card, isLive && styles.cardLive]}>
      <View style={styles.header}>
        <Text style={styles.round}>Rodada {match.round}</Text>
        {isLive ? (
          <LiveBadge minute={match.minute} />
        ) : (
          <Text style={styles.status}>
            {isFinished ? STATUS_LABEL.FINISHED : formatKickoff(match.kickoffAt)}
          </Text>
        )}
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.teamColumn}>
          <TeamBadge shortName={homeTeam?.shortName ?? "?"} />
          <Text style={styles.teamName} numberOfLines={1}>
            {homeTeam?.name ?? "—"}
          </Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.score}>
            {match.status === "SCHEDULED" ? "vs" : `${match.homeGoals} - ${match.awayGoals}`}
          </Text>
        </View>

        <View style={styles.teamColumn}>
          <TeamBadge shortName={awayTeam?.shortName ?? "?"} />
          <Text style={styles.teamName} numberOfLines={1}>
            {awayTeam?.name ?? "—"}
          </Text>
        </View>
      </View>

      {myBet && (
        <View style={styles.betRow}>
          <Text style={styles.betLabel}>
            Seu palpite: {myBet.homeGoals} - {myBet.awayGoals}
          </Text>
          {myBet.breakdown && <PointsPill breakdown={myBet.breakdown} />}
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardLive: {
    borderColor: colors.danger,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  round: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  status: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamColumn: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  teamName: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 13,
    textAlign: "center",
  },
  scoreBox: {
    paddingHorizontal: spacing.lg,
  },
  score: {
    ...typography.title,
    color: colors.textPrimary,
  },
  betRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  betLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
});
