import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { LeaderboardRow } from "../../components/LeaderboardRow";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useLiveData } from "../../context/LiveDataContext";

export default function RankingScreen() {
  const { leaderboard, loading, refresh } = useLiveData();
  const { user } = useAuth();

  return (
    <ScreenContainer>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Ranking</Text>
            <Text style={styles.subtitle}>Atualizado automaticamente a cada gol</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.subtitle}>Ninguém pontuou ainda. Dê seus palpites!</Text>
        }
        renderItem={({ item }) => <LeaderboardRow entry={item} isMe={item.userId === user?.id} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
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
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
