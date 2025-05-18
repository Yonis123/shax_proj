import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createNewGame, isLegalMove, applyMove } from './game/rules';
import type { GameState } from './game/types';
import { v4 as uuid } from 'uuid';
import { saveGame, loadGame } from './game/gameRepo';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.send('We good baby');
});

app.post('/games', (_req, res) => {

    const id = uuid();
    const gameState = createNewGame()
    saveGame(id, gameState);
    res.status(201).json({id, gameState})
})

app.post('/games/:id/move', (req, res)  => {

  const { from, to, remove, player } = req.body as {from: number, to: number, remove: number, player: 'W'  | 'B'}
  let game = loadGame(req.params.id);
  if (!game){
    res.sendStatus(404).json({error: 'Game not found', code: 'GAME_NOT_FOUND'});
    return 
  } 

  if (!isLegalMove(game, from, to, remove)){
    res.sendStatus(404).json({error: 'Move not valid', code: 'INVALID_MOVE' })
  }



  
  // if(!game) return res.sendStatus(404);

  // if(!isLegalMove(game, from, to, remove)){
    
  // }

})











const port = Number(process.env.PORT) || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));