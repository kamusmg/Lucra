
import { PresentDayAssetSignal, Horizon, PresentDayAnalysisResult, BacktestAnalysisResult, ChartAnalysisResult, SelfAnalysis, AuditReport, MemeCoinSignal, SentimentAnalysis } from '../../types.ts';
import { LivePricesWithSource } from '../marketService.ts';
import { HorizonKey } from '../horizonPolicy.ts';

// Defines the contract for a transport layer (either real HTTP or mock).
interface ITransport {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body: any) => Promise<T>;
}

// ApiClient provides a clean, typed interface for all backend interactions.
// Components will use this client, unaware of whether it's talking to a real
// server or the local mock, thanks to the transport abstraction.
export class ApiClient {
  constructor(private transport: ITransport) {}

  fetchPresentDayAnalysis = (): Promise<PresentDayAnalysisResult> => {
    return this.transport.get<PresentDayAnalysisResult>('/api/analysis/present-day');
  };

  fetchBacktestAnalysis = (): Promise<BacktestAnalysisResult> => {
    return this.transport.get<BacktestAnalysisResult>('/api/analysis/backtest');
  };
  
  runFullAnalysis = (totalCapital: number, riskPercentage: number): Promise<PresentDayAnalysisResult> => {
    return this.transport.post<PresentDayAnalysisResult>('/api/analysis/run', { totalCapital, riskPercentage });
  };

  fetchNewSignal = (
    signalType: 'COMPRA' | 'VENDA' | 'NEUTRO',
    horizon: Horizon,
    excludeAssets: string[]
  ): Promise<PresentDayAssetSignal> => {
    return this.transport.post<PresentDayAssetSignal>('/api/analysis/reroll-signal', {
      signalType,
      horizon,
      excludeAssets,
    });
  };

  fetchNewSignalsForHorizon = (horizon: HorizonKey, side: 'buy' | 'sell', count: number, excludeAssets: string[]): Promise<PresentDayAssetSignal[]> => {
    return this.transport.post<PresentDayAssetSignal[]>('/api/analysis/refresh-horizon', { horizon, side, count, excludeAssets });
  };

  fetchTacticalAnalysis = (assetTicker: string, language: 'pt' | 'en', horizon: Horizon): Promise<PresentDayAssetSignal> => {
    return this.transport.post<PresentDayAssetSignal>('/api/analysis/tactical', { assetTicker, language, horizon });
  };

  sendMessage = (payload: {
    message: string;
    presentDayData: PresentDayAnalysisResult;
    backtestData: BacktestAnalysisResult | null;
  }): Promise<{ text: string }> => {
    return this.transport.post<{ text: string }>('/api/chat', payload);
  };
  
  fetchSupervisorDirective = (analysis: SelfAnalysis, evolutionPrompt: string): Promise<{ directive: string }> => {
      return this.transport.post<{ directive: string }>('/api/analysis/supervisor-directive', { analysis, evolutionPrompt });
  };

  fetchRobustnessAudit = (): Promise<AuditReport> => {
    return this.transport.get<AuditReport>('/api/analysis/robustness-audit');
  };
  
  exportVereditoJSONByHorizon = (horizon: HorizonKey): Promise<{ filename: string; payload: any[] }> => {
      return this.transport.get<{ filename: string; payload: any[] }>(`/api/export/veredito/${horizon}`);
  };

  fetchMemeCoinAnalysis = (): Promise<MemeCoinSignal[]> => {
    return this.transport.get<MemeCoinSignal[]>('/api/analysis/meme-coins');
  };

  fetchPrices = (tickers: string[]): Promise<LivePricesWithSource> => {
    return this.transport.post<LivePricesWithSource>('/api/market/prices', { tickers });
  };

  fetchHistoricalPrice = (assetName: string, timestamp: number): Promise<{ price: string | null }> => {
    return this.transport.post<{ price: string | null }>('/api/market/historical-price', { assetName, timestamp });
  };

  analyzeChartImage = (base64Image: string, mimeType: string, language: 'pt' | 'en'): Promise<ChartAnalysisResult> => {
    return this.transport.post<ChartAnalysisResult>('/api/analysis/chart', { base64Image, mimeType, language });
  };

  fetchSentimentAnalysis = (assets: string[], language: 'pt' | 'en'): Promise<SentimentAnalysis[]> => {
      return this.transport.post<SentimentAnalysis[]>('/api/analysis/sentiment', { assets, language });
  }
}