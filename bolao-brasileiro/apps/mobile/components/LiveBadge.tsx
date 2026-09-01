import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

export function LiveBadge({ minute }: { minute: number }) {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>{minute}&apos;</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.danger}22`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  text: {
    ...typography.caption,
    color: colors.danger,
  },
});
