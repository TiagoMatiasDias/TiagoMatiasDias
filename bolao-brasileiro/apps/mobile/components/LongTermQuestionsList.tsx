import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { LongTermAnswer, LongTermQuestion } from "@bolao/shared-types";
import { colors, spacing, typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { QuestionCard } from "./QuestionCard";

/**
 * Lista de perguntas de longo prazo. Hoje ainda são as 3 perguntas de
 * demonstração do backend, sem o redesenho com ilustrações — isso é a
 * fase 2b do redesign.
 */
export function LongTermQuestionsList() {
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
    <FlatList
      data={questions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        !token ? (
          <Text style={styles.loginNote}>Faça login na aba Menu para responder.</Text>
        ) : null
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
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loginNote: {
    ...typography.caption,
    color: colors.gold,
    marginBottom: spacing.md,
  },
});
