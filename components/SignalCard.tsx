import React from 'react';
import { BacktestSignal } from '../types.ts';
import { formatCurrency, formatPercentage } from '../utils/formatters.ts';
import RoiDisplay from './RoiDisplay.tsx';
import InfoTooltip from './InfoTooltip.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';

interface SignalCardProps {
  signal: BacktestSignal;
}

const BuyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

const SellIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const TechnicalDriversDisplay: React.FC<{ drivers: { [key: string]: any } | undefined; t: any }> = ({ drivers, t }) => {
    if (!drivers || Object.keys(drivers).length === 0) return null;

    const formatKey = (key: string) => {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatValue = (value: any) => {
        if (typeof value === 'boolean') {
            return value ? '✅' : '❌';
        }
        if (typeof value === 'number') {
            return value.toFixed(2);
        }
        return String(value);
    };

    return (
        <div className="bg-background/30 p-4 rounded-lg border border-border/30">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">{t.technicalDriversTitle}</h4>
            <div className="space-y-1.5 text-sm">
                {Object.entries(drivers).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center gap-2">
                        <span className="text-text-secondary truncate">{formatKey(key)}:</span>
                        <span className="font-semibold text-white text-right bg-background/50 px-2 py-0.5 rounded">
                            {formatValue(value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
    const { language } = useLanguage();
    const t = translations[language];
    const isProfit = signal.profit > 0;
    const isBuySignal = signal.signalType === 'COMPRA';
  
    return (
    <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg flex flex-col h-full transition-all duration-300 hover:shadow-primary/20 hover:border-primary/50 hover:scale-[1.02] transform-gpu">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                 <div className={`flex items-center justify-center h-8 w-8 rounded-full ${isBuySignal ? 'bg-success/20' : 'bg-danger/20'}`}>
                    {isBuySignal ? <BuyIcon className="h-5 w-5 text-success" /> : <SellIcon className="h-5 w-5 text-danger" />}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-text">{signal.assetName}</h3>
                     <div className="flex items-center gap-2 -mt-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isBuySignal ? 'text-success' : 'text-danger'}`}>{signal.signalType}</span>
                        <span className="text-text-secondary text-xs">•</span>
                        <span className="text-xs text-text-secondary">{t.strategy}: {signal.strategy}</span>
                    </div>
                </div>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isProfit ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                {isProfit ? 'Lucrativo' : 'Prejuízo'}
            </span>
        </div>

        <div className="my-4 p-3 bg-background/30 rounded-lg border border-border/30 text-xs">
            <div className="flex justify-between">
                <span className="text-text-secondary">{t.entryDate}:</span>
                <span className="font-semibold text-text">{signal.entryDatetime}</span>
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-text-secondary">{t.exitDate}:</span>
                <span className="font-semibold text-text">{signal.exitDatetime}</span>
            </div>
        </div>
        
        <div className="space-y-4 mb-6">
            <TechnicalDriversDisplay drivers={signal.technicalDrivers} t={t} />
        </div>

        <div className="mt-auto bg-background/50 rounded-lg p-4 border border-border/50">
             <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 text-center">Resultado da Operação</h4>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center text-text-secondary">
                        <span>Investimento:</span>
                        <InfoTooltip text={t.tooltipInvestment} />
                    </div>
                    <span className="font-semibold text-text">{formatCurrency(signal.investment)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Valor Final:</span>
                    <span className={`font-semibold text-base ${isProfit ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(signal.finalValue)}</span>
                </div>
                 <hr className="border-border my-2"/>
                 <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Preço Inicial:</span>
                    <span className="font-semibold text-text">{formatCurrency(signal.pastPrice)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Preço Final:</span>
                    <span className="font-semibold text-text">{formatCurrency(signal.futurePrice)}</span>
                </div>
                 <hr className="border-border my-2"/>
                 <RoiDisplay profit={signal.profit} roiPercentage={signal.roiPercentage} />
             </div>
        </div>
    </div>
  );
};

export default SignalCard;
