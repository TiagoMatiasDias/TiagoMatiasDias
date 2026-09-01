import { StyleSheet, Text, View } from "react-native";
import type { ScoreBreakdown } from "@bolao/scoring";
import { colors, radius, spacing, typography } from "../constants/theme";

const CATEGORY_LABEL: Record<ScoreBreakdown["fixedCategory"], string> = {
  EXACT_SCORE: "Placar exato",
  GOAL_DIFFERENCE: "Saldo de gols",
  WINNER_OR_LOSER_GOALS: "Gols do vencedor/perdedor",
  DRAW: "Empate",
  MISS: "Sem pontuação fixa",
};

export function PointsPill({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <View style={styles.container}>
      <View style={styles.totalBadge}>
        <Text style={styles.totalText}>{breakdown.total} pts</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailText}>{CATEGORY_LABEL[breakdown.fixedCategory]}</Text>
        {breakdown.outcomeDifficultyBonus > 0 && (
          <Text style={styles.bonusText}>
            +{breakdown.outcomeDifficultyBonus} dificuldade
          </Text>
        )}
        {breakdown.fourPlusGoalsBonus > 0 && (
          <Text style={styles.bonusText}>+{breakdown.fourPlusGoalsBonus} (4+ gols)</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  totalBadge: {
    backgroundColor: `${colors.primary}26`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  totalText: {
    ...typography.caption,
    color: colors.primary,
  },
  details: {
    flexShrink: 1,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  bonusText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "700",
  },
});
