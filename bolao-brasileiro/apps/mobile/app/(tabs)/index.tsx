import { useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { MatchCard } from "../../components/MatchCard";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useLiveData } from "../../context/LiveDataContext";

const STATUS_ORDER = { LIVE: 0, SCHEDULED: 1, FINISHED: 2, POSTPONED: 3 };

export default function LiveMatchesScreen() {
  const { matches, teamById, loading, refresh } = useLiveData();
  const { user } = useAuth();

  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    [matches]
  );

  return (
    <ScreenContainer>
      <FlatList
        data={sortedMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.greeting}>{user ? `E aí, ${user.name}!` : "Bolão Brasileirão"}</Text>
            <Text style={styles.subtitle}>Placares atualizados em tempo real</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            homeTeam={teamById.get(item.homeTeamId)}
            awayTeam={teamById.get(item.awayTeamId)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
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
  },
  greeting: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
