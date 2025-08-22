// backend/src/api/analysisController.ts
import { Request, Response, NextFunction } from 'express';
import * as geminiService from '../services/geminiService';
import * as marketService from '../services/marketService';
import { HorizonKey, HORIZON_LABELS } from '../services/horizonPolicy';
import { PresentDayAnalysisResult, BacktestAnalysisResult, LivePrices, Horizon } from '../types';

// To cache the full analysis result
let analysisCache: {
    presentDay: PresentDayAnalysisResult | null;
    backtest: BacktestAnalysisResult | null;
} = {
    presentDay: null,
    backtest: null,
};

const ensurePresentDayAnalysis = async (totalCapital?: number, riskPercentage?: number) => {
    if (!analysisCache.presentDay) {
        analysisCache.presentDay = await geminiService.runFullPipeline(totalCapital || 10000, riskPercentage || 1);
        geminiService.setLastPresentDayAnalysis(analysisCache.presentDay);
    }
    return analysisCache.presentDay;
};

const ensureBacktestAnalysis = async () => {
    if (!analysisCache.backtest) {
        analysisCache.backtest = await geminiService.fetchBacktestAnalysis();
    }
    return analysisCache.backtest;
};

export const getPresentDayAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ensurePresentDayAnalysis();
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
    } catch (error: any) {
        error.message = `Error fetching present-day analysis: ${error.message}`;
        next(error);
    }
};

export const getBacktestAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ensureBacktestAnalysis();
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
    } catch (error: any) {
        error.message = `Error fetching backtest analysis: ${error.message}`;
        next(error);
    }
};

export const runFullAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { totalCapital = 10000, riskPercentage = 1, feedbackDirective } = (req as any).body;
        
        // Call the service directly to ensure a fresh run with feedback
        const data = await geminiService.runFullPipeline(totalCapital, riskPercentage, feedbackDirective);
        
        // Update the cache with the new result and set it as the last analysis for other services
        analysisCache.presentDay = data;
        analysisCache.backtest = null; // Also clear backtest cache if a full run is initiated
        geminiService.setLastPresentDayAnalysis(data);

        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
    } catch (error: any) {
        error.message = `Error running full analysis: ${error.message}`;
        next(error);
    }
};

export const rerollSignal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { signalType, horizon, excludeAssets } = (req as any).body;
        const pricesWithSource = await marketService.fetchPrices(['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'LTC', 'MATIC', 'DOT']);
        const livePrices: LivePrices = {};
        for (const ticker in pricesWithSource) {
            livePrices[ticker] = pricesWithSource[ticker].price;
        }
        const newSignal = await geminiService.fetchNewSignal({ signalType, horizon, excludeAssets, livePrices });
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(newSignal));
    } catch (error: any) {
        error.message = `Error rerolling signal: ${error.message}`;
        next(error);
    }
};

export const refreshHorizon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { horizon, side, count, excludeAssets } = (req as any).body;
        const horizonLabel = HORIZON_LABELS[horizon as HorizonKey];
        const sideLabel = side === 'buy' ? 'COMPRA' : 'VENDA';

        const newSignals = await geminiService.fetchNewSignalsForHorizon(horizonLabel as Horizon, sideLabel, count, excludeAssets);
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(newSignals));
    } catch (error: any) {
        error.message = `Error refreshing horizon signals: ${error.message}`;
        next(error);
    }
};

export const getTacticalAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { assetTicker, language, horizon } = (req as any).body;
        const priceInfo = await marketService.fetchPriceForTicker(assetTicker);
        if (!priceInfo.price) {
            res.statusCode = 404;
            return res.setHeader('Content-Type', 'application/json').send(JSON.stringify({ message: `Could not find price for asset: ${assetTicker}` }));
        }
        const analysis = await geminiService.fetchTacticalAnalysis(assetTicker, priceInfo.price, priceInfo.source, language, horizon);
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(analysis));
    } catch (error: any) {
        error.message = `Error fetching tactical analysis: ${error.message}`;
        next(error);
    }
};

export const postChartAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { base64Image, mimeType, language } = (req as any).body;
        if (!base64Image || !mimeType || !language) {
            res.statusCode = 400;
            return res.setHeader('Content-Type', 'application/json').send(JSON.stringify({ message: 'Missing required parameters: base64Image, mimeType, language' }));
        }
        const analysis = await geminiService.analyzeChartImage(base64Image, mimeType, language);
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(analysis));
    } catch (error: any) {
        error.message = `Error fetching chart analysis: ${error.message}`;
        next(error);
    }
};

export const postChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, presentDayData, backtestData } = (req as any).body;
        const chat = await geminiService.createChatSession(presentDayData, backtestData);
        const response = await chat.sendMessage({ message });
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify({ text: response.text }));
    } catch (error: any) {
        error.message = `Error processing chat message: ${error.message}`;
        next(error);
    }
};

export const getSupervisorDirective = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { analysis, evolutionPrompt } = (req as any).body;
        const directive = await geminiService.fetchSupervisorDirective(analysis, evolutionPrompt);
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(directive));
    } catch (error: any) {
        error.message = `Error fetching supervisor directive: ${error.message}`;
        next(error);
    }
};

export const getRobustnessAudit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const report = await geminiService.fetchRobustnessAudit();
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(report));
    } catch (error: any) {
        error.message = `Error fetching robustness audit: ${error.message}`;
        next(error);
    }
};

export const getMarketPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tickers } = (req as any).body;
        if (!Array.isArray(tickers)) {
            res.statusCode = 400;
            return res.setHeader('Content-Type', 'application/json').send(JSON.stringify({ message: 'Tickers must be an array.' }));
        }
        const data = await marketService.fetchPrices(tickers);
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
    } catch (error: any) {
        error.message = `Error fetching market prices: ${error.message}`;
        next(error);
    }
};

export const getMemeCoinAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await geminiService.fetchMemeCoinAnalysis();
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
    } catch (error: any) {
        error.message = `Error fetching meme coin analysis: ${error.message}`;
        next(error);
    }
};

export const getSentimentAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { assets, language } = (req as any).body;
        const data = await geminiService.fetchSentimentAnalysis(assets, language);
        res.setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
    } catch (error: any) {
        error.message = `Error fetching sentiment analysis: ${error.message}`;
        next(error);
    }
};
