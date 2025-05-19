import { describe, it, expect } from 'vitest';

import {createNewGame, isJare, isLegalMove, isLegalRemoval, applyMove, help, checkWin, switchPlayer, use_for_jare} from '../game/rules'

import type { GameState, Player } from '../game/types';


describe('GameState & createNewGame()', () => {
  it('initializes with an empty board, white to move, placing phase, zero captures', () => {
    const g = createNewGame();
    expect(g.board).toHaveLength(24);
    expect(g.board.every(c => c === null)).toBe(true);
    expect(g.toMove).toBe<'W' | 'B'>('W');
    expect(g.phase).toBe('placing');
    expect(g.captured).toEqual({ W: 0, B: 0 });
    expect(g.winner).toBeUndefined();
  });
});


describe('isLegalMove() in placing phase', () => {
  it('allows placing on an empty spot', () => {
    const g = createNewGame();
    expect(isLegalMove(g, -1, 5, -1)).toBe(true);
  });
  it('disallows placing on an occupied spot', () => {
    const g = createNewGame();
    g.board[5] = 'W';
    expect(isLegalMove(g, -1, 5, -1)).toBe(false);
  });
  it('disallows placing out of bounds', () => {
    const g = createNewGame();
    expect(isLegalMove(g, -1, 24, -1)).toBe(false);
    expect(isLegalMove(g, -1, -1, -1)).toBe(false);
  });
});


describe('applyMove() toggles turns and updates board', () => {

    it('places a piece and toggles toMove', () => {
    let g = createNewGame();
    g = applyMove(g, -1, 7, -1);
    expect(g.board[7]).toBe<'W' | 'B'>('W');
    expect(g.toMove).toBe<'W' | 'B'>('B');

    })

});

 it('moves a piece and clears the from spot', () => {
    let g: GameState = { ...createNewGame(), phase: 'moving' };
    g.board[3] = 'W';
    g.toMove = 'W';
    g = applyMove(g, 3, 4, -1);
    expect(g.board[3]).toBeNull();
    expect(g.board[4]).toBe<'W' | 'B'>('W');
    expect(g.toMove).toBe<'W' | 'B'>('B');

  });

describe('hasMill()', () => {
  it('detects a mill on a straight line', () => {
    const g = createNewGame();
    g.board[0] = 'W';
    g.board[1] = 'W';
    g.board[2] = 'W';
    expect(isJare(g, 'W', 1)).toBe(true);

  });

});

it('does not detect mill if one spot is empty', () => {
    const g = createNewGame();
    g.board[0] = 'W';
    g.board[1] = 'W';
    expect(isJare(g, 'W', 1)).toBe(false);
  });


it('can detect any mill without specifying pos', () => {
    const g = createNewGame();
    g.board[3] = 'B';
    g.board[4] = 'B';
    g.board[5] = 'B';
    expect(isJare(g, 'B')).toBe(true);
  });


describe('help()', () => {
  it('returns true and switches turn from W to B', () => {
    const game: GameState = createNewGame();
    expect(game.toMove).toBe<Player>('W');

    const result = help(game);
    expect(result).toBe(true);
    expect(game.toMove).toBe<Player>('B');
  });

  it('returns true and switches turn from B to W', () => {
    const game: GameState = createNewGame();
    game.toMove = 'B';
    expect(game.toMove).toBe<Player>('B');

    const result = help(game);
    expect(result).toBe(true);
    expect(game.toMove).toBe<Player>('W');
  });
});


describe('use_for_jare()', () => {
  it('returns false and does nothing if removal is illegal (empty or own piece)', () => {
    const game: GameState = createNewGame();
    const initialCaptured = { ...game.captured };
    const initialToMove   = game.toMove;

    const result = use_for_jare(game, initialToMove, 0);
    expect(result).toBe(false);
    expect(game.board[0]).toBeNull();
    expect(game.captured).toEqual(initialCaptured);
    expect(game.toMove).toBe(initialToMove);
  });

  it('removes an opponent piece when legal, increments capture, and toggles turn', () => {
    const game: GameState = createNewGame();
    const player: Player = game.toMove;           
    const opponent: Player = player === 'W' ? 'B' : 'W';

  
  

    
    game.board[5] = opponent;
    const prevCaptured = game.captured[player];

    const result = use_for_jare(game, player, 5);

   
    expect(result).not.toBe(false);

   
    expect(game.board[5]).toBeNull();

    expect(game.captured[player]).toBe(prevCaptured + 1);

   
    expect(game.toMove).toBe(opponent);
  });
});