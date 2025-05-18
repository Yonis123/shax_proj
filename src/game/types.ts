

export type Player = 'W' | 'B'
export type Cell = Player | null

export interface GameState {
    board: Cell[]
    toMove: Player 
    phase: 'placing' | 'removal' | 'moving'  | 'finished'
    captured: {W: number; B: number}
    winner?: Player 
}