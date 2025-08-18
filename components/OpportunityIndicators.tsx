import React from 'react';
import { useData } from '../contexts/DataContext';
import { MemeCoinSignal } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Shimmer: React.FC = () => (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/50 to-transparent"></div>
);

const MemeCoinCardSkeleton: React.FC = () => (
    <div className="relative bg-surface/50 border border-border/70 rounded-xl p-4 overflow-hidden space-y-3 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="h-6 w-24 bg-border rounded-md"></div>
            <div className="h-5 w-16 bg-border rounded-full"></div>
        </div>
        <div className="h-4 w-5/6 bg-border rounded-md"></div>
        <div className="flex justify-between items-center pt-2">
            <div className="h-8 w-20 bg-border rounded-md"></div>
            <div className="h-8 w-20 bg-border rounded-md"></div>
        </div>
        <Shimmer />
    </div>
);

const MemeCoinCard: React.FC<{ signal: MemeCoinSignal }> = ({ signal }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const signalConfig = {
        'BUY': {
            textColor: 'text-success',
            bgColor: 'bg-green-500/10',
            label: t.buy
        },
        'HOLD': {
            textColor: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            label: t.hold
        }
    };

    const ratingConfig = {
        'High': 'text-yellow-400',
        'Very High': 'text-orange-400',
        'Extreme': 'text-red-500'
    };

    const currentSignalConfig = signalConfig[signal.signalType];

    return (
        <div className={`bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-4 transition-all duration-300 hover:shadow-primary/20 hover:border-primary/50`}>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h4 className="font-bold text-lg text-white">{signal.symbol}</h4>
                    <p className="text-xs text-text-secondary">{signal.name}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${currentSignalConfig.bgColor} ${currentSignalConfig.textColor}`}>
                    {currentSignalConfig.label}
                </span>
            </div>
            <div className="my-3 p-3 bg-background/50 rounded-md border border-border/50">
                <p className="text-sm font-semibold text-text-secondary leading-snug italic">"{signal.shortThesis}"</p>
            </div>
            <div className="flex justify-between items-center text-center">
                <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{t.potential}</p>
                    <p className={`font-bold text-sm mt-1 ${ratingConfig[signal.potential]}`}>{signal.potential}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{t.risk}</p>
                    <p className={`font-bold text-sm mt-1 ${ratingConfig[signal.risk]}`}>{signal.risk}</p>
                </div>
            </div>
        </div>
    );
};


const MemeCoinWatchlist: React.FC = () => {
    const { memeCoinSignals, isInitialLoading } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    if (isInitialLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <MemeCoinCardSkeleton key={i} />)}
            </div>
        )
    }

    if (!memeCoinSignals || memeCoinSignals.length === 0) {
        return (
            <div className="text-center py-8 text-text-secondary">
                <p>Nenhuma oportunidade de meme coin encontrada no momento.</p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm text-text-secondary mb-4">
                {t.memeCoinWatchlistDescription}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {memeCoinSignals.map(signal => (
                    <MemeCoinCard key={signal.symbol} signal={signal} />
                ))}
            </div>
        </div>
    );
};

export default MemeCoinWatchlist;
