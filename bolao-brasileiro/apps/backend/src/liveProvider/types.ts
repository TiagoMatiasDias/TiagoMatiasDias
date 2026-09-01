import type { Match } from "@bolao/shared-types";

export interface MatchTickEvent {
  match: Match;
  goalScoredBy: "home" | "away" | null;
  justFinished: boolean;
}

/**
 * Fonte de dados de partidas ao vivo. `MockLiveProvider` simula jogos para
 * desenvolvimento/demo; para produção, implementar esta mesma interface
 * usando um provedor real (ex: API-Football, Sportradar) fazendo polling ou
 * consumindo o webhook deles e chamando `onTick` a cada evento relevante
 * (gol, fim de jogo). Nenhum outro código do backend precisa mudar.
 */
export interface LiveMatchProvider {
  start(onTick: (event: MatchTickEvent) => void): void;
  stop(): void;
}
