import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { Bet, Match } from "@bolao/shared-types";
import { BetEditorModal } from "../../components/BetEditorModal";
import { LongTermQuestionsList } from "../../components/LongTermQuestionsList";
import { RoundGameCard } from "../../components/RoundGameCard";
import { RoundSelector } from "../../components/RoundSelector";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors, radius, spacing, typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useLiveData } from "../../context/LiveDataContext";
import { api } from "../../lib/api";

type Segment = "jogos" | "perguntas";

function currentRoundOf(matches: Match[]): number {
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  if (rounds.length === 0) return 1;
  const withOpenGame = rounds.find((round) =>
    matches.some((m) => m.round === round && m.status !== "FINISHED")
  );
  return withOpenGame ?? rounds[rounds.length - 1];
}

export default function PalpitesScreen() {
  const { token } = useAuth();
  const { matches, teamById } = useLiveData();
  const [segment, setSegment] = useState<Segment>("jogos");
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [betModalMatch, setBetModalMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!token) {
      setMyBets([]);
      return;
    }
    api.getMyBets(token).then((res) => setMyBets(res.bets));
  }, [token]);

  useEffect(() => {
    if (selectedRound === null && matches.length > 0) {
      setSelectedRound(currentRoundOf(matches));
    }
  }, [matches, selectedRound]);

  const rounds = useMemo(
    () => [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b),
    [matches]
  );

  const betsByMatchId = useMemo(() => new Map(myBets.map((b) => [b.matchId, b])), [myBets]);

  const completeRounds = useMemo(() => {
    const complete = new Set<number>();
    for (const round of rounds) {
      const roundMatches = matches.filter((m) => m.round === round);
      if (roundMatches.length > 0 && roundMatches.every((m) => betsByMatchId.has(m.id))) {
        complete.add(round);
      }
    }
    return complete;
  }, [rounds, matches, betsByMatchId]);

  const roundMatches = useMemo(
    () =>
      matches
        .filter((m) => m.round === selectedRound)
        .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt)),
    [matches, selectedRound]
  );

  const handleSaveBet = async (matchId: string, homeGoals: number, awayGoals: number) => {
    if (!token) return;
    const { bet } = await api.upsertBet(token, matchId, homeGoals, awayGoals);
    setMyBets((prev) => {
      const exists = prev.some((b) => b.matchId === matchId);
      return exists ? prev.map((b) => (b.matchId === matchId ? bet : b)) : [...prev, bet];
    });
  };

  return (
    <ScreenContainer>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Palpites</Text>
        <View style={styles.segmentedControl}>
          <Pressable
            onPress={() => setSegment("jogos")}
            style={[styles.segment, segment === "jogos" && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, segment === "jogos" && styles.segmentTextSelected]}>
              Jogos
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSegment("perguntas")}
            style={[styles.segment, segment === "perguntas" && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, segment === "perguntas" && styles.segmentTextSelected]}>
              Perguntas
            </Text>
          </Pressable>
        </View>
      </View>

      {segment === "perguntas" ? (
        <LongTermQuestionsList />
      ) : (
        <>
          <View style={styles.selectorWrap}>
            <RoundSelector
              rounds={rounds}
              selectedRound={selectedRound ?? 1}
              completeRounds={completeRounds}
              onSelect={setSelectedRound}
            />
          </View>

          {!token && (
            <Text style={styles.loginNote}>
              Faça login na aba Menu para dar seus palpites.
            </Text>
          )}

          <FlatList
            data={roundMatches}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <RoundGameCard
                match={item}
                homeTeam={teamById.get(item.homeTeamId)}
                awayTeam={teamById.get(item.awayTeamId)}
                myBet={betsByMatchId.get(item.id)}
                onPress={token ? () => setBetModalMatch(item) : undefined}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          />

          <BetEditorModal
            match={betModalMatch}
            homeTeam={betModalMatch ? teamById.get(betModalMatch.homeTeamId) : undefined}
            awayTeam={betModalMatch ? teamById.get(betModalMatch.awayTeamId) : undefined}
            existingBet={betModalMatch ? betsByMatchId.get(betModalMatch.id) : undefined}
            onClose={() => setBetModalMatch(null)}
            onSave={(home, away) => handleSaveBet(betModalMatch!.id, home, away)}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  segmentSelected: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    ...typography.body,
    fontWeight: "700",
    fontSize: 13,
    color: colors.textSecondary,
  },
  segmentTextSelected: {
    color: colors.background,
  },
  selectorWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  loginNote: {
    ...typography.caption,
    color: colors.gold,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
