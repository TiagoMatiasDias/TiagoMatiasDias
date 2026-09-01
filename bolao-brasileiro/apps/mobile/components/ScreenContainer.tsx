import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, gradients } from "../constants/theme";

export function ScreenContainer({ style, children, ...rest }: ViewProps) {
  return (
    <LinearGradient colors={gradients.hero} style={styles.gradient}>
      <SafeAreaView style={[styles.container, style]} {...rest}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
});
