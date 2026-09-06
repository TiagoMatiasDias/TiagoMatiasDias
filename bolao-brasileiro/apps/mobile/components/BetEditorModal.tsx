import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { Bet, Match, Team } from "@bolao/shared-types";
import { colors, radius, spacing, typography } from "../constants/theme";
import { PrimaryButton } from "./PrimaryButton";
import { ScoreStepper } from "./ScoreStepper";
import { TeamBadge } from "./TeamBadge";

interface BetEditorModalProps {
  match: Match | null;
  homeTeam?: Team;
  awayTeam?: Team;
  existingBet?: Bet;
  onClose: () => void;
  onSave: (homeGoals: number, awayGoals: number) => Promise<void>;
}

export function BetEditorModal({
  match,
  homeTeam,
  awayTeam,
  existingBet,
  onClose,
  onSave,
}: BetEditorModalProps) {
  const [homeGoals, setHomeGoals] = useState(existingBet?.homeGoals ?? 1);
  const [awayGoals, setAwayGoals] = useState(existingBet?.awayGoals ?? 1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHomeGoals(existingBet?.homeGoals ?? 1);
    setAwayGoals(existingBet?.awayGoals ?? 1);
  }, [match?.id, existingBet?.homeGoals, existingBet?.awayGoals]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(homeGoals, awayGoals);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={!!match} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          {match && (
            <>
              <Text style={styles.title}>Seu palpite</Text>

              <View style={styles.editorRow}>
                <View style={styles.teamColumn}>
                  <TeamBadge shortName={homeTeam?.shortName ?? "?"} size={40} />
                  <Text style={styles.teamName} numberOfLines={1}>
                    {homeTeam?.name ?? "—"}
                  </Text>
                </View>
                <ScoreStepper label="" value={homeGoals} onChange={setHomeGoals} />
                <Text style={styles.x}>×</Text>
                <ScoreStepper label="" value={awayGoals} onChange={setAwayGoals} />
                <View style={styles.teamColumn}>
                  <TeamBadge shortName={awayTeam?.shortName ?? "?"} size={40} />
                  <Text style={styles.teamName} numberOfLines={1}>
                    {awayTeam?.name ?? "—"}
                  </Text>
                </View>
              </View>

              <PrimaryButton
                label={existingBet ? "Atualizar palpite" : "Salvar palpite"}
                onPress={handleSave}
                loading={saving}
              />
              <PrimaryButton label="Cancelar" onPress={onClose} variant="outline" style={styles.secondaryButton} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center",
  },
  editorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  teamColumn: {
    alignItems: "center",
    gap: spacing.xs,
    width: 64,
  },
  teamName: {
    ...typography.body,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
  x: {
    ...typography.heading,
    color: colors.textMuted,
  },
  secondaryButton: {
    marginTop: spacing.xs,
  },
});
