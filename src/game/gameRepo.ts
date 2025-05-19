import type { GameState } from './types';

let games: Record<string, GameState> = {};

export function resetGames() {
  games = {}
}

export function saveGame(id: string, state: GameState) {
  games[id] = state;
}

export function loadGame(id: string): GameState | undefined {
  return games[id];
}

export function deleteGame(id: string): void {
  delete games[id];
  
}