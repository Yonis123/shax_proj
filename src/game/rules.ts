import type { GameState } from './types.ts'
import {v4 as uuid} from 'uuid';



export function createNewGame(): GameState {
  return {
    board:    Array(24).fill(null),  
    toMove:   'W',                  
    phase:    'placing',            
    captured: { W: 0, B: 0 },        
    
  };
}


export function isLegalMove( state: GameState, from: number, to: number): boolean{

  // if to is not empty return false


  // if from is not emp
  



  return true;
}