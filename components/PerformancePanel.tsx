

import React, { useMemo } from 'react';
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

const TradingJournalTable: React.FC<{ trades: CompletedTrade[]; t: any }> = ({ trades, t }) => {
    const outcomeConfig: { [key in CompletedTrade['outcome']]: { text: string; color: string } } = {
        Win: { text: t.win, color: 'text-success' },
        Loss: { text: t.loss, color: 'text-danger' },
        Breakeven: { text: t.breakeven, color: 'text-yellow-400' },
        Processing: { text: t.processing, color: 'text-blue-400' },
        Error: { text: t.error, color: 'text-gray-500' },
    };
    return (
        <div className="mt-6">
            <h4 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                <JournalIcon className="h-5 w-5" />
                <span>{t.tradingJournal}</span>
            </h4>
            <p className="text-sm text-text-secondary mb-4">{t.journalDescription}</p>
            <div className="max-h-96 overflow-y-auto pr-2 bg-background/30 rounded-lg border border-border/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-surface z-10">
                        <tr>
                            <th className="p-3 font-semibold text-text-secondary uppercase">{t.asset}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase">{t.outcome}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.fees}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.profit}</th>
                            <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.roi}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map(trade => (
                            <tr key={trade.id} className="border-t border-border/50 hover:bg-border/50">
                                <td className="p-3 font-semibold text-white">{trade.assetName} <span className={`text-xs ${trade.signalType === 'COMPRA' ? 'text-success' : 'text-danger'}`}>({trade.signalType})</span></td>
                                <td className={`p-3 font-bold ${outcomeConfig[trade.outcome].color}`}>{outcomeConfig[trade.outcome].text}</td>
                                <td className="p-3 font-mono text-right text-text-secondary">{formatCurrency(trade.feesUsd)}</td>
                                <td className={`p-3 font-semibold text-right ${trade.actualProfitUsd >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(trade.actualProfitUsd)}</td>
                                <td className={`p-3 font-semibold text-right ${trade.actualRoiPercentage >= 0 ? 'text-success' : 'text-danger'}`}>{formatPercentage(trade.actualRoiPercentage)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const PerformancePanel: React.FC = () => {
    const { completedTrades } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    const metrics = useMemo(() => calculateMetrics(completedTrades), [completedTrades]);
    
    if (completedTrades.length === 0) {
        return (
            <div className="text-center py-10">
                <TrophyIcon className="h-16 w-16 text-primary mx-auto opacity-30 mb-4" />
                <p className="text-lg text-text-secondary">{t.noTradesYet}</p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm text-text-secondary mb-6">{t.performancePanelDescription}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title={t.winRate} value={formatPercentage(metrics.winRate)} icon={<TrendingUpIcon />} colorClass={metrics.winRate >= 50 ? 'text-success' : 'text-danger'} />
                <MetricCard title={t.profitFactor} value={metrics.profitFactor?.toFixed(2) ?? '∞'} icon={<TrophyIcon />} colorClass={metrics.profitFactor && metrics.profitFactor >= 1 ? 'text-success' : 'text-danger'} />
                <MetricCard title={t.totalNetProfit} value={formatCurrency(metrics.totalNetProfit)} icon={<DollarSignIcon />} colorClass={metrics.totalNetProfit >= 0 ? 'text-success' : 'text-danger'} />
                <MetricCard title={t.avgRoi} value={formatPercentage(metrics.averageRoi)} icon={<PercentIcon />} colorClass={metrics.averageRoi >= 0 ? 'text-success' : 'text-danger'} />
            </div>

            <TradingJournalTable trades={completedTrades} t={t} />
        </div>
    );
};

export default PerformancePanel;