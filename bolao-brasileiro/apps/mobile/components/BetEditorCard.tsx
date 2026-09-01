import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Bet, Match, Team } from "@bolao/shared-types";
import { colors, spacing, typography } from "../constants/theme";
import { MatchCard } from "./MatchCard";
import { PrimaryButton } from "./PrimaryButton";
import { ScoreStepper } from "./ScoreStepper";

interface BetEditorCardProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  existingBet?: Bet;
  onSave: (homeGoals: number, awayGoals: number) => Promise<void>;
}

export function BetEditorCard({ match, homeTeam, awayTeam, existingBet, onSave }: BetEditorCardProps) {
  const [homeGoals, setHomeGoals] = useState(existingBet?.homeGoals ?? 1);
  const [awayGoals, setAwayGoals] = useState(existingBet?.awayGoals ?? 1);
  const [saving, setSaving] = useState(false);

  const dirty = homeGoals !== existingBet?.homeGoals || awayGoals !== existingBet?.awayGoals;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(homeGoals, awayGoals);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MatchCard match={match} homeTeam={homeTeam} awayTeam={awayTeam}>
      <View style={styles.editorRow}>
        <ScoreStepper label={homeTeam?.shortName ?? "Casa"} value={homeGoals} onChange={setHomeGoals} />
        <Text style={styles.x}>×</Text>
        <ScoreStepper label={awayTeam?.shortName ?? "Fora"} value={awayGoals} onChange={setAwayGoals} />
      </View>
      <PrimaryButton
        label={existingBet ? "Atualizar palpite" : "Salvar palpite"}
        onPress={handleSave}
        loading={saving}
        disabled={!dirty}
      />
    </MatchCard>
  );
}

const styles = StyleSheet.create({
  editorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  x: {
    ...typography.heading,
    color: colors.textMuted,
  },
});
