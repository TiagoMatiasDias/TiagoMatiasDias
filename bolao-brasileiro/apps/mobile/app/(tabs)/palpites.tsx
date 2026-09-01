import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { Bet } from "@bolao/shared-types";
import { BetEditorCard } from "../../components/BetEditorCard";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useLiveData } from "../../context/LiveDataContext";
import { api } from "../../lib/api";

export default function BetsScreen() {
  const { token } = useAuth();
  const { matches, teamById, refresh } = useLiveData();
  const [myBets, setMyBets] = useState<Bet[]>([]);

  const scheduledMatches = matches.filter((m) => m.status === "SCHEDULED");

  useEffect(() => {
    if (!token) return;
    api.getMyBets(token).then((res) => setMyBets(res.bets));
  }, [token]);

  if (!token) {
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.emptyTitle}>Faça login para dar seus palpites</Text>
        <Text style={styles.emptySubtitle}>
          Vá até a aba Perfil para entrar na sua conta.
        </Text>
      </ScreenContainer>
    );
  }

  const handleSave = async (matchId: string, homeGoals: number, awayGoals: number) => {
    const { bet } = await api.upsertBet(token, matchId, homeGoals, awayGoals);
    setMyBets((prev) => {
      const exists = prev.some((b) => b.matchId === matchId);
      return exists ? prev.map((b) => (b.matchId === matchId ? bet : b)) : [...prev, bet];
    });
  };

  return (
    <ScreenContainer>
      <FlatList
        data={scheduledMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={false}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Meus Palpites</Text>
            <Text style={styles.subtitle}>
              Vale até o início de cada partida. Placar exato = 10 pts.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptySubtitle}>Nenhuma partida agendada no momento.</Text>
        }
        renderItem={({ item }) => (
          <BetEditorCard
            match={item}
            homeTeam={teamById.get(item.homeTeamId)}
            awayTeam={teamById.get(item.awayTeamId)}
            existingBet={myBets.find((b) => b.matchId === item.id)}
            onSave={(home, away) => handleSave(item.id, home, away)}
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
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
