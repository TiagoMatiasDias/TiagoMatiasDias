import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface ScoreStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ScoreStepper({ label, value, onChange }: ScoreStepperProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onChange(Math.max(0, value - 1))}
          style={styles.stepButton}
          hitSlop={8}
        >
          <Text style={styles.stepButtonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          onPress={() => onChange(Math.min(20, value + 1))}
          style={styles.stepButton}
          hitSlop={8}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stepButton: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: -2,
  },
  value: {
    ...typography.heading,
    color: colors.textPrimary,
    minWidth: 22,
    textAlign: "center",
  },
});
