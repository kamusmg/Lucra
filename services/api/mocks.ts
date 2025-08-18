
// This file acts as a "mock" or "simulated" backend.
// Instead of making network requests, it calls the local AI service functions directly.
// This allows the app to run fully self-contained in environments like AI Studio.

import * as geminiService from '../geminiService.ts';
import { HorizonKey, HORIZON_LABELS } from '../horizonPolicy.ts';
// Import fetchPriceForTicker for tactical analysis mock
import { fetchPrices as marketServiceFetchPrices, fetchPriceForTicker } from '../marketService.ts';
import type { Horizon, LivePrices } from '../../types.ts';

const simulateLatency = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

// The MockTransport simulates the behavior of the HttpTransport but for a local environment.
export const MockTransport = {
    async get<T>(path: string): Promise<T> {
        console.log(`[MOCK GET] ${path}`);
        await simulateLatency();

        if (path === '/api/analysis/present-day') {
            const data = await geminiService.runFullPipeline(10000, 1); // Default values for GET
            return data as T;
        }
        if (path === '/api/analysis/backtest') {
            const data = await geminiService.fetchBacktestAnalysis();
            return data as T;
        }
        if (path === '/api/analysis/robustness-audit') {
            const data = await geminiService.fetchRobustnessAudit();
            return data as T;
        }
        if (path === '/api/analysis/meme-coins') {
            const data = await geminiService.fetchMemeCoinAnalysis();
            return data as T;
        }


        throw new Error(`Mock GET endpoint not implemented for: ${path}`);
    },

    async post<T>(path: string, body: any): Promise<T> {
        console.log(`[MOCK POST] ${path}`, body);
        await simulateLatency();

        if (path === '/api/analysis/run') {
            const { totalCapital, riskPercentage } = body;
            const data = await geminiService.runFullPipeline(totalCapital, riskPercentage);
            return data as T;
        }
        if (path === '/api/analysis/reroll-signal') {
            const pricesWithSource = await marketServiceFetchPrices(['BTC', 'ETH']); // Get some context prices
            const prices: LivePrices = {};
            for (const ticker in pricesWithSource) {
                prices[ticker] = pricesWithSource[ticker].price;
            }
            const data = await geminiService.fetchNewSignal({
                signalType: body.signalType,
                horizon: body.horizon as Horizon,
                excludeAssets: body.excludeAssets,
                livePrices: prices,
            });
            return data as T;
        }
        if (path === '/api/analysis/refresh-horizon') {
            const { horizon, side, count, excludeAssets } = body;
            const horizonLabel = HORIZON_LABELS[horizon as HorizonKey];
            const sideLabel = side === 'buy' ? 'COMPRA' : 'VENDA';
            const data = await geminiService.fetchNewSignalsForHorizon(horizonLabel as Horizon, sideLabel, count, excludeAssets);
            return data as T;
        }
        if (path === '/api/analysis/tactical') {
            const priceInfo = await fetchPriceForTicker(body.assetTicker);
            if (!priceInfo.price) {
                throw new Error(`Could not find price for asset: ${body.assetTicker}`);
            }
            const data = await geminiService.fetchTacticalAnalysis(body.assetTicker, priceInfo.price, priceInfo.source, body.language, body.horizon);
            return data as T;
        }
        if (path === '/api/chat') {
            const chat = await geminiService.createChatSession(body.presentDayData, body.backtestData);
            const response = await chat.sendMessage({ message: body.message });
            return { text: response.text } as T;
        }
        if (path === '/api/analysis/chart') {
            const { base64Image, mimeType, language } = body;
            const data = await geminiService.analyzeChartImage(base64Image, mimeType, language);
            return data as T;
        }
        if (path === '/api/analysis/supervisor-directive') {
            const data = await geminiService.fetchSupervisorDirective(body.analysis, body.evolutionPrompt);
            return data as T;
        }
        if (path === '/api/market/prices') {
            const { tickers } = body;
            const data = await marketServiceFetchPrices(tickers);
            return data as T;
        }
        if (path === '/api/market/historical-price') {
            const { assetName } = body;
            const priceInfo = await fetchPriceForTicker(assetName);
            if (priceInfo.price) {
                const price = parseFloat(priceInfo.price);
                // Simulate a historical price with some variance
                const simulatedPrice = price * (1 + (Math.random() - 0.5) * 0.1); // +/- 5% variation
                return { price: simulatedPrice.toFixed(8) } as T;
            }
            return { price: null } as T;
        }
        if (path === '/api/analysis/sentiment') {
            const { assets, language } = body;
            const data = await geminiService.fetchSentimentAnalysis(assets, language);
            return data as T;
        }


        throw new Error(`Mock POST endpoint not implemented for: ${path}`);
    },
};