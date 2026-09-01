import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../constants/theme";

const PALETTE = ["#17C964", "#4C9EF5", "#F5B14C", "#F45C6C", "#9D6CF5", "#28C7C7"];

function colorForTeam(shortName: string) {
  const index = shortName.charCodeAt(0) % PALETTE.length;
  return PALETTE[index];
}

export function TeamBadge({ shortName, size = 36 }: { shortName: string; size?: number }) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          backgroundColor: `${colorForTeam(shortName)}33`,
          borderColor: colorForTeam(shortName),
        },
      ]}
    >
      <Text style={[styles.text, { color: colorForTeam(shortName), fontSize: size * 0.34 }]}>
        {shortName.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  text: {
    fontWeight: "800",
    color: colors.textPrimary,
  },
});
