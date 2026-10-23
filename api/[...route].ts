import express from 'express';
import { apiRouter } from '../src/server/routes.ts';

const app = express();

app.use(express.json({ limit: '4mb' }));
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
