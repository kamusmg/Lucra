

import React from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { ActiveTrade, OrderStatus } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import ActivityIcon from './icons/ActivityIcon';
import InfoTooltip from './InfoTooltip';
import ClockIcon from './ClockIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import CautionIcon from './CautionIcon';

const StatusIndicator: React.FC<{ status: OrderStatus; details: string; t: any }> = ({ status, details, t }) => {
    const config: { [key in OrderStatus]: { icon: React.ReactNode; color: string; label: string; tooltip: string } } = {
        Pending: {
            icon: <ClockIcon className="h-4 w-4" />,
            color: 'text-yellow-400',
            label: t.statusPending,
            tooltip: t.tooltipPending,
        },
        Filled: {
            icon: <CheckCircleIcon className="h-4 w-4" />,
            color: 'text-success',
            label: t.statusFilled,
            tooltip: t.tooltipFilled,
        },
        Error: {
            icon: <CautionIcon className="h-4 w-4" />,
            color: 'text-danger',
            label: t.statusError,
            tooltip: t.tooltipError,
        },
    };
    
    const currentConfig = config[status];

    return (
        <InfoTooltip text={details || currentConfig.tooltip}>
             <div className={`flex items-center gap-1.5 ${currentConfig.color}`}>
                {currentConfig.icon}
                <span className="font-semibold">{currentConfig.label}</span>
            </div>
        </InfoTooltip>
    );
};


const LivePositionsPanel: React.FC = () => {
    const { activeTrades } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    const sortedTrades = [...activeTrades].sort((a, b) => new Date(b.entryDatetime).getTime() - new Date(a.entryDatetime).getTime());

    return (
        <div>
            <p className="text-sm text-text-secondary mb-6">{t.livePositionsDescription}</p>
            
            {sortedTrades.length === 0 ? (
                <div className="text-center py-10">
                    <ActivityIcon className="h-16 w-16 text-primary mx-auto opacity-30 mb-4" />
                    <p className="text-lg text-text-secondary">{t.noActiveTrades}</p>
                </div>
            ) : (
                <div className="max-h-[600px] overflow-y-auto pr-2 bg-background/30 rounded-lg border border-border/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 bg-surface z-10">
                            <tr>
                                <th className="p-3 font-semibold text-text-secondary uppercase">{t.asset}</th>
                                <th className="p-3 font-semibold text-text-secondary uppercase">{t.orderStatus}</th>
                                <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.entryPrice}</th>
                                <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.currentPrice}</th>
                                <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.target}</th>
                                <th className="p-3 font-semibold text-text-secondary uppercase text-right">{t.stopLoss}</th>
                                <th className="p-3 font-semibold text-text-secondary uppercase text-right">
                                    <InfoTooltip text={t.tooltipPnlNet}>
                                        <span>{t.pnlNet} (USD)</span>
                                    </InfoTooltip>
                                </th>
                                <th className="p-3 font-semibold text-text-secondary uppercase text-right">
                                     <InfoTooltip text={t.tooltipPnlNet}>
                                        <span>{t.pnlNet} (%)</span>
                                    </InfoTooltip>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTrades.map(trade => {
                                const pnlColor = trade.livePnlUsd > 0.001 ? 'text-success' : trade.livePnlUsd < -0.001 ? 'text-danger' : 'text-text-secondary';
                                const isBuy = trade.signalType === 'COMPRA';
                                return (
                                    <tr key={trade.id} className="border-t border-border/50 hover:bg-border/50">
                                        <td className="p-3 font-semibold text-white">
                                            {trade.assetName}
                                            <span className={`ml-2 text-xs font-bold ${isBuy ? 'text-success' : 'text-danger'}`}>
                                                ({isBuy ? 'LONG' : 'SHORT'})
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <StatusIndicator status={trade.orderStatus} details={trade.executionDetails} t={t} />
                                        </td>
                                        <td className="p-3 font-mono text-right text-text-secondary">{formatCurrency(trade.entryPrice)}</td>
                                        <td className="p-3 font-mono text-right text-white font-semibold">{formatCurrency(trade.currentPrice)}</td>
                                        <td className="p-3 font-mono text-right text-green-400">{trade.target}</td>
                                        <td className="p-3 font-mono text-right text-red-400">{trade.stopLoss}</td>
                                        <td className={`p-3 font-mono text-right font-bold ${pnlColor}`}>{formatCurrency(trade.livePnlUsd)}</td>
                                        <td className={`p-3 font-mono text-right font-bold ${pnlColor}`}>{formatPercentage(trade.livePnlPercentage, true)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LivePositionsPanel;