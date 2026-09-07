import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../constants/theme";
import { TEAM_CRESTS } from "../constants/teamCrests";

const PALETTE = ["#17C964", "#4C9EF5", "#F5B14C", "#F45C6C", "#9D6CF5", "#28C7C7"];

// Silhueta genérica de escudo (não reproduz o brasão real de nenhum clube) —
// usada só enquanto o escudo de verdade do time não foi enviado (ver
// constants/teamCrests.ts).
const SHIELD_PATH =
  "M12 1.5 L21 5 V11.5 C21 17.2 17.3 21.9 12 23 C6.7 21.9 3 17.2 3 11.5 V5 Z";

// Tamanho do placeholder 1x1 gerado em todo `assets/images/teams/*.png` que
// ainda não foi substituído por um escudo de verdade.
const PLACEHOLDER_SIZE = 1;

function colorForTeam(shortName: string) {
  const hash = shortName
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

export function TeamBadge({ shortName, size = 36 }: { shortName: string; size?: number }) {
  const color = colorForTeam(shortName);
  const crest = TEAM_CRESTS[shortName.toLowerCase()];
  // `Image.resolveAssetSource` devolve as dimensões reais do PNG (o Metro
  // já embute isso no bundle) — é como sabemos, sem precisar de nenhuma
  // configuração extra, se o arquivo ainda é o placeholder ou já foi
  // substituído por um escudo de verdade.
  const resolvedCrest = crest ? Image.resolveAssetSource(crest) : null;
  const hasRealCrest =
    !!resolvedCrest &&
    resolvedCrest.width > PLACEHOLDER_SIZE &&
    resolvedCrest.height > PLACEHOLDER_SIZE;

  if (hasRealCrest) {
    return (
      <View style={[styles.wrapper, { width: size, height: size }]}>
        <Image
          source={crest}
          resizeMode="contain"
          style={{ width: size, height: size }}
        />
      </View>
    );
  }

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
    position: "relative",
    overflow: "hidden",
  },
  text: {
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 2,
  },
});
