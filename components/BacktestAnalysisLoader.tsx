

import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';

// Import components directly, not lazy
import BacktestExplanationCard from './BacktestExplanationCard.tsx';
import BacktestHorizonSection from './BacktestHorizonSection.tsx';
import BacktestSummaryCard from './BacktestSummaryCard.tsx';
import EvolutionCycleCard from './EvolutionCycleCard.tsx';

// Import Skeletons
import BacktestHorizonSectionSkeleton from './skeletons/BacktestHorizonSectionSkeleton.tsx';
import BacktestSummaryCardSkeleton from './skeletons/BacktestSummaryCardSkeleton.tsx';
import EvolutionCycleCardSkeleton from './skeletons/EvolutionCycleCardSkeleton.tsx';

const BacktestAnalysisLoader: React.FC = () => {
    const { backtestData, isBacktestLoading, loadBacktestData } = useData();
    const { language } = useLanguage();
    const t = translations[language];
    
    useEffect(() => {
        if (!backtestData && !isBacktestLoading) {
            loadBacktestData();
        }
    }, [backtestData, isBacktestLoading, loadBacktestData]);
    
    if (isBacktestLoading || !backtestData) {
        return (
            <div className="space-y-12">
                <BacktestExplanationCard />
                <BacktestHorizonSectionSkeleton title={t.backtestResults24h} />
                <BacktestHorizonSectionSkeleton title={t.backtestResults7d} />
                <BacktestHorizonSectionSkeleton title={t.backtestResults30d} />
                <BacktestSummaryCardSkeleton />
                <EvolutionCycleCardSkeleton />
            </div>
        );
    }
    
    return (
        <div className="space-y-12">
            <BacktestExplanationCard />
            <BacktestHorizonSection title={t.backtestResults24h} backtestData={backtestData} horizon="24h" />
            <BacktestHorizonSection title={t.backtestResults7d} backtestData={backtestData} horizon="7d" />
            <BacktestHorizonSection title={t.backtestResults30d} backtestData={backtestData} horizon="30d" />
            <BacktestSummaryCard backtestData={backtestData} />
            <EvolutionCycleCard backtestData={backtestData} />
        </div>
    );
};

export default BacktestAnalysisLoader;