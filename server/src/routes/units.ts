import { Router } from 'express';
import { ALL_UNITS } from '../seed.js';

export const unitsRouter = Router();

unitsRouter.get('/', (_req, res) => {
  res.json(ALL_UNITS);
});
