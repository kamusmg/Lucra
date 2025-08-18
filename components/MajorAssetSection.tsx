



import React, { useState, useMemo } from 'react';
import { InstitutionalAssetAnalysis } from '../types.ts';
import { formatCurrency, formatLargeNumber, formatPercentage } from '../utils/formatters.ts';
import { useData } from '../contexts/DataContext.tsx';
import MajorAssetSectionSkeleton from './skeletons/MajorAssetSectionSkeleton.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';
import ChevronDownIcon from './ChevronDownIcon.tsx';
import VisualIndicator from './VisualIndicator.tsx';

// --- ICONS ---
const ChartBarIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}> <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /> </svg>);
const BullIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
const VolatilityIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const TrendUpIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>);
const TrendDownIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const TrendNeutralIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" /></svg>);

// --- DATA & CONFIG ---
export const ASSET_LOGOS: { [key: string]: string } = {
    BTC: 'https://img.icons8.com/color/48/bitcoin.png',
    ETH: 'https://img.icons8.com/color/48/ethereum.png',
    BNB: 'https://img.icons8.com/color/48/binance-coin.png',
    SOL: 'https://img.icons8.com/fluency/48/solana.png',
    XRP: 'https://img.icons8.com/color/48/xrp.png',
    ADA: 'https://img.icons8.com/color/48/cardano.png',
    AVAX: 'https://img.icons8.com/color/48/avalanche.png',
    LTC: 'https://img.icons8.com/color/48/litecoin.png',
    MATIC: 'https://img.icons8.com/color/48/polygon.png',
    DOT: 'https://img.icons8.com/color/48/polkadot.png',
    DOGE: 'https://img.icons8.com/color/48/dogecoin.png',
    SHIB: 'https://img.icons8.com/color/48/shiba-inu-token.png',
    PEPE: 'https://i.imgur.com/80v1dY9.png', // Custom URL for Pepe
    WIF: 'https://i.imgur.com/ssS6a33.png' // Custom URL for Dogwifhat
};

const trendConfig = {
    bullish: { color: 'text-success', label: 'Bullish', Icon: TrendUpIcon },
    bearish: { color: 'text-danger', label: 'Bearish', Icon: TrendDownIcon },
    neutral: { color: 'text-blue-400', label: 'Neutral', Icon: TrendNeutralIcon },
};

const gradeConfig: { [key: string]: string } = {
    'A': 'bg-green-500 text-white',
    'B': 'bg-blue-500 text-white',
    'C': 'bg-yellow-500 text-black',
    'D': 'bg-orange-500 text-white',
    'F': 'bg-red-700 text-white',
};

// --- SUB-COMPONENTS ---

const FundamentalAnalysisCollapse: React.FC<{
    asset: InstitutionalAssetAnalysis;
    t: any;
}> = ({ asset, t }) => {
    const { grade, fundamentalAnalysis } = asset;

    if (!grade || !fundamentalAnalysis) {
        return null;
    }

    const gradeClasses = gradeConfig[grade] || 'bg-gray-500';

    return (
        <details className="group bg-background/30 rounded-lg border border-border/30 transition-all duration-300 open:bg-background/50 open:border-primary/30 text-xs">
            <summary className="cursor-pointer list-none flex items-center justify-between p-2 font-semibold transition-colors">
                <span className="font-bold text-text-secondary group-hover:text-white uppercase tracking-wider">{t.fundamentalAnalysis}</span>
                <ChevronDownIcon className="h-4 w-4 text-text-secondary transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="border-t border-border/30 p-3 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="text-text-secondary">{t.technology}:</div>
                    <VisualIndicator percentage={fundamentalAnalysis.technologyScore} />
                    
                    <div className="text-text-secondary">{t.team}:</div>
                    <VisualIndicator percentage={fundamentalAnalysis.teamScore} />
                    
                    <div className="text-text-secondary">{t.tokenomics}:</div>
                    <VisualIndicator percentage={fundamentalAnalysis.tokenomicsScore} />
                    
                    <div className="text-text-secondary">{t.devActivity}:</div>
                    <VisualIndicator percentage={fundamentalAnalysis.developerActivityScore} />
                </div>

                <div>
                    <h6 className="font-bold text-text mb-1">{t.analysisSummary}:</h6>
                    <p className="text-text-secondary leading-relaxed">{fundamentalAnalysis.summary}</p>
                </div>
            </div>
        </details>
    );
};

const OpportunityIndicator: React.FC<{ asset: InstitutionalAssetAnalysis }> = ({ asset }) => {
    const { livePrice, entryPoint, trend } = asset;
    const threshold = 0.05; // 5% proximity to entry point
    let opportunity: 'buy' | 'sell' | null = null;
    let opportunityText = '';

    if (trend === 'bullish' && livePrice <= entryPoint * (1 + threshold) && livePrice > entryPoint * (1 - threshold * 2) ) { // Avoid showing if price dropped way below
        opportunity = 'buy';
        opportunityText = livePrice <= entryPoint ? 'Ponto de entrada atingido' : 'Próximo à entrada';
    } else if (trend === 'bearish' && livePrice >= entryPoint * (1 - threshold) && livePrice < entryPoint * (1 + threshold * 2)) { // Avoid showing if price pumped way above
        opportunity = 'sell';
        opportunityText = livePrice >= entryPoint ? 'Ponto de entrada atingido' : 'Próximo à entrada';
    }

    if (!opportunity) return null;

    return (
        <div className={`mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold ${opportunity === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
            <span className="relative flex h-2 w-2">
                <span className={`animate-subtle-pulse absolute inline-flex h-full w-full rounded-full ${opportunity === 'buy' ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${opportunity === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span>{opportunityText}</span>
        </div>
    );
};

const FilterChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
            active ? 'bg-primary text-white shadow-md' : 'bg-surface hover:bg-border/70 text-text-secondary'
        }`}
    >
        {label}
    </button>
);

const PeriodTab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-base font-bold rounded-t-lg border-b-2 transition-colors duration-200 ${
            active ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-white hover:border-border'
        }`}
    >
        {label}
    </button>
);

