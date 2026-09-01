import { StyleSheet, Text, View } from "react-native";
import type { LeaderboardEntry } from "@bolao/shared-types";
import { colors, radius, spacing, typography } from "../constants/theme";

const MEDAL_COLOR: Record<number, string> = {
  1: "#F5B14C",
  2: "#C4CBDB",
  3: "#C8824C",
};

export function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe?: boolean }) {
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={[styles.position, { backgroundColor: MEDAL_COLOR[entry.position] ?? colors.surfaceAlt }]}>
        <Text style={styles.positionText}>{entry.position}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {entry.userName}
        {isMe ? " (você)" : ""}
      </Text>
      <Text style={styles.points}>{entry.totalPoints} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowMe: {
    borderColor: colors.primary,
  },
  position: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    ...typography.caption,
    color: colors.background,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  points: {
    ...typography.heading,
    color: colors.primary,
  },
});
