
import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { CompletedTrade, PerformanceMetrics } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

import TrophyIcon from './icons/TrophyIcon';
import JournalIcon from './icons/JournalIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import TrendingDownIcon from './icons/TrendingDownIcon';
import DollarSignIcon from './icons/DollarSignIcon';
import PercentIcon from './icons/PercentIcon';
import TrashIcon from './icons/TrashIcon';
import ChevronDownIcon from './ChevronDownIcon';


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

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass?: string }> = ({ title, value, icon, colorClass = 'text-primary' }) => (
    <div className="bg-background/50 p-4 rounded-lg border border-border/50 flex items-center gap-4">
        <div className={`flex-shrink-0 text-2xl ${colorClass}`}>{icon}</div>
        <div>
            <p className="text-sm text-text-secondary font-bold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const MetricsDisplay: React.FC<{ metrics: PerformanceMetrics, t: any }> = ({ metrics, t }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title={t.winRate} value={formatPercentage(metrics.winRate)} icon={<TrendingUpIcon />} colorClass={metrics.winRate >= 50 ? 'text-success' : 'text-danger'} />
        <MetricCard title={t.profitFactor} value={metrics.profitFactor?.toFixed(2) ?? '∞'} icon={<TrophyIcon />} colorClass={metrics.profitFactor && metrics.profitFactor >= 1 ? 'text-success' : 'text-danger'} />
        <MetricCard title={t.totalNetProfit} value={formatCurrency(metrics.totalNetProfit)} icon={<DollarSignIcon />} colorClass={metrics.totalNetProfit >= 0 ? 'text-success' : 'text-danger'} />
        <MetricCard title={t.avgRoi} value={formatPercentage(metrics.averageRoi)} icon={<PercentIcon />} colorClass={metrics.averageRoi >= 0 ? 'text-success' : 'text-danger'} />
    </div>
);

const formatDriverValue = (value: any) => {
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    if (typeof value === 'number') return value.toFixed(2);
    return String(value);
};

