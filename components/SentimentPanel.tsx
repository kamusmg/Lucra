

import React from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { SentimentAnalysis, Narrative } from '../types';
import { ASSET_LOGOS as ALL_ASSET_LOGOS } from './MajorAssetSection.tsx';
import TrendingUpIcon from './icons/TrendingUpIcon';
import TrendingDownIcon from './icons/TrendingDownIcon';

// Add missing logos for sentiment panel specifically
const ASSET_LOGOS = {
    ...ALL_ASSET_LOGOS,
    DOGE: 'https://img.icons8.com/color/48/dogecoin.png',
    SHIB: 'https://img.icons8.com/color/48/shiba-inu-token.png',
    PEPE: 'https://i.imgur.com/80v1dY9.png', // Custom URL for Pepe
    WIF: 'https://i.imgur.com/ssS6a33.png' // Custom URL for Dogwifhat
};


const Shimmer: React.FC = () => (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/50 to-transparent"></div>
);

const SentimentCardSkeleton: React.FC = () => (
    <div className="relative bg-surface/50 border border-border/70 rounded-xl p-4 overflow-hidden space-y-3 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-border rounded-full"></div>
            <div>
                <div className="h-6 w-16 bg-border rounded-md"></div>
                <div className="h-4 w-24 bg-border rounded-md mt-1"></div>
            </div>
        </div>
        <div className="h-3 w-full bg-border rounded-full my-3"></div>
        <div className="space-y-3">
            <div className="h-4 w-1/3 bg-border rounded-md"></div>
            <div className="h-3 w-5/6 bg-border rounded-md"></div>
            <div className="h-4 w-1/3 bg-border rounded-md"></div>
            <div className="h-3 w-4/6 bg-border rounded-md"></div>
        </div>
        <div className="h-12 w-full bg-border rounded-lg mt-3"></div>
        <Shimmer />
    </div>
);

const SentimentMeter: React.FC<{ score: number; t: any }> = ({ score, t }) => {
    const getColorClass = (s: number) => {
        if (s <= 19) return 'bg-red-600';       // Muito Baixista
        if (s <= 39) return 'bg-orange-500';    // Baixista
        if (s <= 59) return 'bg-yellow-400';    // Neutro
        if (s <= 79) return 'bg-green-400';     // Altista
        return 'bg-emerald-500';               // Muito Altista
    };

    const colorClass = getColorClass(score);

    return (
        <div className="w-full my-3" aria-label={`${t.sentimentScore}: ${score}`}>
            <div className="h-3 w-full bg-border rounded-full">
                <div
                    className={`h-3 rounded-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${score}%` }}
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
        </div>
    );
};

const ImpactIcon: React.FC<{ impact: 'positive' | 'negative' | 'neutral' }> = ({ impact }) => {
    if (impact === 'positive') return <TrendingUpIcon className="h-4 w-4 text-success flex-shrink-0" />;
    if (impact === 'negative') return <TrendingDownIcon className="h-4 w-4 text-danger flex-shrink-0" />;
    return <span className="h-4 w-4 text-text-secondary font-bold flex-shrink-0 text-center">-</span>;
};


const SentimentCard: React.FC<{ analysis: SentimentAnalysis }> = ({ analysis }) => {
    const { language } = useLanguage();
    const t = translations[language];
    
    const sentimentColorMap: { [key: string]: string } = {
        'Muito Baixista': 'text-red-500', 'Very Bearish': 'text-red-500',
        'Baixista': 'text-orange-400', 'Bearish': 'text-orange-400',
        'Neutro': 'text-yellow-400', 'Neutral': 'text-yellow-400',
        'Altista': 'text-green-400', 'Bullish': 'text-green-400',
        'Muito Altista': 'text-emerald-400', 'Very Bullish': 'text-emerald-400',
    };
    
    return (
        <div className="bg-surface/50 border border-border/70 rounded-xl p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
                <img src={ASSET_LOGOS[analysis.assetTicker] || ''} alt={`${analysis.assetTicker} logo`} className="h-10 w-10" />
                <div>
                    <h4 className="font-bold text-xl text-white">{analysis.assetTicker}</h4>
                    <p className={`font-semibold text-sm ${sentimentColorMap[analysis.sentimentLabel] || 'text-text-secondary'}`}>
                        {analysis.sentimentLabel}
                    </p>
                </div>
            </div>
            
            <SentimentMeter score={analysis.sentimentScore} t={t} />
            
            <div className="space-y-3 my-3">
                 <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider">{t.dominantNarratives}</h5>
                 {analysis.dominantNarratives.map(narrative => (
                     <div key={narrative.name} className="bg-background/50 p-2 rounded-md border-l-2 border-primary/50">
                        <div className="flex items-center gap-2">
                            <ImpactIcon impact={narrative.impact} />
                            <span className="font-semibold text-sm text-white">{narrative.name}</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 pl-6">{narrative.explanation}</p>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-3 border-t border-border/50">
                <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">{t.intelligenceBriefing}</h5>
                 <p className="text-sm text-text-secondary leading-relaxed">{analysis.intelligenceBriefing}</p>
            </div>
        </div>
    );
};

const SentimentPanel: React.FC = () => {
    const { sentimentData, isInitialLoading } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    if (isInitialLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SentimentCardSkeleton key={i} />)}
            </div>
        );
    }
    
    if (!sentimentData) {
        return (
            <div className="text-center py-8 text-text-secondary">
                <p>{t.noSentimentData}</p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm text-text-secondary mb-6">{t.sentimentAnalysisDescription}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sentimentData.map(analysis => (
                    <SentimentCard key={analysis.assetTicker} analysis={analysis} />
                ))}
            </div>
        </div>
    );
};

export default SentimentPanel;