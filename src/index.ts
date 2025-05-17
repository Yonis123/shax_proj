import 'dotenv/config';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.send('We good baby');
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));