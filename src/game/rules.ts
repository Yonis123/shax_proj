import { stat } from 'fs';
import type { GameState, Player } from './types.ts'
import {v4 as uuid} from 'uuid';

const ADJACENT: Record<number, number[]> = {
  0:  [1, 9],
  1:  [0, 2, 4],
  2:  [1, 14],
  3:  [4, 10],
  4:  [1, 3, 5, 7],
  5:  [4, 13],
  6:  [7, 11],
  7:  [4, 6, 8],
  8:  [7, 12],
  9:  [0, 10, 21],
  10: [3, 9, 11, 18],
  11: [6, 10, 15],
  12: [8, 13, 17],
  13: [5, 12, 14, 20],
  14: [2, 13, 23],
  15: [11, 16],
  16: [15, 17, 19],
  17: [12, 16],
  18: [10, 19],
  19: [16, 18, 20, 22],
  20: [13, 19],
  21: [9, 22],
  22: [19, 21, 23],
  23: [14, 22],
};

export function createNewGame(): GameState {
  return {
    board:    Array(24).fill(null),  
    toMove:   'W',                  
    phase:    'placing',            
    captured: { W: 0, B: 0 },        
    
  };
}

export function isLegalRemoval(state: GameState, removal: number): boolean{

  return true;
}

export function isLegalMove( state: GameState, from: number, to: number, removal: number): boolean{

  //handles if we are in placing phase

  if(state.phase === 'placing'){
    if(state.board[to] == null){
      return true;
    } else {
      return false;
    }
  }

  // if we are in removal phase, then we will check if the players whose turn it is actually clicked on the other players piece 

  if (state.phase === 'removal'){
    return isLegalRemoval(state, removal);
  }

  // handles if we are in moving phase
  
  if (state.phase == 'moving'){
    
    if (state.board[from] != state.toMove || state.board[to] != null){
      return false;
    }


    // i need to check if the place they are moving is up down left or right 

    if (ADJACENT[from].includes(to) && state.board[to] == null){
        return true

    }
  }

  return false;
}

export function applyMove(state: GameState, from: number, to: number, removal: number){

    

    if(state.phase == 'placing'){

      state.board[to] = state.toMove;
     
    }else if (state.phase == 'removal'){

      state.board[removal] = null;
      let curr_turn: Player = state.toMove
      state.captured[curr_turn] += 1;


    } else{
      
      state.board[from] = null;
      state.board[to] == state.toMove;
      

    }

    if (checkWin(state)){
      state.phase = 'finished';
      state.winner = state.toMove;
      return state
    }

    state.toMove = switchPlayer(state);
    return state


}


export function switchPlayer(state: GameState){
  if (state.toMove == 'W'){
    state.toMove = 'B';
  } else {
    state.toMove = 'W';
  }

  return state.toMove;
}


export function checkWin(state: GameState): boolean{

  return true;
}