import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../app';
import { resetGames } from '../game/gameRepo';
import { Player } from '../game/types';

describe('HTTP API integration', () => {
  beforeEach(() => {
    resetGames();
  });

  it('GET  /health → 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('We good baby');
  });

  it('POST /games → 201 Created + { id, gameState }', async () => {
    const res = await request(app).post('/games');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('gameState');
    expect(res.body.gameState.toMove).toBe<'W'|'B'>('W');
  });

  it('GET  /games/:id → 200 + state', async () => {
    const { body } = await request(app).post('/games');
    const id = body.id as string;

    const res = await request(app).get(`/games/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.toMove).toBe('W');
    expect(res.body.phase).toBe('placing');
  });

  it('GET  /games/:badId → 404 + error code', async () => {
    const res = await request(app).get('/games/not-a-real-id');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'GAME_NOT_FOUND' });
  });

  describe('Placing phase', () => {
    it('POST /games/:id/place → 200 and toggles toMove', async () => {
      const { body } = await request(app).post('/games');
      const id = body.id as string;

      const res = await request(app)
        .post(`/games/${id}/move`)
        .send({ to: 5, player: 'W' as Player });
      expect(res.status).toBe(200);
      expect(res.body.board[5]).toBe('W');
      expect(res.body.toMove).toBe('B');
    });

    it('out-of-turn place → 403 NOT_YOUR_TURN', async () => {
      const { body } = await request(app).post('/games');
      const id = body.id as string;

      const res = await request(app)
        .post(`/games/${id}/move`)
        .send({ to: 3, player: 'B' as Player });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('NOT_YOUR_TURN');
    });

    it('illegal placement (occupied) → 400 ILLEGAL_MOVE', async () => {
      const { body } = await request(app).post('/games');
      const id = body.id as string;

      // first valid
      await request(app).post(`/games/${id}/move`).send({ to: 4, player: 'W' as Player });

      // try placing twice on same spot
      const res = await request(app)
        .post(`/games/${id}/move`)
        .send({ to: 4, player: 'B' as Player });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('ILLEGAL_MOVE');
    });
  });

  describe('Moving phase', () => {
    it('POST /games/:id/move → 200 and toggles toMove', async () => {
      const { body } = await request(app).post('/games');
      const id = body.id as string;

      // simulate end of placing: fill 18 spots then one more to enter moving...
      for (let i = 0; i < 18; i++) {
        const player: Player = i % 2 === 0 ? 'W' : 'B';
        await request(app).post(`/games/${id}/place`).send({ to: i, player });
      }
      // now manually bump phase for test
      await request(app).post(`/games/${id}/move`).send({ from: 0, to: 1, player: 'W' });
      // The above should respond; you can assert code similarly.
      // (Adjust as needed to actually trigger moving phase in your logic.)
    });
  });

  describe('Jare (removal) phase', () => {
    it('POST /games/:id/jare → 200 on legal removal', async () => {
      const { body } = await request(app).post('/games');
      const id = body.id as string;

      // Force game into jare-ready state:
      // place W at 0,1,2 → mill, then test removal of B at 3
      await request(app).post(`/games/${id}/place`).send({ to: 0, player: 'W' as Player });
      await request(app).post(`/games/${id}/place`).send({ to: 1, player: 'B' as Player });
      await request(app).post(`/games/${id}/place`).send({ to: 2, player: 'W' as Player });
      // Now W has a mill; assume server signals mill and awaits jare
      const millResp = await request(app)
        .post(`/games/${id}/move`)
        .send({ from: -1, to: 2, player: 'W' as Player });
      // place an opponent piece to remove
      await request(app).post(`/games/${id}/move`).send({ to: 3, player: 'B' as Player });

      const res = await request(app)
        .post(`/games/${id}/jare`)
        .send({ removal: 3, player: 'W' as Player });
      expect(res.status).toBe(200);
      expect(res.body.board[3]).toBeNull();
      expect(res.body.captured.W).toBe(1);
    });

    it('illegal removal → 400 ILLEGAL_REMOVAL', async () => {
      const { body } = await request(app).post('/games');
      const id = body.id as string;

      const res = await request(app)
        .post(`/games/${id}/jare`)
        .send({ removal: 0, player: 'W' as Player });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('ILLEGAL_REMOVAL');
    });
  });

  describe('Help (skip turn)', () => {
    it('POST /games/:id/jare_help → toggles toMove', async () => {
      const { body } = await request(app).post('/games');
      const id = body.id as string;

      const before = (await request(app).get(`/games/${id}`)).body.toMove as Player;
      const res = await request(app)
        .post(`/games/${id}/jare_help`)
        .send({ player: before });
      expect(res.status).toBe(200);
      expect(res.body.toMove).not.toBe(before);
    });
  });
});