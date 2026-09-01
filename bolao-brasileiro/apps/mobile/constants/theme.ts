/** Tema visual do app: fundo escuro com acentos verde/dourado (Brasileirão). */
export const colors = {
  background: "#0B1120",
  backgroundElevated: "#111A2E",
  surface: "#161F38",
  surfaceAlt: "#1D2846",
  border: "#263257",
  textPrimary: "#F4F6FB",
  textSecondary: "#94A1C7",
  textMuted: "#5C6689",
  primary: "#17C964",
  primaryDark: "#0EA354",
  gold: "#F5B14C",
  danger: "#F45C6C",
  info: "#4C9EF5",
  overlay: "rgba(5, 9, 20, 0.7)",
};

export const gradients = {
  hero: ["#0F1E3D", "#0B1120"] as const,
  primaryButton: ["#1DD873", "#0EA354"] as const,
  liveBadge: ["#F45C6C", "#D8324B"] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: { fontSize: 24, fontWeight: "800" as const },
  heading: { fontSize: 18, fontWeight: "700" as const },
  body: { fontSize: 15, fontWeight: "500" as const },
  caption: { fontSize: 12, fontWeight: "600" as const },
};
