import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { TeamBadge } from "../../components/TeamBadge";
import { colors, radius, spacing, typography } from "../../constants/theme";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function MenuScreen() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState("tiagomatiasdias@hotmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <ScreenContainer style={styles.centered}>
        <TeamBadge shortName={user.name} size={72} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {/* Editar perfil, tema claro, notificações e regras chegam na fase 6. */}
        <PrimaryButton label="Sair" onPress={logout} variant="outline" style={styles.logoutButton} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.centered}>
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Use a conta demo ou a sua, quando o cadastro estiver pronto.</Text>

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Senha (demo: bolao123)"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <PrimaryButton label="Entrar" onPress={handleLogin} loading={loading} />
      </View>
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
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  form: {
    width: "100%",
    gap: spacing.md,
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
  error: {
    color: colors.danger,
    ...typography.caption,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
  },
  logoutButton: {
    marginTop: spacing.xl,
    width: "100%",
  },
});