const AssetCard: React.FC<{ asset: InstitutionalAssetAnalysis; period: keyof InstitutionalAssetAnalysis['priceChange'] }> = ({ asset, period }) => {
    const { language } = useLanguage();
    const t = translations[language];
    const config = trendConfig[asset.trend];
    const priceChange = asset.priceChange[period];
    const changeColor = priceChange >= 0 ? 'text-success' : 'text-danger';

    return (
        <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-5 shadow-lg flex flex-col h-full transition-all duration-300 hover:shadow-primary/20 hover:border-primary/50 hover:scale-[1.02] transform-gpu">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <img src={ASSET_LOGOS[asset.ticker] || ''} alt={`${asset.name} logo`} className="h-10 w-10" />
                    <div>
                        <h4 className="text-xl font-bold text-white">{asset.ticker}</h4>
                        <p className="text-sm text-text-secondary">{asset.name}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${gradeConfig[asset.grade] || 'bg-gray-500'}`}>
                        {t.grade}: {asset.grade}
                    </span>
                    <div className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${config.color.replace('text-','bg-')}/20 ${config.color}`}>
                        <config.Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                    </div>
                </div>
            </div>
            
            <div className="text-center mb-4">
                <p className="text-3xl font-bold text-white">{formatCurrency(asset.livePrice)}</p>
                <p className={`text-base font-semibold ${changeColor} mt-1`}>{formatPercentage(priceChange, true)}</p>
                <OpportunityIndicator asset={asset} />
            </div>

            <div className="my-4">
                <FundamentalAnalysisCollapse asset={asset} t={t} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="bg-background/40 p-2 rounded-md">
                    <p className="text-xs text-text-secondary">Market Cap</p>
                    <p className="font-semibold text-white">{formatLargeNumber(asset.marketCap)}</p>
                </div>
                <div className="bg-background/40 p-2 rounded-md">
                    <p className="text-xs text-text-secondary">Volume (24h)</p>
                    <p className="font-semibold text-white">{formatLargeNumber(asset.volume24h)}</p>
                </div>
            </div>

            <div className="mt-auto bg-background/50 rounded-lg p-4 border border-border/50">
                 <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-baseline gap-2">
                        <span className="text-text-secondary uppercase font-bold tracking-wider text-xs whitespace-nowrap">ENTRADA</span>
                        <span className="text-white font-semibold text-sm text-right">{asset.entryPoint ? formatCurrency(asset.entryPoint) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                        <span className="text-green-400 uppercase font-bold tracking-wider text-xs whitespace-nowrap">ALVO</span>
                        <span className="text-white font-semibold text-sm text-right">{asset.target ? formatCurrency(asset.target) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                        <span className="text-red-400 uppercase font-bold tracking-wider text-xs whitespace-nowrap">STOP</span>
                        <span className="text-white font-semibold text-sm text-right">{asset.stopLoss ? formatCurrency(asset.stopLoss) : 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const MajorAssetSection: React.FC = () => {
    const { presentDayData, isInitialLoading } = useData();
    const [activeFilter, setActiveFilter] = useState('all');
    const [activePeriod, setActivePeriod] = useState<keyof InstitutionalAssetAnalysis['priceChange']>('24h');

    const assets = presentDayData?.institutionalAssets || [];

    const displayAssets = useMemo(() => {
        let filteredAssets: InstitutionalAssetAnalysis[] = assets ? [...assets] : [];
        
        // Apply filter
        if (activeFilter === 'bull') {
            filteredAssets = filteredAssets.filter(a => a.trend === 'bullish');
        } else if (activeFilter === 'volatility') {
            filteredAssets = filteredAssets.filter(a => a.isHighVolatility);
        }

        // Apply sort
        if (activeFilter === 'volume') {
            filteredAssets.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
        } else if (activeFilter === 'performance') {
            filteredAssets.sort((a, b) => (b.priceChange[activePeriod] || 0) - (a.priceChange[activePeriod] || 0));
        } else {
            // Default sort by market cap
            filteredAssets.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
        }

        return filteredAssets;
    }, [assets, activeFilter, activePeriod]);

    if (isInitialLoading) {
        return <MajorAssetSectionSkeleton />;
    }

    if (!assets || assets.length === 0) {
        return null;
    }

    const filters = [
        { key: 'all', label: 'Todos' },
        { key: 'bull', label: 'Bull Market' },
        { key: 'volatility', label: 'Alta Volatilidade' },
        { key: 'volume', label: 'Volume 24h' },
        { key: 'performance', label: 'Performance' },
    ];
    
    const periods: { key: keyof InstitutionalAssetAnalysis['priceChange']; label: string }[] = [
        { key: '24h', label: '24 horas' },
        { key: '7d', label: '7 dias' },
        { key: '30d', label: '30 dias' },
        { key: '1y', label: '1 ano' },
    ];

    return (
        <div className="bg-gradient-to-br from-indigo-900/40 to-transparent border border-indigo-500/30 rounded-xl p-6 shadow-lg shadow-indigo-500/10">
            <div className="flex items-center mb-6">
                <div className="bg-secondary/10 p-2 rounded-full">
                    <ChartBarIcon />
                </div>
                <h3 className="text-2xl font-bold text-text ml-4">Análise dos Ativos Principais</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {filters.map(f => (
                    <FilterChip key={f.key} label={f.label} active={activeFilter === f.key} onClick={() => setActiveFilter(f.key)} />
                ))}
            </div>

            <div className="border-b border-border mb-6">
                <div className="flex items-center gap-4">
                    {periods.map(p => (
                        <PeriodTab key={p.key} label={p.label} active={activePeriod === p.key} onClick={() => setActivePeriod(p.key)} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {displayAssets.map((asset) => (
                    <AssetCard 
                        key={asset.ticker} 
                        asset={asset}
                        period={activePeriod}
                    />
                ))}
            </div>
             {displayAssets.length === 0 && (
                <div className="col-span-full text-center py-12 bg-surface/30 rounded-lg">
                    <p className="text-lg text-text-secondary">Nenhum ativo corresponde aos filtros selecionados.</p>
                </div>
            )}
        </div>
    );
};

export default MajorAssetSection;