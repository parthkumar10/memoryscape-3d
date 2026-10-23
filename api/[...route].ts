import express from 'express';
import { apiRouter } from '../src/server/routes.ts';

const app = express();

app.use('/api/extract-pdf', express.raw({ type: 'application/pdf', limit: '4.2mb' }));
app.use(express.json({ limit: '15mb' }));
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
