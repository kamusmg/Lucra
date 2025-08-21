// backend/src/api/analysisController.ts
import * as geminiService from '../services/geminiService';
import * as marketService from '../services/marketService';
import { HorizonKey, HORIZON_LABELS } from '../services/horizonPolicy';
import { PresentDayAnalysisResult, BacktestAnalysisResult, LivePrices, Horizon } from '../types';
import { RequestHandler } from 'express';

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

export const getPresentDayAnalysis: RequestHandler = async (req, res, next) => {
    try {
        const data = await ensurePresentDayAnalysis();
        res.json(data);
    } catch (error: any) {
        error.message = `Error fetching present-day analysis: ${error.message}`;
        next(error);
    }
};

export const getBacktestAnalysis: RequestHandler = async (req, res, next) => {
    try {
        const data = await ensureBacktestAnalysis();
        res.json(data);
    } catch (error: any) {
        error.message = `Error fetching backtest analysis: ${error.message}`;
        next(error);
    }
};

export const runFullAnalysis: RequestHandler = async (req, res, next) => {
    try {
        const { totalCapital = 10000, riskPercentage = 1, feedbackDirective } = req.body;
        
        // Call the service directly to ensure a fresh run with feedback
        const data = await geminiService.runFullPipeline(totalCapital, riskPercentage, feedbackDirective);
        
        // Update the cache with the new result and set it as the last analysis for other services
        analysisCache.presentDay = data;
        analysisCache.backtest = null; // Also clear backtest cache if a full run is initiated
        geminiService.setLastPresentDayAnalysis(data);

        res.json(data);
    } catch (error: any) {
        error.message = `Error running full analysis: ${error.message}`;
        next(error);
    }
};

export const rerollSignal: RequestHandler = async (req, res, next) => {
    try {
        const { signalType, horizon, excludeAssets } = req.body;
        const pricesWithSource = await marketService.fetchPrices(['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'LTC', 'MATIC', 'DOT']);
        const livePrices: LivePrices = {};
        for (const ticker in pricesWithSource) {
            livePrices[ticker] = pricesWithSource[ticker].price;
        }
        const newSignal = await geminiService.fetchNewSignal({ signalType, horizon, excludeAssets, livePrices });
        res.json(newSignal);
    } catch (error: any) {
        error.message = `Error rerolling signal: ${error.message}`;
        next(error);
    }
};

export const refreshHorizon: RequestHandler = async (req, res, next) => {
    try {
        const { horizon, side, count, excludeAssets } = req.body;
        const horizonLabel = HORIZON_LABELS[horizon as HorizonKey];
        const sideLabel = side === 'buy' ? 'COMPRA' : 'VENDA';

        const newSignals = await geminiService.fetchNewSignalsForHorizon(horizonLabel as Horizon, sideLabel, count, excludeAssets);
        res.json(newSignals);
    } catch (error: any) {
        error.message = `Error refreshing horizon signals: ${error.message}`;
        next(error);
    }
};

export const getTacticalAnalysis: RequestHandler = async (req, res, next) => {
    try {
        const { assetTicker, language, horizon } = req.body;
        const priceInfo = await marketService.fetchPriceForTicker(assetTicker);
        if (!priceInfo.price) {
            return res.status(404).json({ message: `Could not find price for asset: ${assetTicker}` });
        }
        const analysis = await geminiService.fetchTacticalAnalysis(assetTicker, priceInfo.price, priceInfo.source, language, horizon);
        res.json(analysis);
    } catch (error: any) {
        error.message = `Error fetching tactical analysis: ${error.message}`;
        next(error);
    }
};

export const postChartAnalysis: RequestHandler = async (req, res, next) => {
    try {
        const { base64Image, mimeType, language } = req.body;
        if (!base64Image || !mimeType || !language) {
            return res.status(400).json({ message: 'Missing required parameters: base64Image, mimeType, language' });
        }
        const analysis = await geminiService.analyzeChartImage(base64Image, mimeType, language);
        res.json(analysis);
    } catch (error: any) {
        error.message = `Error fetching chart analysis: ${error.message}`;
        next(error);
    }
};

export const postChatMessage: RequestHandler = async (req, res, next) => {
    try {
        const { message, presentDayData, backtestData } = req.body;
        const chat = await geminiService.createChatSession(presentDayData, backtestData);
        const response = await chat.sendMessage({ message });
        res.json({ text: response.text });
    } catch (error: any) {
        error.message = `Error processing chat message: ${error.message}`;
        next(error);
    }
};

export const getSupervisorDirective: RequestHandler = async (req, res, next) => {
    try {
        const { analysis, evolutionPrompt } = req.body;
        const directive = await geminiService.fetchSupervisorDirective(analysis, evolutionPrompt);
        res.json(directive);
    } catch (error: any) {
        error.message = `Error fetching supervisor directive: ${error.message}`;
        next(error);
    }
};

export const getRobustnessAudit: RequestHandler = async (req, res, next) => {
    try {
        const report = await geminiService.fetchRobustnessAudit();
        res.json(report);
    } catch (error: any) {
        error.message = `Error fetching robustness audit: ${error.message}`;
        next(error);
    }
};

export const getMarketPrices: RequestHandler = async (req, res, next) => {
    try {
        const { tickers } = req.body;
        if (!Array.isArray(tickers)) {
            return res.status(400).json({ message: 'Tickers must be an array.' });
        }
        const data = await marketService.fetchPrices(tickers);
        res.json(data);
    } catch (error: any) {
        error.message = `Error fetching market prices: ${error.message}`;
        next(error);
    }
};

export const getMemeCoinAnalysis: RequestHandler = async (req, res, next) => {
    try {
        const data = await geminiService.fetchMemeCoinAnalysis();
        res.json(data);
    } catch (error: any) {
        error.message = `Error fetching meme coin analysis: ${error.message}`;
        next(error);
    }
};

export const getSentimentAnalysis: RequestHandler = async (req, res, next) => {
    try {
        const { assets, language } = req.body;
        const data = await geminiService.fetchSentimentAnalysis(assets, language);
        res.json(data);
    } catch (error: any) {
        error.message = `Error fetching sentiment analysis: ${error.message}`;
        next(error);
    }
};