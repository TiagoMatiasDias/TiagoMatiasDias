import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors, spacing, typography } from "../../constants/theme";

export default function MataMataScreen() {
  return (
    <ScreenContainer style={styles.centered}>
      <View style={styles.iconCircle}>
        <Ionicons name="trophy" size={30} color={colors.gold} />
      </View>
      <Text style={styles.title}>Mata-Mata</Text>
      <Text style={styles.subtitle}>
        A competição eliminatória (fase de grupos, repescagem e chaveamento até a
        final) está a caminho. Em breve por aqui!
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.gold}22`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
