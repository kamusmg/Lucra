
import React, { useState, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { SignalBlock } from './PresentDaySignalCard';
import SignalBlockSkeleton from './skeletons/SignalBlockSkeleton';
import XIcon from './icons/XIcon';

const Watchlist: React.FC = () => {
    const { 
        watchlist, 
        addToWatchlist, 
        removeFromWatchlist, 
        analyzeWatchlistAsset,
        watchlistAnalysisResult,
        isWatchlistLoading,
        watchlistError 
    } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    const [newAsset, setNewAsset] = useState('');
    const [analyzedAsset, setAnalyzedAsset] = useState<string | null>(null);

    const handleAddAsset = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAsset.trim()) {
            addToWatchlist(newAsset.trim());
            setNewAsset('');
        }
    };

    const handleAnalyze = useCallback(async (asset: string) => {
        setAnalyzedAsset(asset);
        await analyzeWatchlistAsset(asset);
    }, [analyzeWatchlistAsset]);

    return (
        <div>
            <p className="text-sm text-text-secondary mb-4">{t.watchlistDescription}</p>

            <form onSubmit={handleAddAsset} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value.toUpperCase())}
                    placeholder={t.assetPlaceholderWatchlist}
                    className="flex-grow bg-background/50 border border-border rounded-md px-3 py-2 text-white placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <button
                    type="submit"
                    className="bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 transition-all"
                >
                    {t.addAsset}
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-surface/50 p-3 rounded-lg border border-border/50 h-full">
                        {watchlist.length > 0 ? (
                            <ul className="space-y-2">
                                {watchlist.map(asset => (
                                    <li key={asset} className="flex items-center justify-between group">
                                        <button 
                                            onClick={() => handleAnalyze(asset)}
                                            className={`w-full text-left px-3 py-2 rounded-md font-semibold transition-colors ${
                                                analyzedAsset === asset ? 'bg-primary/20 text-primary' : 'bg-background/50 hover:bg-border text-text'
                                            }`}
                                        >
                                            {asset}
                                        </button>
                                        <button 
                                            onClick={() => removeFromWatchlist(asset)}
                                            title={t.removeAssetTitle}
                                            className="ml-2 p-1 text-text-secondary hover:text-danger opacity-50 group-hover:opacity-100 transition-opacity"
                                        >
                                            <XIcon className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-text-secondary text-sm py-4">{t.addAsset}</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    {isWatchlistLoading && (
                        <div>
                            <p className="text-center text-primary mb-2 animate-pulse">{t.analyzingAsset.replace('{asset}', analyzedAsset || '')}</p>
                            <SignalBlockSkeleton />
                        </div>
                    )}
                    {watchlistError && !isWatchlistLoading && (
                        <div className="bg-danger/20 text-danger p-4 rounded-lg border border-danger/50 text-center h-full flex items-center justify-center">
                           <p>{watchlistError}</p>
                        </div>
                    )}
                    {watchlistAnalysisResult && !isWatchlistLoading && (
                         <SignalBlock 
                            signal={watchlistAnalysisResult} 
                            showProminentProfit={true} 
                        />
                    )}
                    {!watchlistAnalysisResult && !isWatchlistLoading && !watchlistError && (
                         <div className="bg-surface/30 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-border/50 h-full min-h-[300px]">
                            <p className="text-text-secondary text-center font-semibold">{t.selectAssetToAnalyze}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Watchlist;
