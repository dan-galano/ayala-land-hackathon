import { Router } from 'express';
import { ANOMALIES } from '../seed.js';

export const anomaliesRouter = Router();

anomaliesRouter.get('/', (_req, res) => {
  res.json(ANOMALIES);
});
