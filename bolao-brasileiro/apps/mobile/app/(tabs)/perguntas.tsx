import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { LongTermAnswer, LongTermQuestion } from "@bolao/shared-types";
import { QuestionCard } from "../../components/QuestionCard";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function LongTermQuestionsScreen() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<LongTermQuestion[]>([]);
  const [answers, setAnswers] = useState<LongTermAnswer[]>([]);

  useEffect(() => {
    api.getLongTermQuestions().then((res) => setQuestions(res.questions));
  }, []);

  useEffect(() => {
    if (!token) return;
    api.getMyLongTermAnswers(token).then((res) => setAnswers(res.answers));
  }, [token]);

  const handleSelect = async (questionId: string, optionId: string) => {
    if (!token) return;
    const { answer } = await api.answerLongTermQuestion(token, questionId, optionId);
    setAnswers((prev) => {
      const exists = prev.some((a) => a.questionId === questionId);
      return exists ? prev.map((a) => (a.questionId === questionId ? answer : a)) : [...prev, answer];
    });
  };

  return (
    <ScreenContainer>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Perguntas de Longo Prazo</Text>
            <Text style={styles.subtitle}>
              Valem pontos extra ao final do campeonato
            </Text>
            {!token && (
              <Text style={styles.loginNote}>Faça login na aba Perfil para responder.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            selectedOptionId={answers.find((a) => a.questionId === item.id)?.optionId}
            onSelect={(optionId) => handleSelect(item.id, optionId)}
            disabled={!token}
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
  loginNote: {
    ...typography.caption,
    color: colors.gold,
    marginTop: spacing.sm,
  },
});