const TradeJournalRow: React.FC<{ trade: CompletedTrade; t: any }> = ({ trade, t }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const outcomeConfig: { [key in CompletedTrade['outcome']]: { text: string; color: string } } = {
        Win: { text: t.win, color: 'text-success' },
        Loss: { text: t.loss, color: 'text-danger' },
        Breakeven: { text: t.breakeven, color: 'text-yellow-400' },
        Processing: { text: t.processing, color: 'text-blue-400' },
        Error: { text: t.error, color: 'text-gray-500' },
    };

    const reasonConfig: { [key in CompletedTrade['closingReason']]: { text: string; color: string } } = {
        target_hit: { text: 'Alvo Atingido', color: 'text-success' },
        stop_loss_hit: { text: 'Stop Atingido', color: 'text-danger' },
        expired: { text: 'Expirado', color: 'text-yellow-400' },
        manual: { text: 'Manual', color: 'text-blue-400' },
    };

    const currentReason = reasonConfig[trade.closingReason] || { text: trade.closingReason, color: 'text-text-secondary' };

    return (
        <>
            <tr className="border-t border-border/50 hover:bg-border/50">
                <td className="p-3 font-semibold text-white">{trade.assetName}</td>
                <td className={`p-3 font-bold ${outcomeConfig[trade.outcome].color}`}>{outcomeConfig[trade.outcome].text}</td>
                <td className={`p-3 font-semibold ${currentReason.color}`}>{currentReason.text}</td>
                <td className="p-3 font-mono text-right text-text-secondary">{formatCurrency(trade.feesUsd)}</td>
                <td className={`p-3 font-semibold text-right ${trade.actualProfitUsd >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(trade.actualProfitUsd)}</td>
                <td className={`p-3 font-semibold text-right ${trade.actualRoiPercentage >= 0 ? 'text-success' : 'text-danger'}`}>{formatPercentage(trade.actualRoiPercentage)}</td>
                <td className="p-3 text-center">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-text-secondary hover:text-primary">
                        <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-background/50">
                    <td colSpan={7} className="p-4 border-t-2 border-primary/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h5 className="font-bold text-sm text-primary uppercase tracking-wider mb-2">Contexto de Entrada</h5>
                                <div className="text-xs space-y-1">
                                    <p><span className="text-text-secondary">Regime de Mercado:</span> <span className="font-semibold text-white">{trade.marketRegimeAtEntry}</span></p>
                                    <p><span className="text-text-secondary">Data de Entrada:</span> <span className="font-mono text-white">{trade.entryDatetime}</span></p>
                                    <p><span className="text-text-secondary">Preço de Entrada:</span> <span className="font-mono text-white">{formatCurrency(trade.entryPrice)}</span></p>
                                </div>
                            </div>
                             <div>
                                <h5 className="font-bold text-sm text-primary uppercase tracking-wider mb-2">Drivers Técnicos do Sinal</h5>
                                <div className="text-xs space-y-1 bg-surface/50 p-2 rounded-md border border-border/50 max-h-32 overflow-y-auto">
                                    {Object.entries(trade.technicalDrivers).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-text-secondary">{key}:</span>
                                            <span className="font-semibold text-white font-mono">{formatDriverValue(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};


const TradingJournalTable: React.FC<{ trades: CompletedTrade[]; title: string; t: any }> = ({ trades, title, t }) => {
    if (trades.length === 0) return null;

    return (
        <div className="mt-6">
            <h4 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                <JournalIcon className="h-5 w-5" />
                <span>{title}</span>
            </h4>
            <div className="max-h-96 overflow-y-auto pr-2 bg-background/30 rounded-lg border border-border/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-surface z-10">
                        <tr>
                            <th className="p-3 font-semibold text-text-secondary uppercase">{t.asset}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase">{t.outcome}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase">{t.closingReason}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.fees}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.profit}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.roi}</th>
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map(trade => (
                           <TradeJournalRow key={trade.id} trade={trade} t={t} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const PerformancePanel: React.FC = () => {
    const { completedTrades, isRecalculating, resetCompletedTrades } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    const { buyTrades, sellTrades } = useMemo(() => ({
        buyTrades: completedTrades.filter(t => t.signalType === 'COMPRA'),
        sellTrades: completedTrades.filter(t => t.signalType === 'VENDA'),
    }), [completedTrades]);

    const buyMetrics = useMemo(() => calculateMetrics(buyTrades), [buyTrades]);
    const sellMetrics = useMemo(() => calculateMetrics(sellTrades), [sellTrades]);
    const overallMetrics = useMemo(() => calculateMetrics(completedTrades), [completedTrades]);

    const handleReset = () => {
        if (window.confirm(t.resetPerformanceConfirm)) {
            resetCompletedTrades();
        }
    };
    
    return (
        <div className="relative">
             {isRecalculating && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-20">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {completedTrades.length > 0 && (
                 <div className="flex justify-end mb-4">
                     <button
                         onClick={handleReset}
                         className="flex items-center gap-2 text-sm font-semibold bg-danger/20 text-danger px-3 py-1.5 rounded-lg hover:bg-danger/30 transition-colors"
                         title={t.resetPerformanceHistory}
                     >
                         <TrashIcon className="h-4 w-4" />
                         <span>{t.resetPerformanceHistory}</span>
                     </button>
                 </div>
            )}
            
            {completedTrades.length === 0 ? (
                <div className="text-center py-10">
                    <TrophyIcon className="h-16 w-16 text-primary mx-auto opacity-30 mb-4" />
                    <p className="text-lg text-text-secondary">{t.noTradesYet}</p>
                </div>
            ) : (
                 <div className="space-y-10">
                    {/* Buy Performance */}
                    {buyTrades.length > 0 && (
                        <div className="bg-green-900/10 border border-green-500/20 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-green-300 mb-4">{t.buyPerformance}</h3>
                            <MetricsDisplay metrics={buyMetrics} t={t} />
                        </div>
                    )}

                    {/* Sell Performance */}
                    {sellTrades.length > 0 && (
                        <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-red-300 mb-4">{t.sellPerformance}</h3>
                             <MetricsDisplay metrics={sellMetrics} t={t} />
                        </div>
                    )}
                    
                    {/* Overall Performance */}
                    <div className="bg-surface/50 border border-border/50 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-primary mb-4">{t.overallPerformance}</h3>
                         <MetricsDisplay metrics={overallMetrics} t={t} />
                    </div>

                    {/* Trading Journals */}
                    <div>
                         <h3 className="text-2xl font-bold text-text mb-2 text-center">{t.tradingJournal}</h3>
                         <p className="text-sm text-text-secondary mb-6 text-center">{t.journalDescription}</p>
                         <div className="space-y-8">
                             <TradingJournalTable trades={buyTrades} title={t.buyTradesJournal} t={t} />
                             <TradingJournalTable trades={sellTrades} title={t.sellTradesJournal} t={t} />
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformancePanel;