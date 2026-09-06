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
  pal: require("../assets/images/teams/pal.png"),
  fla: require("../assets/images/teams/fla.png"),
  bot: require("../assets/images/teams/bot.png"),
  for: require("../assets/images/teams/for.png"),
  int: require("../assets/images/teams/int.png"),
  cam: require("../assets/images/teams/cam.png"),
  sao: require("../assets/images/teams/sao.png"),
  cor: require("../assets/images/teams/cor.png"),
  cru: require("../assets/images/teams/cru.png"),
  gre: require("../assets/images/teams/gre.png"),
  bah: require("../assets/images/teams/bah.png"),
  vas: require("../assets/images/teams/vas.png"),
  cap: require("../assets/images/teams/cap.png"),
  flu: require("../assets/images/teams/flu.png"),
  bra: require("../assets/images/teams/bra.png"),
  cri: require("../assets/images/teams/cri.png"),
  cui: require("../assets/images/teams/cui.png"),
  vit: require("../assets/images/teams/vit.png"),
  juv: require("../assets/images/teams/juv.png"),
  acg: require("../assets/images/teams/acg.png"),
};
