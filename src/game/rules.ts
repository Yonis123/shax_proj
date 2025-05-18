import { stat } from 'fs';
import type { GameState, Player } from './types.ts'
import {v4 as uuid} from 'uuid';
import {ADJACENT, MILL_PATTERNS} from './constants';



export function createNewGame(): GameState {
  return {
    board:    Array(24).fill(null),  
    toMove:   'W',                  
    phase:    'placing',            
    captured: { W: 0, B: 0 },        
    
  };
}

export function isLegalRemoval(state: GameState, removal: number, curr_player: 'W' | 'B'): boolean{

    let opposing_player: Player;
  if (curr_player === 'W') {
    opposing_player = 'B';
  } else {
    opposing_player = 'W';
  }


  if (state.board[removal] == opposing_player){
    return true;
  }
  return false;
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
    return isLegalRemoval(state, removal, state.toMove);
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

    if(isJare(state, state.toMove, to)){
      state.phase = 'jare';
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

  if (state.captured[state.toMove] < 3){
    return true;
  }

  return false;
}

export function use_for_jare(state: GameState, removal: number){
  //remove the removal one, then toggle the turn
   

}

export function isJare(state: GameState, player: Player, pos?: number): boolean {

  for (const pattern of MILL_PATTERNS){
    if (pos !== undefined && !pattern.includes(pos)){
      continue 
    }

    const isFullMill = pattern.every(spot => state.board[spot] == player);
    if(isFullMill){
      return true;
    }

  }

  return false


}