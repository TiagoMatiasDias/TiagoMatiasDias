import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { Group, GroupIcon } from "@bolao/shared-types";
import { CreateGroupModal } from "../../components/CreateGroupModal";
import { GroupDetailModal } from "../../components/GroupDetailModal";
import { JoinGroupModal } from "../../components/JoinGroupModal";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors, radius, spacing, typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useGroups } from "../../context/GroupsContext";

const ICON_GLYPH: Record<GroupIcon, keyof typeof Ionicons.glyphMap> = {
  trophy: "trophy",
  ball: "football",
  medal: "medal",
  flag: "flag",
};

export default function GroupsScreen() {
  const { token } = useAuth();
  const { groups, loading, refresh } = useGroups();
  const [createVisible, setCreateVisible] = useState(false);
  const [joinVisible, setJoinVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  if (!token) {
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.emptyTitle}>Faça login para ver seus grupos</Text>
        <Text style={styles.emptySubtitle}>Vá até a aba Menu para entrar na sua conta.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Grupos</Text>
            <Text style={styles.subtitle}>Cada grupo tem seu próprio ranking e mata-mata.</Text>
            <View style={styles.actionsRow}>
              <PrimaryButton
                label="Criar novo grupo"
                onPress={() => setCreateVisible(true)}
                style={styles.actionButton}
              />
              <PrimaryButton
                label="Fui convidado"
                onPress={() => setJoinVisible(true)}
                variant="outline"
                style={styles.actionButton}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptySubtitle}>
              Você ainda não faz parte de nenhum grupo. Crie um e convide seus amigos, ou entre
              com um código de convite.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.groupCard} onPress={() => setSelectedGroup(item)}>
            <View style={styles.groupIcon}>
              <Ionicons name={ICON_GLYPH[item.icon]} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupMeta}>
                {item.memberCount} {item.memberCount === 1 ? "integrante" : "integrantes"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />

      <CreateGroupModal visible={createVisible} onClose={() => setCreateVisible(false)} />
      <JoinGroupModal visible={joinVisible} onClose={() => setJoinVisible(false)} />
      <GroupDetailModal group={selectedGroup} onClose={() => setSelectedGroup(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerBlock: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  groupName: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  groupMeta: {
    ...typography.body,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: "center",
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
