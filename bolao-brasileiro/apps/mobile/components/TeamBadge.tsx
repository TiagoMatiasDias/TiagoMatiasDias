import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../constants/theme";

const PALETTE = ["#17C964", "#4C9EF5", "#F5B14C", "#F45C6C", "#9D6CF5", "#28C7C7"];

// Silhueta genérica de escudo (não reproduz o brasão real de nenhum clube —
// aqui é só um placeholder estilizado até termos ilustrações de verdade).
const SHIELD_PATH =
  "M12 1.5 L21 5 V11.5 C21 17.2 17.3 21.9 12 23 C6.7 21.9 3 17.2 3 11.5 V5 Z";

function colorForTeam(shortName: string) {
  const hash = shortName
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

export function TeamBadge({ shortName, size = 36 }: { shortName: string; size?: number }) {
  const color = colorForTeam(shortName);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" style={StyleSheet.absoluteFill}>
        <Path d={SHIELD_PATH} fill={`${color}33`} stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
      </Svg>
      <Text style={[styles.text, { color, fontSize: size * 0.28 }]}>
        {shortName.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 2,
  },
});
