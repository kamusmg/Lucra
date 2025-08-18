

import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as analysisController from './api/analysisController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de CORS mais explícita para permitir
// que o nosso front-end se comunique com este servidor.
app.use(cors());

app.use(express.json({ limit: '10mb' })); // Increase limit for chart images

// --- Analysis Routes ---
app.get('/api/analysis/present-day', (req, res, next) => analysisController.getPresentDayAnalysis(req, res, next));
app.get('/api/analysis/backtest', (req, res, next) => analysisController.getBacktestAnalysis(req, res, next));
app.post('/api/analysis/reroll-signal', (req, res, next) => analysisController.rerollSignal(req, res, next));
app.post('/api/analysis/refresh-horizon', (req, res, next) => analysisController.refreshHorizon(req, res, next));
app.post('/api/analysis/tactical', (req, res, next) => analysisController.getTacticalAnalysis(req, res, next));
app.post('/api/analysis/chart', (req, res, next) => analysisController.postChartAnalysis(req, res, next));
app.post('/api/chat', (req, res, next) => analysisController.postChatMessage(req, res, next));
app.post('/api/analysis/supervisor-directive', (req, res, next) => analysisController.getSupervisorDirective(req, res, next));
app.get('/api/analysis/robustness-audit', (req, res, next) => analysisController.getRobustnessAudit(req, res, next));
app.post('/api/market/prices', (req, res, next) => analysisController.getMarketPrices(req, res, next));
app.post('/api/analysis/run', (req, res, next) => analysisController.runFullAnalysis(req, res, next));
app.get('/api/analysis/meme-coins', (req, res, next) => analysisController.getMemeCoinAnalysis(req, res, next));
app.post('/api/analysis/sentiment', (req, res, next) => analysisController.getSentimentAnalysis(req, res, next));


// Basic Error Handling Middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
  res.status(500).json({ message: 'An internal server error occurred', error: errorMessage });
};
app.use((err, req, res, next) => errorHandler(err, req, res, next));


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});