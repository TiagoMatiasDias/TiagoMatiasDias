import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface RoundSelectorProps {
  rounds: number[];
  selectedRound: number;
  completeRounds: Set<number>;
  onSelect: (round: number) => void;
}

export function RoundSelector({ rounds, selectedRound, completeRounds, onSelect }: RoundSelectorProps) {
  return (
    <FlatList
      data={rounds}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(r) => String(r)}
      contentContainerStyle={styles.list}
      initialScrollIndex={Math.max(0, rounds.indexOf(selectedRound) - 2)}
      getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
      renderItem={({ item: round }) => {
        const selected = round === selectedRound;
        const complete = completeRounds.has(round);
        return (
          <Pressable onPress={() => onSelect(round)} style={[styles.pill, selected && styles.pillSelected]}>
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
              {String(round).padStart(2, "0")}
            </Text>
            {complete && (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={9} color={colors.background} />
              </View>
            )}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pill: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    ...typography.body,
    fontWeight: "700",
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: colors.background,
  },
  checkBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
