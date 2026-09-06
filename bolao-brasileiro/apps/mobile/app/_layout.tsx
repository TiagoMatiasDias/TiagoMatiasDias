import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { GroupsProvider } from "../context/GroupsContext";
import { LiveDataProvider } from "../context/LiveDataContext";
import { colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GroupsProvider>
          <LiveDataProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </LiveDataProvider>
        </GroupsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
