import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { createNewGame, isLegalMove, applyMove, isJare, use_for_jare, help } from './game/rules';
import type { GameState } from './game/types';
import { saveGame, loadGame, deleteGame } from './game/gameRepo';
import express, { Request, Response } from 'express';
import 'dotenv/config';

const router = Router();



router.get('/health', (_req: Request, res: Response) => {
  res.send('We good baby');
});

router.post('/games', (_req, res) => {

    const id = uuid();
    const gameState = createNewGame()
    saveGame(id, gameState);
    res.status(201).json({id, gameState})
})

router.get('/games/:id', (req, res) => {
    let game = loadGame(req.params.id);
    if(!game){
        res.status(404).json({error: 'Game not found', code: "GAME_NOT_FOUND"})
    } else {
        res.status(200).json(game)
    }

});

router.post('/games/:id/move', (req, res)  => {

  const { from, to, remove, player } = req.body as {from: number, to: number, remove: number, player: 'W'  | 'B'}
  let game = loadGame(req.params.id);
  if (!game){
    res.sendStatus(404).json({error: 'Game not found', code: 'GAME_NOT_FOUND'});
    return 
  } 

  if (player !== game.toMove){
    res.status(403).json({error: 'It is not your turn', code: 'NOT_YOUR_TURN'})
  }

  if (!isLegalMove(game, from, to, remove)){
    res.status(400).json({error: 'Spot occupied', code: 'ILLEGAL_MOVE' })
  }

  const next = applyMove(game, from, to, remove);
  saveGame(req.params.id, next);
  res.json(next)
  return 

})

router.post('/games/:id/finished', (req, res) => {
  deleteGame(req.params.id);
  res.sendStatus(201);
  return 
})



router.post('/games/:id/jare', (req, res)  => {
   const {player, removal} = req.body as {player: 'W' | 'B', removal: number}
   let game = loadGame(req.params.id);
   if (!game){
    res.status(404).json({error: 'Game not found', code: 'GAME_NOT_FOUND'});
    return 
  } 

  if (player !== game.toMove){
    res.status(403).json({error: 'It is not your turn', code: 'NOT_YOUR_TURN'})
  }
   if (!use_for_jare(game, player, removal)){
      res.status(400).json({error: 'You did not select an appropriate piece', code: "ILLEGAL_REMOVAL"})
      
   } else {
      res.status(200).json(game)
   }
    

  
})

router.post('/games/:id/jare_help', (req, res)  => {
   const {player, removal} = req.body as {player: 'W' | 'B', removal: number}
   let game = loadGame(req.params.id);
   if (!game){
    res.sendStatus(404).json({error: 'Game not found', code: 'GAME_NOT_FOUND'});
    return 
  } 

  if (player !== game.toMove){
    res.status(403).json({error: 'It is not your turn', code: 'NOT_YOUR_TURN'})
  }

  help(game);

  res.status(200).json(game);

  return 


})



export default router;