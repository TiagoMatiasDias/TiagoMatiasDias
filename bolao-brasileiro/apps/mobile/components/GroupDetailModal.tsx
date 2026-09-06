import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Share, StyleSheet, Text, View } from "react-native";
import type { Group, GroupIcon, GroupMember } from "@bolao/shared-types";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { PrimaryButton } from "./PrimaryButton";
import { TeamBadge } from "./TeamBadge";

const ICON_GLYPH: Record<GroupIcon, keyof typeof Ionicons.glyphMap> = {
  trophy: "trophy",
  ball: "football",
  medal: "medal",
  flag: "flag",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`;
}

interface GroupDetailModalProps {
  group: Group | null;
  onClose: () => void;
}

export function GroupDetailModal({ group, onClose }: GroupDetailModalProps) {
  const { token } = useAuth();
  const [members, setMembers] = useState<GroupMember[] | null>(null);

  useEffect(() => {
    if (!group || !token) return;
    setMembers(null);
    api.getGroup(token, group.id).then((res) => setMembers(res.members));
  }, [group?.id, token]);

  const handleShare = () => {
    if (!group) return;
    Share.share({
      message: `Entra no meu bolão "${group.name}"! Baixa o app e usa o código: ${group.inviteCode}`,
    }).catch(() => {});
  };

  return (
    <Modal visible={!!group} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          {group && (
            <>
              <View style={styles.header}>
                <View style={styles.iconBadge}>
                  <Ionicons name={ICON_GLYPH[group.icon]} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{group.name}</Text>
                  <Text style={styles.subtitle}>
                    {group.memberCount} {group.memberCount === 1 ? "integrante" : "integrantes"}
                  </Text>
                </View>
              </View>

              <View style={styles.codeRow}>
                <View>
                  <Text style={styles.label}>Código de convite</Text>
                  <Text style={styles.codeText}>{group.inviteCode}</Text>
                </View>
                <Pressable onPress={handleShare} style={styles.shareButton}>
                  <Ionicons name="share-social" size={18} color={colors.background} />
                </Pressable>
              </View>

              <Text style={styles.label}>Integrantes</Text>
              {members === null ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
              ) : (
                <FlatList
                  data={members}
                  keyExtractor={(m) => m.id}
                  style={{ maxHeight: 260 }}
                  renderItem={({ item }) => (
                    <View style={styles.memberRow}>
                      <TeamBadge shortName={initials(item.userName)} size={34} />
                      <Text style={styles.memberName}>{item.userName}</Text>
                      {item.role === "ADMIN" && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>ADM</Text>
                        </View>
                      )}
                    </View>
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                />
              )}

              <PrimaryButton label="Fechar" onPress={onClose} variant="outline" style={{ marginTop: spacing.md }} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.title,
    fontSize: 19,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  codeText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 3,
    color: colors.primary,
    marginTop: 2,
  },
  shareButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  memberName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: `${colors.gold}26`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  adminBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.gold,
  },
});
