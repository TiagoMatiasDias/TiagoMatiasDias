import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Group, GroupIcon } from "@bolao/shared-types";
import { colors, radius, spacing, typography } from "../constants/theme";
import { ApiError } from "../lib/api";
import { useGroups } from "../context/GroupsContext";
import { PrimaryButton } from "./PrimaryButton";

const ICON_OPTIONS: { icon: GroupIcon; label: string; glyph: keyof typeof Ionicons.glyphMap }[] = [
  { icon: "trophy", label: "Troféu", glyph: "trophy" },
  { icon: "ball", label: "Bola", glyph: "football" },
  { icon: "medal", label: "Medalha", glyph: "medal" },
  { icon: "flag", label: "Bandeira", glyph: "flag" },
];

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ visible, onClose }: CreateGroupModalProps) {
  const { createGroup } = useGroups();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<GroupIcon>("trophy");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);

  const reset = () => {
    setName("");
    setIcon("trophy");
    setError(null);
    setCreatedGroup(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Dá um nome pro grupo");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const group = await createGroup(name.trim(), icon);
      setCreatedGroup(group);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar o grupo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    if (!createdGroup) return;
    Share.share({
      message: `Entra no meu bolão "${createdGroup.name}"! Baixa o app e usa o código: ${createdGroup.inviteCode}`,
    }).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.card}>
          {createdGroup ? (
            <>
              <Text style={styles.title}>Grupo criado! 🎉</Text>
              <Text style={styles.subtitle}>
                Compartilhe o código abaixo com seus amigos para eles entrarem no
                grupo "{createdGroup.name}".
              </Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{createdGroup.inviteCode}</Text>
              </View>
              <PrimaryButton label="Compartilhar código" onPress={handleShare} />
              <PrimaryButton label="Concluir" onPress={handleClose} variant="outline" style={styles.secondaryButton} />
            </>
          ) : (
            <>
              <Text style={styles.title}>Criar novo grupo</Text>
              <Text style={styles.subtitle}>Depois é só convidar seus amigos com um código.</Text>

              <Text style={styles.label}>Nome do grupo</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Bolão da Firma"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Ícone do grupo</Text>
              <View style={styles.iconRow}>
                {ICON_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.icon}
                    onPress={() => setIcon(opt.icon)}
                    style={[styles.iconChip, icon === opt.icon && styles.iconChipSelected]}
                  >
                    <Ionicons
                      name={opt.glyph}
                      size={22}
                      color={icon === opt.icon ? colors.background : colors.textSecondary}
                    />
                    <Text style={[styles.iconLabel, icon === opt.icon && styles.iconLabelSelected]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <PrimaryButton label="Criar grupo" onPress={handleCreate} loading={submitting} />
              <PrimaryButton label="Cancelar" onPress={handleClose} variant="outline" style={styles.secondaryButton} />
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
    fontSize: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13.5,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
  },
  iconRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconChip: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  iconLabelSelected: {
    color: colors.background,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    ...typography.caption,
  },
  codeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  codeText: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 4,
    color: colors.primary,
  },
  secondaryButton: {
    marginTop: spacing.xs,
  },
});
