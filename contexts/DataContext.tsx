import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode, useRef } from 'react';
import { PresentDayAssetSignal, LivePrices, BacktestAnalysisResult, PresentDayAnalysisResult, MemeCoinSignal, CompletedTrade, SentimentAnalysis, Notification, ActiveTrade, ApiKey, OrderStatus, PerformanceMetrics } from '../types.ts';
import { ApiClient } from '../services/api/client.ts';
import { HorizonKey, HORIZON_LABELS } from '../services/horizonPolicy.ts';
import { DateTime } from 'luxon';
import { translations } from '../utils/translations.ts';
import { useLanguage } from './LanguageContext.tsx';
import { formatCurrency } from '../utils/formatters.ts';


const SIGNAL_HISTORY_KEY = 'cryptoSignalHistory';
const COMPLETED_TRADES_KEY = 'cryptoCompletedTrades';
const WATCHLIST_KEY = 'cryptoWatchlist';
const NOTIFICATIONS_KEY = 'cryptoNotifications';
const ACTIVE_TRADES_KEY = 'cryptoActiveTrades';
const API_KEYS_KEY = 'cryptoApiKeys';
const PENDING_SIGNALS_KEY = 'cryptoPendingSignals';
const TOTAL_CAPITAL_KEY = 'cryptoTotalCapital';
const RISK_PERCENTAGE_KEY = 'cryptoRiskPercentage';


// --- Realism Simulation Constants ---
const TRADING_FEE_PERCENT = 0.1; // 0.1% fee per trade (entry and exit)
const MAX_SLIPPAGE_PERCENT = 0.05; // Max 0.05% slippage

const parseEntryRange = (rangeStr: string | null | undefined): { start: number; end: number } | null => {
    if (!rangeStr || typeof rangeStr !== 'string') return null;
    
    // Handle single values
    const singleVal = parseFloat(rangeStr.replace(/[^0-9.-]/g, ''));
    if (!isNaN(singleVal) && !rangeStr.includes('-')) {
        return { start: singleVal, end: singleVal };
    }
    
    // Handle ranges
    const parts = rangeStr.split('-').map(s => parseFloat(s.trim().replace(/[^0-9.-]/g, '')));
    
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { start: Math.min(parts[0], parts[1]), end: Math.max(parts[0], parts[1]) };
    }
    
    return null;
};

export interface IDataContext {
    presentDayData: PresentDayAnalysisResult | null;
    backtestData: BacktestAnalysisResult | null;
    isInitialLoading: boolean;
    isBacktestLoading: boolean;
    isRecalculating: boolean;
    error: string | null;
    livePrices: LivePrices | null;
    signalHistory: PresentDayAssetSignal[];
    history: { role: 'user' | 'model', text: string }[];
    isChatLoading: boolean;
    memeCoinSignals: MemeCoinSignal[] | null;
    completedTrades: CompletedTrade[];
    activeTrades: ActiveTrade[];
    pendingSignals: PresentDayAssetSignal[];
    apiKeys: ApiKey[];
    watchlist: string[];
    watchlistAnalysisResult: PresentDayAssetSignal | null;
    isWatchlistLoading: boolean;
    watchlistError: string | null;
    sentimentData: SentimentAnalysis[] | null;
    notifications: Notification[];
    totalCapital: number;
    riskPercentage: number;
    performanceFeedback: string | null;
    activeHorizon: HorizonKey;
    setActiveHorizon: (horizon: HorizonKey) => void;
    runFullAnalysis: () => Promise<void>;
    loadBacktestData: () => Promise<void>;
    handleSendMessage: (message: string) => Promise<void>;
    updatePresentDaySignal: (type: 'buy' | 'sell', index: number, newSignal: PresentDayAssetSignal) => Promise<void>;
    replaceSignalsForHorizon: (horizon: HorizonKey, side: 'buy' | 'sell', newSignals: PresentDayAssetSignal[]) => void;
    addPresentDaySignal: (side: 'buy' | 'sell', newSignal: PresentDayAssetSignal) => void;
    addSignalToHistory: (signal: PresentDayAssetSignal) => void;
    loadedHorizons: Set<HorizonKey>;
    horizonsLoading: { [key in HorizonKey]?: boolean };
    lazyLoadHorizon: (horizon: HorizonKey) => Promise<void>;
    resetChatHistory: (initialMessage: string) => void;
    addToWatchlist: (asset: string) => void;
    removeFromWatchlist: (asset: string) => void;
    analyzeWatchlistAsset: (asset: string) => Promise<void>;
    markAllNotificationsAsRead: () => void;
    clearAllNotifications: () => void;
    addApiKey: (key: ApiKey) => void;
    removeApiKey: (id: string) => void;
    setTotalCapital: (capital: number) => void;
    setRiskPercentage: (percentage: number) => void;
    resetCompletedTrades: () => void;
    resetActiveTrades: () => void;
}

