import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="ranking"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Ranking",
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="mata-mata"
        options={{
          title: "Mata-Mata",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-branch" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="palpites"
        options={{
          title: "Palpites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="grupos"
        options={{
          title: "Grupos",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => <Ionicons name="menu" color={color} size={size} />,
        }}
      />

      {/* Ainda existem, mas saem da barra por enquanto: "Ao Vivo" (index) e
          "Perguntas" migram para dentro de Palpites na fase 2. */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="perguntas" options={{ href: null }} />
    </Tabs>
  );
}
