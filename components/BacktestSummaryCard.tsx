

import React, { useMemo } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters.ts';
import { BacktestSignal, BacktestAnalysisResult } from '../types.ts';
import BacktestSummaryCardSkeleton from './skeletons/BacktestSummaryCardSkeleton.tsx';

// Icons
const BuyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.625m3.75.625l-6.25 3.75" />
    </svg>
);

const SellIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
    </svg>
);


interface Summary {
  totalInvestment: number;
  totalFinalValue: number;
  totalProfit: number;
  totalRoiPercentage: number;
}

interface SummaryBlockProps {
    title: string;
    summary: Summary;
    type: 'buy' | 'sell';
}

const SummaryBlock: React.FC<SummaryBlockProps> = ({ title, summary, type }) => {
    const isProfit = summary.totalProfit >= 0;
    const config = {
        buy: {
            icon: <BuyIcon className="h-8 w-8 text-success" />,
            bgColor: 'bg-green-600/10',
            borderColor: 'border-green-500/30'
        },
        sell: {
            icon: <SellIcon className="h-8 w-8 text-danger" />,
            bgColor: 'bg-red-600/10',
            borderColor: 'border-red-500/30'
        }
    };
    const currentConfig = config[type];

    if (summary.totalInvestment === 0) {
        return (
             <div className={`p-6 rounded-lg ${currentConfig.bgColor} border ${currentConfig.borderColor}`}>
                 <div className="flex items-center mb-4">
                    {currentConfig.icon}
                    <h4 className="text-xl font-bold text-text ml-3">{title}</h4>
                </div>
                <div className="text-center text-text-secondary py-8">
                    Nenhuma operação deste tipo no backtest.
                </div>
             </div>
        )
    }

    return (
        <div className={`p-6 rounded-lg ${currentConfig.bgColor} border ${currentConfig.borderColor}`}>
             <div className="flex items-center mb-4">
                {currentConfig.icon}
                <h4 className="text-xl font-bold text-text ml-3">{title}</h4>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Investimento Total:</span>
                    <span className="font-semibold text-text">{formatCurrency(summary.totalInvestment)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Valor Final:</span>
                    <span className={`font-semibold text-base ${isProfit ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(summary.totalFinalValue)}</span>
                </div>
                <hr className="border-border/50 my-2"/>
                 <div className="text-center pt-2">
                    <p className="text-xs text-text-secondary">Resultado Líquido</p>
                    <p className={`text-3xl font-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(summary.totalProfit)}
                    </p>
                    <p className={`text-lg font-semibold ${isProfit ? 'text-success' : 'text-danger'}`}>
                        ({formatPercentage(summary.totalRoiPercentage)})
                    </p>
                </div>
            </div>
        </div>
    )
}

interface BacktestSummaryCardProps {
    backtestData: BacktestAnalysisResult | null;
}

const BacktestSummaryCard: React.FC<BacktestSummaryCardProps> = ({ backtestData }) => {
    const backtestSummaryResult = useMemo(() => {
        const defaultSummary = { totalInvestment: 0, totalFinalValue: 0, totalProfit: 0, totalRoiPercentage: 0 };
        if (!backtestData) {
          return { buySummary: defaultSummary, sellSummary: defaultSummary };
        }
    
        const allBacktestSignals = [
          ...backtestData.signals24h,
          ...backtestData.signals7d,
          ...backtestData.signals30d,
        ];
        
        const buySignals = allBacktestSignals.filter(s => s.signalType === 'COMPRA');
        const sellSignals = allBacktestSignals.filter(s => s.signalType === 'VENDA');
    
        const calculateSummary = (signals: BacktestSignal[]) => {
            if(signals.length === 0) return defaultSummary;
            const totalInvestment = signals.reduce((acc, signal) => acc + signal.investment, 0);
            const totalFinalValue = signals.reduce((acc, signal) => acc + signal.finalValue, 0);
            const totalProfit = totalFinalValue - totalInvestment;
            const totalRoiPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
            return { totalInvestment, totalFinalValue, totalProfit, totalRoiPercentage };
        };
    
        return { 
            buySummary: calculateSummary(buySignals),
            sellSummary: calculateSummary(sellSignals),
         };
    }, [backtestData]);

    if (!backtestData) {
        return <BacktestSummaryCardSkeleton />;
    }

    return (
        <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-text mb-6 text-center">Resultados Líquidos do Backtest</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummaryBlock title="Operações de Compra (Long)" summary={backtestSummaryResult.buySummary} type="buy" />
                <SummaryBlock title="Operações de Venda (Short)" summary={backtestSummaryResult.sellSummary} type="sell" />
            </div>
        </div>
    );
};

export default BacktestSummaryCard;