import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import { unitsRouter } from './routes/units.js';
import { summaryRouter } from './routes/summary.js';
import { anomaliesRouter } from './routes/anomalies.js';

const PORT = process.env.PORT ?? 3001;
const NEXT_ORIGIN = process.env.NEXT_ORIGIN ?? 'http://localhost:3000';

const corsOptions: CorsOptions = {
  origin: NEXT_ORIGIN,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/units', unitsRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/anomalies', anomaliesRouter);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