const DataContext = createContext<IDataContext | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode, apiClient: ApiClient }> = ({ children, apiClient }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const [presentDayData, setPresentDayData] = useState<PresentDayAnalysisResult | null>(null);
    const [backtestData, setBacktestData] = useState<BacktestAnalysisResult | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isBacktestLoading, setIsBacktestLoading] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [livePrices, setLivePrices] = useState<LivePrices | null>(null);
    const [signalHistory, setSignalHistory] = useState<PresentDayAssetSignal[]>([]);
    const [history, setHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [memeCoinSignals, setMemeCoinSignals] = useState<MemeCoinSignal[] | null>([]);
    const [completedTrades, setCompletedTrades] = useState<CompletedTrade[]>([]);
    
    // --- Phase 2: Watchlist State ---
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [watchlistAnalysisResult, setWatchlistAnalysisResult] = useState<PresentDayAssetSignal | null>(null);
    const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
    const [watchlistError, setWatchlistError] = useState<string | null>(null);

    // --- Phase 3: Sentiment Analysis State ---
    const [sentimentData, setSentimentData] = useState<SentimentAnalysis[] | null>(null);

    // --- Phase 4: Notification State ---
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const previousTopSignalRef = useRef<string | null>(null);

    // --- Phase 4.5: Paper Trading State ---
    const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
    const [pendingSignals, setPendingSignals] = useState<PresentDayAssetSignal[]>([]);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

    // --- Phase 8: Risk Management State ---
    const [totalCapital, setTotalCapitalState] = useState<number>(100);
    const [riskPercentage, setRiskPercentageState] = useState<number>(5);

    // --- Prompt 20.5: Performance Feedback State ---
    const [performanceFeedback, setPerformanceFeedback] = useState<string | null>(null);


    const [loadedHorizons, setLoadedHorizons] = useState(new Set<HorizonKey>(['24h']));
    const [horizonsLoading, setHorizonsLoading] = useState<{[key in HorizonKey]?: boolean}>({});
    const [activeHorizon, setActiveHorizon] = useState<HorizonKey>('24h');
    
    const pendingSignalsRef = useRef(pendingSignals);
    pendingSignalsRef.current = pendingSignals;
    const presentDayDataRef = useRef(presentDayData);
    presentDayDataRef.current = presentDayData;

    const calculateMetrics = (trades: CompletedTrade[]): PerformanceMetrics => {
        const totalTrades = trades.length;
        if (totalTrades === 0) {
            return { totalTrades: 0, wins: 0, losses: 0, winRate: 0, profitFactor: null, totalNetProfit: 0, averageRoi: 0 };
        }
    
        const wins = trades.filter(t => t.outcome === 'Win');
        const losses = trades.filter(t => t.outcome === 'Loss');
        
        const totalProfitFromWins = wins.reduce((acc, t) => acc + t.actualProfitUsd, 0);
        const totalLossFromLosses = Math.abs(losses.reduce((acc, t) => acc + t.actualProfitUsd, 0));
    
        const winRate = (wins.length / totalTrades) * 100;
        const profitFactor = totalLossFromLosses > 0 ? totalProfitFromWins / totalLossFromLosses : null;
        const totalNetProfit = trades.reduce((acc, t) => acc + t.actualProfitUsd, 0);
        const averageRoi = trades.reduce((acc, t) => acc + t.actualRoiPercentage, 0) / totalTrades;
    
        return {
            totalTrades,
            wins: wins.length,
            losses: losses.length,
            winRate,
            profitFactor,
            totalNetProfit,
            averageRoi,
        };
    };

    useEffect(() => {
        const savedHistory = localStorage.getItem(SIGNAL_HISTORY_KEY);
        if (savedHistory) {
            try { setSignalHistory(JSON.parse(savedHistory)); } catch (e) { console.error("Failed to parse signal history", e); }
        }
        const savedCompleted = localStorage.getItem(COMPLETED_TRADES_KEY);
        if (savedCompleted) {
            try { setCompletedTrades(JSON.parse(savedCompleted)); } catch (e) { console.error("Failed to parse completed trades", e); }
        }
        const savedWatchlist = localStorage.getItem(WATCHLIST_KEY);
        if (savedWatchlist) {
            try { setWatchlist(JSON.parse(savedWatchlist)); } catch (e) { console.error("Failed to parse watchlist", e); }
        }
        const savedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
        if (savedNotifications) {
            try { setNotifications(JSON.parse(savedNotifications)); } catch (e) { console.error("Failed to parse notifications", e); }
        }
        const savedActive = localStorage.getItem(ACTIVE_TRADES_KEY);
        if (savedActive) {
            try { setActiveTrades(JSON.parse(savedActive)); } catch (e) { console.error("Failed to parse active trades", e); }
        }
        const savedApiKeys = localStorage.getItem(API_KEYS_KEY);
        if (savedApiKeys) {
            try { setApiKeys(JSON.parse(savedApiKeys)); } catch (e) { console.error("Failed to parse API keys", e); }
        }
        const savedPending = localStorage.getItem(PENDING_SIGNALS_KEY);
        if (savedPending) {
            try { 
                const parsed = JSON.parse(savedPending);
                if (Array.isArray(parsed)) {
                    setPendingSignals(parsed); 
                }
            } catch (e) { console.error("Failed to parse pending signals", e); }
        }
        const savedCapital = localStorage.getItem(TOTAL_CAPITAL_KEY);
        try { 
            setTotalCapitalState(parseFloat(savedCapital || '100')); 
        } catch (e) { 
            console.error("Failed to parse total capital", e); 
        }

        const savedRisk = localStorage.getItem(RISK_PERCENTAGE_KEY);
        try { 
            setRiskPercentageState(parseFloat(savedRisk || '5')); 
        } catch (e) { 
            console.error("Failed to parse risk percentage", e); 
        }
    }, []);

    const setTotalCapital = useCallback((capital: number) => {
        const newCapital = Math.max(0, capital);
        setTotalCapitalState(newCapital);
        localStorage.setItem(TOTAL_CAPITAL_KEY, String(newCapital));
    }, []);

    const setRiskPercentage = useCallback((percentage: number) => {
        const newRisk = Math.max(0.1, Math.min(100, percentage));
        setRiskPercentageState(newRisk);
        localStorage.setItem(RISK_PERCENTAGE_KEY, String(newRisk));
    }, []);

    const addSignalToHistory = useCallback((signal: PresentDayAssetSignal) => {
        setSignalHistory(prev => {
            const newHistory = [signal, ...prev].slice(0, 20); // Keep last 20 signals
            localStorage.setItem(SIGNAL_HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        setNotifications(prev => {
            const newNotification: Notification = {
                ...notification,
                id: `${notification.type}_${notification.assetName || ''}_${Date.now()}`,
                timestamp: new Date().toISOString(),
                read: false,
            };
            const updatedNotifications = [newNotification, ...prev].slice(0, 50); // Keep last 50
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
            return updatedNotifications;
        });
    }, []);

    const generatePerformanceFeedback = useCallback((): string => {
        if (completedTrades.length === 0) {
            return '';
        }
    
        const buyTrades = completedTrades.filter(t => t.signalType === 'COMPRA');
        const sellTrades = completedTrades.filter(t => t.signalType === 'VENDA');
    
        const buyMetrics = calculateMetrics(buyTrades);
        const sellMetrics = calculateMetrics(sellTrades);
        
        const feedbackParts = [];
    
        if (buyMetrics.totalTrades > 0) {
            const profitFactorText = buyMetrics.profitFactor !== null ? buyMetrics.profitFactor.toFixed(2) : '0.00';
            feedbackParts.push(`COMPRA (Longs) - Taxa de Acerto: ${buyMetrics.winRate.toFixed(0)}%, Fator de Lucro: ${profitFactorText}, Resultado: ${formatCurrency(buyMetrics.totalNetProfit)}.`);
        }
        if (sellMetrics.totalTrades > 0) {
            const profitFactorText = sellMetrics.profitFactor !== null ? sellMetrics.profitFactor.toFixed(2) : '0.00';
            feedbackParts.push(`VENDA (Shorts) - Taxa de Acerto: ${sellMetrics.winRate.toFixed(0)}%, Fator de Lucro: ${profitFactorText}, Resultado: ${formatCurrency(sellMetrics.totalNetProfit)}.`);
        }
    
        if (feedbackParts.length > 0) {
            return `Feedback de Performance Recente: ${feedbackParts.join(' ')}`;
        }
        return '';
    }, [completedTrades]);

    const runFullAnalysis = useCallback(async () => {
        setIsRecalculating(true);
        setError(null);
        setPerformanceFeedback(null); // Clear previous feedback
        try {
            const feedbackDirective = generatePerformanceFeedback();
            if (feedbackDirective) {
                setPerformanceFeedback(feedbackDirective); // Set new feedback for display
            }
            
            const baseAssetsForSentiment = ['BTC', 'ETH', 'SOL', 'DOGE', 'SHIB', 'PEPE', 'WIF'];
            const uniqueAssetsForSentiment = Array.from(new Set([...baseAssetsForSentiment, ...watchlist]));
            
            const [presentDay, memeCoins, sentiment] = await Promise.all([
                apiClient.runFullAnalysis(totalCapital, riskPercentage, feedbackDirective),
                apiClient.fetchMemeCoinAnalysis(),
                apiClient.fetchSentimentAnalysis(uniqueAssetsForSentiment, language)
            ]);
            
            // Phase 4: Check for new top signal
            const newTopSignal = [...presentDay.presentDayBuySignals, ...presentDay.presentDaySellSignals].find(s => s.isTopSignal);
            if (newTopSignal && newTopSignal.assetName !== previousTopSignalRef.current) {
                addNotification({
                    type: 'new_top_signal',
                    message: t.newTopSignalAlert.replace('{assetName}', newTopSignal.assetName),
                    assetName: newTopSignal.assetName,
                });
                previousTopSignalRef.current = newTopSignal.assetName;
            } else if (!newTopSignal) {
                previousTopSignalRef.current = null;
            }

            // Phase 4.5 Refactor: Add new signals to the pending list for activation
            const allNewSignals = [...presentDay.presentDayBuySignals, ...presentDay.presentDaySellSignals]
                .filter(signal => signal.signalType !== 'NEUTRO');

            const currentPending = pendingSignalsRef.current;
            const existingSignalIds = new Set(currentPending.map(s => `${s.assetName}-${s.entryDatetime}`));
            const uniqueNewSignals = allNewSignals.filter(s => !existingSignalIds.has(`${s.assetName}-${s.entryDatetime}`));
            
            if (uniqueNewSignals.length > 0) {
                const updatedSignals = [...currentPending, ...uniqueNewSignals];
                setPendingSignals(updatedSignals);
                localStorage.setItem(PENDING_SIGNALS_KEY, JSON.stringify(updatedSignals));
            }

            // Set other data
            setPresentDayData(presentDay);
            setMemeCoinSignals(memeCoins);
            setSentimentData(sentiment);
            setLoadedHorizons(new Set<HorizonKey>(['24h']));
            
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsRecalculating(false);
            // This can be called safely. If isInitialLoading is already false,
            // React treats it as a no-op. This removes the dependency cycle.
            setIsInitialLoading(false);
        }
    }, [apiClient, language, addNotification, t, totalCapital, riskPercentage, generatePerformanceFeedback, watchlist]);
    

    // Phase 4.5, Pilar 3: Simulate order execution for pending trades
    useEffect(() => {
        const pendingTrades = activeTrades.filter(t => t.orderStatus === 'Pending');
        if (pendingTrades.length === 0) return;
    
        const timer = setTimeout(() => {
            setActiveTrades(currentTrades => {
                const updatedTrades = currentTrades.map(trade => {
                    if (trade.orderStatus === 'Pending') {
                        return { 
                            ...trade, 
                            orderStatus: 'Filled' as OrderStatus, 
                            executionDetails: t.tooltipFilled 
                        };
                    }
                    return trade;
                });
                localStorage.setItem(ACTIVE_TRADES_KEY, JSON.stringify(updatedTrades));
                return updatedTrades;
            });
        }, 1500 + Math.random() * 1000); // Simulate network latency
    
        return () => clearTimeout(timer);
    
    }, [activeTrades, t.tooltipFilled]);

    // NEW: Trigger Engine for Pending Signals
    useEffect(() => {
        const triggerInterval = setInterval(async () => {
            const currentPendingSignals = pendingSignalsRef.current;
            if (!currentPendingSignals || currentPendingSignals.length === 0) {
                return;
            }

            let signalsChanged = false;
            
            // 1. Manage Expiration: Remove signals that have passed their exit time
            const now = DateTime.now();
            const freshSignals = currentPendingSignals.filter(signal => {
                if (!signal || typeof signal.exitDatetime !== 'string') {
                    if (signal) console.warn('Pending signal found without string exitDatetime', signal);
                    return false;
                }
                try {
                    const exitTime = DateTime.fromFormat(signal.exitDatetime, 'dd/MM/yyyy HH:mm:ss');
                    if (!exitTime.isValid) {
                         console.warn('Could not parse date for expiration check', signal.exitDatetime);
                         return false; // Discard signals with invalid dates
                    }
                    // A signal is fresh if its exit time is in the future.
                    return exitTime >= now;
                } catch (e) {
                    console.warn('Error during date parsing for expiration check', signal.exitDatetime, e);
                    return false;
                }
            });
            
            if (freshSignals.length !== currentPendingSignals.length) {
                signalsChanged = true;
            }
            
            const assetsToUpdate = [...new Set(freshSignals.map(s => s.assetName))];
            if (assetsToUpdate.length === 0) {
                if (signalsChanged) { // All signals expired
                    setPendingSignals([]);
                    localStorage.setItem(PENDING_SIGNALS_KEY, JSON.stringify([]));
                }
                return;
            }

            try {
                const prices = await apiClient.fetchPrices(assetsToUpdate);
                
                const stillPendingSignals: PresentDayAssetSignal[] = [];
                const newActiveTrades: ActiveTrade[] = [];
                const currentPresentDayData = presentDayDataRef.current;

                // 2. Check Triggers
                for (const signal of freshSignals) {
                    const priceInfo = prices[signal.assetName];
                    const range = parseEntryRange(signal.entryRange);
                    
                    if (priceInfo && priceInfo.price && range) {
                        const currentPrice = parseFloat(priceInfo.price);
                        
                        let isTriggered = false;
                        if (signal.signalType === 'COMPRA') {
                            // A buy signal triggers if the current price drops to or below the HIGHEST price in the entry range.
                            // This simulates a limit order filling at the top of the desired buy zone or better (lower).
                            if (currentPrice <= range.end) {
                                isTriggered = true;
                            }
                        } else { // VENDA
                            // A sell signal triggers if the current price rises to or above the LOWEST price in the entry range.
                            // This simulates a limit order filling at the bottom of the desired sell zone or better (higher).
                            if (currentPrice >= range.start) {
                                isTriggered = true;
                            }
                        }

                        if (isTriggered) {
                            signalsChanged = true;
                            // TRIGGER! Create ActiveTrade
                            const slippageFactor = Math.random() * (MAX_SLIPPAGE_PERCENT / 100); // Always a positive factor
                            let finalEntryPrice;
                            if (signal.signalType === 'COMPRA') {
                                // Slippage makes buy price slightly higher (worse)
                                finalEntryPrice = currentPrice * (1 + slippageFactor);
                            } else { // VENDA
                                // Slippage makes sell price slightly lower (worse)
                                finalEntryPrice = currentPrice * (1 - slippageFactor);
                            }
                            
                            const marketRegime = currentPresentDayData?.macroContext?.find(ind => ind.name.toLowerCase().includes('regime'))?.value || 'Indefinido';
                            
                            newActiveTrades.push({
                                ...signal,
                                signalType: signal.signalType as 'COMPRA' | 'VENDA',
                                id: `${signal.assetName}-${signal.entryDatetime}`,
                                status: 'active',
                                entryPrice: finalEntryPrice,
                                currentPrice: finalEntryPrice,
                                livePnlUsd: 0,
                                livePnlPercentage: 0,
                                orderStatus: 'Pending',
                                executionDetails: t.statusPending,
                                isStopAdjusted: false, // Initialize trailing stop flag
                                marketRegimeAtEntry: marketRegime, // Capture context
                            });
                        } else {
                            stillPendingSignals.push(signal);
                        }
                    } else {
                        stillPendingSignals.push(signal); // Keep if price or range is invalid for now
                    }
                }
                
                // 3. Update states if anything changed
                if (signalsChanged) {
                    if (newActiveTrades.length > 0) {
                        addNotification({
                            type: 'positions_opened',
                            message: t.newPositionsOpenedAlert.replace('{count}', String(newActiveTrades.length)),
                        });
                        setActiveTrades(prev => {
                            const updatedTrades = [...prev, ...newActiveTrades];
                            localStorage.setItem(ACTIVE_TRADES_KEY, JSON.stringify(updatedTrades));
                            return updatedTrades;
                        });
                    }
                    
                    setPendingSignals(stillPendingSignals);
                    localStorage.setItem(PENDING_SIGNALS_KEY, JSON.stringify(stillPendingSignals));
                }

            } catch (error) {
                console.error("Error during pending signal trigger check:", error);
            }
        }, 20000); // Check every 20 seconds

        return () => clearInterval(triggerInterval);
    }, [apiClient, t, addNotification]);


    // Phase 4.5: Live monitoring of active paper trades with fees and slippage
    useEffect(() => {
        const monitorInterval = setInterval(async () => {
            const currentActiveTrades = JSON.parse(localStorage.getItem(ACTIVE_TRADES_KEY) || '[]') as ActiveTrade[];

            if (currentActiveTrades.length === 0) return;

            const assetsToUpdate = [...new Set(currentActiveTrades.map(t => t.assetName))];
            if (assetsToUpdate.length === 0) return;

            try {
                const prices = await apiClient.fetchPrices(assetsToUpdate);
                let tradesClosed = false;
                
                const updatedActiveTrades = [...currentActiveTrades];
                const newCompletedTrades: CompletedTrade[] = [];

                for (let i = updatedActiveTrades.length - 1; i >= 0; i--) {
                    const trade = updatedActiveTrades[i];
                    const priceInfo = prices[trade.assetName];

                    if (priceInfo && priceInfo.price) {
                        const currentPrice = parseFloat(priceInfo.price);
                        trade.currentPrice = currentPrice;
                        
                        // Calculate P/L with fees
                        const baseInvestment = 100;
                        let grossLivePnlPercentage;
                        if (trade.signalType === 'COMPRA') {
                            grossLivePnlPercentage = (currentPrice / trade.entryPrice - 1) * 100;
                        } else { // VENDA
                            grossLivePnlPercentage = (trade.entryPrice / currentPrice - 1) * 100;
                        }
                        const grossLivePnlUsd = (grossLivePnlPercentage / 100) * baseInvestment;
                        const entryFee = baseInvestment * (TRADING_FEE_PERCENT / 100);
                        const currentValue = baseInvestment + grossLivePnlUsd;
                        const estimatedExitFee = currentValue * (TRADING_FEE_PERCENT / 100);
                        const totalEstimatedFees = entryFee + estimatedExitFee;

                        trade.livePnlUsd = grossLivePnlUsd - totalEstimatedFees;
                        trade.livePnlPercentage = (trade.livePnlUsd / baseInvestment) * 100;
                        
                        // Trailing Stop Logic: Move to breakeven
                        if (!trade.isStopAdjusted) {
                            const BREAKEVEN_THRESHOLD = 0.5; // 50% towards target
                            const entryPrice = trade.entryPrice;
                            const targetPrice = parseFloat(trade.target);

                            if (!isNaN(targetPrice)) {
                                let progress = 0;
                                const potentialProfit = Math.abs(targetPrice - entryPrice);
                                
                                if (potentialProfit > 0) {
                                    const currentProfit = trade.signalType === 'COMPRA'
                                        ? currentPrice - entryPrice
                                        : entryPrice - currentPrice;
                                    
                                    progress = currentProfit / potentialProfit;
                                }

                                if (progress >= BREAKEVEN_THRESHOLD) {
                                    trade.stopLoss = String(trade.entryPrice);
                                    trade.isStopAdjusted = true;
                                }
                            }
                        }

                        // Check for closure
                        const targetPrice = parseFloat(trade.target);
                        const stopLossPrice = parseFloat(trade.stopLoss);
                        let closed = false;
                        let closeReason: 'Target' | 'Stop' | 'Expired' | undefined = undefined;
                        
                        const exitTime = DateTime.fromFormat(trade.exitDatetime, 'dd/MM/yyyy HH:mm:ss');
                        
                        if (trade.signalType === 'COMPRA') {
                            if (currentPrice >= targetPrice) { closed = true; closeReason = 'Target'; }
                            else if (currentPrice <= stopLossPrice) { closed = true; closeReason = 'Stop'; }
                        } else if (trade.signalType === 'VENDA') {
                            if (currentPrice <= targetPrice) { closed = true; closeReason = 'Target'; }
                            else if (currentPrice >= stopLossPrice) { closed = true; closeReason = 'Stop'; }
                        }

                        // Check for time-based expiration
                        if (!closed && exitTime.isValid && DateTime.now() > exitTime) {
                            closed = true;
                            closeReason = 'Expired';
                        }

                        if (closed) {
                            tradesClosed = true;
                            
                            const closingReasonMap: { [key: string]: CompletedTrade['closingReason'] } = {
                                'Target': 'target_hit',
                                'Stop': 'stop_loss_hit',
                                'Expired': 'expired'
                            };

                            // Apply exit slippage
                            const exitSlippageFactor = Math.random() * (MAX_SLIPPAGE_PERCENT / 100);
                            let adjustedExitPrice;

                            if (trade.signalType === 'COMPRA') {
                                // For a buy trade, we are selling to exit. Slippage gives us a lower price.
                                adjustedExitPrice = currentPrice * (1 - exitSlippageFactor);
                            } else { // VENDA
                                // For a sell trade, we are buying to exit. Slippage gives us a higher price.
                                adjustedExitPrice = currentPrice * (1 + exitSlippageFactor);
                            }

                            let grossPnlPercentage;
                            if (trade.signalType === 'COMPRA') {
                                grossPnlPercentage = (adjustedExitPrice / trade.entryPrice - 1) * 100;
                            } else { // VENDA
                                grossPnlPercentage = (trade.entryPrice / adjustedExitPrice - 1) * 100;
                            }
                            const grossPnlUsd = (grossPnlPercentage / 100) * baseInvestment;
                            
                            const finalEntryFee = baseInvestment * (TRADING_FEE_PERCENT / 100);
                            const exitValue = baseInvestment + grossPnlUsd;
                            const finalExitFee = exitValue * (TRADING_FEE_PERCENT / 100);
                            const totalFees = finalEntryFee + finalExitFee;

                            const netProfitUsd = grossPnlUsd - totalFees;
                            const netRoiPercentage = (netProfitUsd / baseInvestment) * 100;
                            
                            const outcome = netProfitUsd > 0.05 ? 'Win' : (netProfitUsd < -0.05 ? 'Loss' : 'Breakeven');

                            newCompletedTrades.push({
                                id: trade.id,
                                assetName: trade.assetName,
                                signalType: trade.signalType,
                                entryDatetime: trade.entryDatetime,
                                exitDatetime: DateTime.now().toISO()!,
                                entryPrice: trade.entryPrice,
                                exitPrice: adjustedExitPrice,
                                target: trade.target,
                                stopLoss: trade.stopLoss,
                                outcome: outcome,
                                actualProfitUsd: netProfitUsd,
                                actualRoiPercentage: netRoiPercentage,
                                status: 'Closed',
                                feesUsd: totalFees,
                                closingReason: closingReasonMap[closeReason || 'Expired'],
                                marketRegimeAtEntry: trade.marketRegimeAtEntry,
                                technicalDrivers: trade.technicalDrivers,
                            });
                            updatedActiveTrades.splice(i, 1);
                        }
                    }
                }
                
                // Update states
                setActiveTrades(updatedActiveTrades);
                localStorage.setItem(ACTIVE_TRADES_KEY, JSON.stringify(updatedActiveTrades));

                if (tradesClosed) {
                    setCompletedTrades(prev => {
                        const allCompleted = [...newCompletedTrades, ...prev];
                        localStorage.setItem(COMPLETED_TRADES_KEY, JSON.stringify(allCompleted));
                        return allCompleted;
                    });
                }

            } catch (error) {
                console.error("Error during live monitoring:", error);
            }
        }, 5000); // Check every 5 seconds for responsiveness

        return () => clearInterval(monitorInterval);
    }, [apiClient]);


    // Phase 4 Logic: Continuous monitoring for notifications
    useEffect(() => {
        const interval = setInterval(() => {
            if (!presentDayData) return;

            const allSignals = [...presentDayData.presentDayBuySignals, ...presentDayData.presentDaySellSignals];
            
            for (const signal of allSignals) {
                if (!signal.livePrice || signal.signalType === 'NEUTRO') continue;

                const livePrice = parseFloat(signal.livePrice);
                const range = parseEntryRange(signal.entryRange);

                if (isNaN(livePrice) || !range) continue;

                const proximityThreshold = 0.02; // 2%
                let isNear = false;

                if (signal.signalType === 'COMPRA') {
                    const lowerBound = range.end * (1 - proximityThreshold);
                    if (livePrice >= lowerBound && livePrice <= range.end) {
                        isNear = true;
                    }
                } else { // VENDA
                    const upperBound = range.start * (1 + proximityThreshold);
                     if (livePrice <= upperBound && livePrice >= range.start) {
                        isNear = true;
                    }
                }

                if (isNear) {
                    const recentNotification = notifications.find(n => 
                        n.assetName === signal.assetName &&
                        n.type === 'price_proximity' &&
                        DateTime.fromISO(n.timestamp).diffNow(['hours']).hours > -1 // Check if notified in the last hour
                    );
                    if (!recentNotification) {
                        addNotification({
                            type: 'price_proximity',
                            message: t.priceProximityAlert.replace('{assetName}', signal.assetName),
                            assetName: signal.assetName,
                        });
                    }
                }
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [presentDayData, notifications, addNotification, t.priceProximityAlert]);


    useEffect(() => {
        if(isInitialLoading) {
            runFullAnalysis();
        }
    }, [isInitialLoading, runFullAnalysis]);
    
    const loadBacktestData = useCallback(async () => {
        setIsBacktestLoading(true);
        setError(null);
        try {
            const data = await apiClient.fetchBacktestAnalysis();
            setBacktestData(data);
        } catch (e: any) {
            console.error("Failed to load backtest data:", e.message);
            setError(e.message);
        } finally {
            setIsBacktestLoading(false);
        }
    }, [apiClient]);

    const updatePresentDaySignal = useCallback(async (type: 'buy' | 'sell', index: number, newSignal: PresentDayAssetSignal) => {
        setPresentDayData(prev => {
            if (!prev) return null;
            const signals = type === 'buy' ? [...prev.presentDayBuySignals] : [...prev.presentDaySellSignals];
            
            if (signals[index]) {
                addSignalToHistory(signals[index]);
            }

            signals[index] = newSignal;
            if (type === 'buy') {
                return { ...prev, presentDayBuySignals: signals };
            } else {
                return { ...prev, presentDaySellSignals: signals };
            }
        });
    }, [addSignalToHistory]);

    const addPresentDaySignal = useCallback((side: 'buy' | 'sell', newSignal: PresentDayAssetSignal) => {
        setPresentDayData(prev => {
            if (!prev) return null;
            if (side === 'buy') {
                return {
                    ...prev,
                    presentDayBuySignals: [...prev.presentDayBuySignals, newSignal]
                };
            } else {
                return {
                    ...prev,
                    presentDaySellSignals: [...prev.presentDaySellSignals, newSignal]
                };
            }
        });
    }, []);

    const replaceSignalsForHorizon = useCallback((horizon: HorizonKey, side: 'buy' | 'sell', newSignals: PresentDayAssetSignal[]) => {
        const horizonLabel = HORIZON_LABELS[horizon];
        setPresentDayData(prev => {
            if (!prev) return null;

            const signals = side === 'buy' ? [...prev.presentDayBuySignals] : [...prev.presentDaySellSignals];
            
            const otherHorizonsSignals = signals.filter(s => s.horizon !== horizonLabel);
            const updatedSignals = [...otherHorizonsSignals, ...newSignals];

            return side === 'buy'
                ? { ...prev, presentDayBuySignals: updatedSignals }
                : { ...prev, presentDaySellSignals: updatedSignals };
        });
    }, []);

    const lazyLoadHorizon = useCallback(async (horizon: HorizonKey) => {
        if (!presentDayData || loadedHorizons.has(horizon) || horizonsLoading[horizon]) return;
        
        setHorizonsLoading(prev => ({ ...prev, [horizon]: true }));
        try {
            const allAssetNames = [
                ...presentDayData.presentDayBuySignals.map(s => s.assetName),
                ...presentDayData.presentDaySellSignals.map(s => s.assetName),
            ];
            
            const [newBuySignals, newSellSignals] = await Promise.all([
                apiClient.fetchNewSignalsForHorizon(horizon, 'buy', 4, allAssetNames),
                apiClient.fetchNewSignalsForHorizon(horizon, 'sell', 4, allAssetNames)
            ]);
            
            replaceSignalsForHorizon(horizon, 'buy', newBuySignals);
            replaceSignalsForHorizon(horizon, 'sell', newSellSignals);

            setLoadedHorizons(prev => new Set(prev).add(horizon));
            
        } catch(e: any) {
            console.error(`Failed to lazy load horizon ${horizon}:`, e);
        } finally {
            setHorizonsLoading(prev => ({ ...prev, [horizon]: false }));
        }
    }, [apiClient, presentDayData, loadedHorizons, horizonsLoading, replaceSignalsForHorizon]);

    const resetChatHistory = useCallback((initialMessage: string) => {
        setHistory([{ role: 'model', text: initialMessage }]);
    }, []);

    const handleSendMessage = useCallback(async (message: string) => {
        if (!presentDayData) return;

        setHistory(prev => [...prev, { role: 'user', text: message }]);
        setIsChatLoading(true);

        try {
            const response = await apiClient.sendMessage({
                message,
                presentDayData,
                backtestData,
            });
            setHistory(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (e: any) {
            setHistory(prev => [...prev, { role: 'model', text: `Error: ${e.message}` }]);
        } finally {
            setIsChatLoading(false);
        }
    }, [presentDayData, backtestData, apiClient]);

    // --- Phase 2: Watchlist Functions ---
    const addToWatchlist = useCallback((asset: string) => {
        const upperAsset = asset.toUpperCase();
        if (!upperAsset || watchlist.includes(upperAsset)) return;

        setWatchlist(prev => {
            const newWatchlist = [upperAsset, ...prev];
            localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
            return newWatchlist;
        });
    }, [watchlist]);

    const removeFromWatchlist = useCallback((asset: string) => {
        setWatchlist(prev => {
            const newWatchlist = prev.filter(a => a !== asset);
            localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
            return newWatchlist;
        });
    }, []);

    const analyzeWatchlistAsset = useCallback(async (asset: string) => {
        setIsWatchlistLoading(true);
        setWatchlistError(null);
        setWatchlistAnalysisResult(null);
        try {
            // Using '24 Horas' as the default horizon for on-demand analysis
            const data = await apiClient.fetchTacticalAnalysis(asset, language, '24 Horas');
            setWatchlistAnalysisResult(data);
        } catch (e: any) {
            setWatchlistError(e.message || 'Análise falhou.');
        } finally {
            setIsWatchlistLoading(false);
        }
    }, [apiClient, language]);

    // --- Phase 4: Notification Management ---
    const markAllNotificationsAsRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
        localStorage.removeItem(NOTIFICATIONS_KEY);
    }, []);

    // --- Phase 4.5, Pillar 2: API Key Management ---
    const addApiKey = useCallback((key: ApiKey) => {
        setApiKeys(prev => {
            const newKeys = [...prev, key];
            localStorage.setItem(API_KEYS_KEY, JSON.stringify(newKeys));
            return newKeys;
        });
    }, []);

    const removeApiKey = useCallback((id: string) => {
        setApiKeys(prev => {
            const newKeys = prev.filter(k => k.id !== id);
            localStorage.setItem(API_KEYS_KEY, JSON.stringify(newKeys));
            return newKeys;
        });
    }, []);

    // --- New Reset Functions ---
    const resetCompletedTrades = useCallback(() => {
        setCompletedTrades([]);
        localStorage.removeItem(COMPLETED_TRADES_KEY);
    }, []);

    const resetActiveTrades = useCallback(() => {
        setActiveTrades([]);
        setPendingSignals([]);
        localStorage.removeItem(ACTIVE_TRADES_KEY);
        localStorage.removeItem(PENDING_SIGNALS_KEY);
    }, []);


    return (
        <DataContext.Provider value={{
            presentDayData,
            backtestData,
            isInitialLoading,
            isBacktestLoading,
            isRecalculating,
            error,
            livePrices,
            signalHistory,
            history,
            isChatLoading,
            memeCoinSignals,
            completedTrades,
            activeTrades,
            pendingSignals,
            apiKeys,
            watchlist,
            watchlistAnalysisResult,
            isWatchlistLoading,
            watchlistError,
            sentimentData,
            notifications,
            totalCapital,
            riskPercentage,
            performanceFeedback,
            activeHorizon,
            setActiveHorizon,
            runFullAnalysis,
            loadBacktestData,
            handleSendMessage,
            updatePresentDaySignal,
            addPresentDaySignal,
            replaceSignalsForHorizon,
            addSignalToHistory,
            loadedHorizons,
            horizonsLoading,
            lazyLoadHorizon,
            resetChatHistory,
            addToWatchlist,
            removeFromWatchlist,
            analyzeWatchlistAsset,
            markAllNotificationsAsRead,
            clearAllNotifications,
            addApiKey,
            removeApiKey,
            setTotalCapital,
            setRiskPercentage,
            resetCompletedTrades,
            resetActiveTrades,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): IDataContext => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};