import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Bet, Match, Team } from "@bolao/shared-types";
import { colors, radius, spacing, typography } from "../constants/theme";
import { LiveBadge } from "./LiveBadge";
import { TeamBadge } from "./TeamBadge";

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

interface RoundGameCardProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  myBet?: Bet;
  onPress?: () => void;
}

export function RoundGameCard({ match, homeTeam, awayTeam, myBet, onPress }: RoundGameCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const isScheduled = match.status === "SCHEDULED";
  const hasBet = !!myBet;

  return (
    <Pressable
      onPress={isScheduled ? onPress : undefined}
      style={[styles.card, isLive && styles.cardLive]}
    >
      <View style={styles.header}>
        {isLive ? (
          <LiveBadge minute={match.minute} />
        ) : (
          <Text style={styles.kickoff}>{formatKickoff(match.kickoffAt)}</Text>
        )}
        {isScheduled && (
          <View style={[styles.statusPill, hasBet ? styles.statusPillDone : styles.statusPillPending]}>
            <Text style={[styles.statusText, hasBet ? styles.statusTextDone : styles.statusTextPending]}>
              {hasBet ? "Palpite feito" : "Sem preenchimento"}
            </Text>
          </View>
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
          {isFinished || isLive ? (
            <Text style={styles.score}>
              {match.homeGoals} - {match.awayGoals}
            </Text>
          ) : (
            <Text style={styles.vs}>vs</Text>
          )}
          {hasBet && isScheduled && (
            <Text style={styles.betPreview}>
              seu palpite: {myBet.homeGoals}-{myBet.awayGoals}
            </Text>
          )}
        </View>

        <View style={styles.teamColumn}>
          <TeamBadge shortName={awayTeam?.shortName ?? "?"} />
          <Text style={styles.teamName} numberOfLines={1}>
            {awayTeam?.name ?? "—"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardLive: {
    borderColor: colors.danger,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kickoff: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "capitalize",
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusPillDone: {
    backgroundColor: `${colors.primary}22`,
  },
  statusPillPending: {
    backgroundColor: colors.surfaceAlt,
  },
  statusText: {
    ...typography.caption,
    fontSize: 10.5,
  },
  statusTextDone: {
    color: colors.primary,
  },
  statusTextPending: {
    color: colors.textMuted,
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
    fontSize: 12.5,
    textAlign: "center",
  },
  scoreBox: {
    paddingHorizontal: spacing.md,
    alignItems: "center",
    minWidth: 64,
  },
  score: {
    ...typography.heading,
    fontSize: 20,
    color: colors.textPrimary,
  },
  vs: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textMuted,
  },
  betPreview: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
