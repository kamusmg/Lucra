import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
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
app.get('/api/analysis/present-day', analysisController.getPresentDayAnalysis);
app.get('/api/analysis/backtest', analysisController.getBacktestAnalysis);
app.post('/api/analysis/reroll-signal', analysisController.rerollSignal);
app.post('/api/analysis/refresh-horizon', analysisController.refreshHorizon);
app.post('/api/analysis/tactical', analysisController.getTacticalAnalysis);
app.post('/api/analysis/chart', analysisController.postChartAnalysis);
app.post('/api/chat', analysisController.postChatMessage);
app.post('/api/analysis/supervisor-directive', analysisController.getSupervisorDirective);
app.get('/api/analysis/robustness-audit', analysisController.getRobustnessAudit);
app.post('/api/market/prices', analysisController.getMarketPrices);
app.post('/api/analysis/run', analysisController.runFullAnalysis);
app.get('/api/analysis/meme-coins', analysisController.getMemeCoinAnalysis);
app.post('/api/analysis/sentiment', analysisController.getSentimentAnalysis);


// Basic Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ message: 'An internal server error occurred', error: errorMessage }));
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
