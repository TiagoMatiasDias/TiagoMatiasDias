import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";
import { ApiError } from "../lib/api";
import { useGroups } from "../context/GroupsContext";
import { PrimaryButton } from "./PrimaryButton";

interface JoinGroupModalProps {
  visible: boolean;
  onClose: () => void;
}

export function JoinGroupModal({ visible, onClose }: JoinGroupModalProps) {
  const { joinGroup } = useGroups();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setCode("");
    setError(null);
    onClose();
  };

  const handleJoin = async () => {
    if (!code.trim()) {
      setError("Digite o código de convite");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await joinGroup(code.trim());
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar no grupo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Fui convidado</Text>
          <Text style={styles.subtitle}>Digite o código de convite que você recebeu.</Text>

          <TextInput
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            placeholder="EX: LZGZAY"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={styles.input}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton label="Entrar no grupo" onPress={handleJoin} loading={submitting} />
          <PrimaryButton label="Cancelar" onPress={handleClose} variant="outline" style={styles.secondaryButton} />
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
    fontSize: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 18,
    letterSpacing: 3,
    textAlign: "center",
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    ...typography.caption,
  },
  secondaryButton: {
    marginTop: spacing.xs,
  },
});
