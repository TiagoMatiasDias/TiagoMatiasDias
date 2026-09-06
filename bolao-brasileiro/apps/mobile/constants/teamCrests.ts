import type { ImageSourcePropType } from "react-native";

/**
 * Escudos dos times, em `assets/images/teams/<sigla>.png`.
 *
 * Para trocar o escudo de um time: substitua o arquivo PNG correspondente
 * (mesmo nome!) por uma imagem de verdade — não precisa mexer em nenhum
 * código, nem nesta lista. Hoje todos são placeholders 1x1 transparentes
 * (ver README, seção "Escudos dos times").
 *
 * O Metro (empacotador do Expo) exige que cada `require()` aponte pra um
 * arquivo que já existe — por isso os 20 já estão criados de antemão em vez
 * de serem adicionados sob demanda.
 */
export const TEAM_CRESTS: Record<string, ImageSourcePropType> = {
  fla: require("../assets/images/teams/fla.png"),
  pal: require("../assets/images/teams/pal.png"),
  cru: require("../assets/images/teams/cru.png"),
  mir: require("../assets/images/teams/mir.png"),
  flu: require("../assets/images/teams/flu.png"),
  bot: require("../assets/images/teams/bot.png"),
  bah: require("../assets/images/teams/bah.png"),
  sao: require("../assets/images/teams/sao.png"),
  gre: require("../assets/images/teams/gre.png"),
  bra: require("../assets/images/teams/bra.png"),
  cam: require("../assets/images/teams/cam.png"),
  san: require("../assets/images/teams/san.png"),
  cor: require("../assets/images/teams/cor.png"),
  vas: require("../assets/images/teams/vas.png"),
  vit: require("../assets/images/teams/vit.png"),
  int: require("../assets/images/teams/int.png"),
  cfc: require("../assets/images/teams/cfc.png"),
  cap: require("../assets/images/teams/cap.png"),
  cha: require("../assets/images/teams/cha.png"),
  rem: require("../assets/images/teams/rem.png"),
};
