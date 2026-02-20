import { Router } from 'express';
import { SUMMARY } from '../aggregator.js';

export const summaryRouter = Router();

summaryRouter.get('/', (_req, res) => {
  res.json(SUMMARY);
});
