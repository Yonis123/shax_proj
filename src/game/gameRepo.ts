import type { GameState } from './types';

const games: Record<string, GameState> = {};

export function saveGame(id: string, state: GameState) {
  games[id] = state;
}

export function loadGame(id: string): GameState | undefined {
  return games[id];
}

export function deleteGame(id: string): void {
  delete games[id];
}