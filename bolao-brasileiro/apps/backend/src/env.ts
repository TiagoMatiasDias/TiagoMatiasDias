export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-troque-em-producao",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
};
