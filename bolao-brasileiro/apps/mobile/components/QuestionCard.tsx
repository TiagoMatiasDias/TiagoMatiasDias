import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LongTermQuestion } from "@bolao/shared-types";
import { colors, radius, spacing, typography } from "../constants/theme";

interface QuestionCardProps {
  question: LongTermQuestion;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function QuestionCard({ question, selectedOptionId, onSelect, disabled }: QuestionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{question.title}</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{question.pointsIfCorrect} pts</Text>
        </View>
      </View>

      <View style={styles.options}>
        {question.options.map((option) => {
          const selected = option.id === selectedOptionId;
          const isCorrect = question.resolved && option.id === question.correctOptionId;
          return (
            <Pressable
              key={option.id}
              onPress={() => !disabled && !question.resolved && onSelect(option.id)}
              style={[
                styles.option,
                selected && styles.optionSelected,
                isCorrect && styles.optionCorrect,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  (selected || isCorrect) && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {question.resolved && (
        <Text style={styles.resolvedNote}>Pergunta encerrada</Text>
      )}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: `${colors.gold}26`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pointsText: {
    ...typography.caption,
    color: colors.gold,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}26`,
  },
  optionCorrect: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}26`,
  },
  optionText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  resolvedNote: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
