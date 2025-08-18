
import React from 'react';
import { BacktestAnalysisResult } from '../types.ts';
import SignalCard from './SignalCard.tsx';
import BacktestHorizonSectionSkeleton from './skeletons/BacktestHorizonSectionSkeleton.tsx';


interface BacktestHorizonSectionProps {
    title: string;
    horizon: '24h' | '7d' | '30d';
    backtestData: BacktestAnalysisResult | null;
}

const BacktestHorizonSection: React.FC<BacktestHorizonSectionProps> = ({ title, horizon, backtestData }) => {
    if (!backtestData) {
        return <BacktestHorizonSectionSkeleton title={title} />;
    }

    const signals = backtestData[`signals${horizon}`];
    if (!signals || signals.length < 2) {
        return null; // or some error/empty state
    }

    return (
        <section>
            <h2 className="text-3xl font-bold text-text mb-6 pb-2 border-b-2 border-border">{title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SignalCard signal={signals[0]} />
                <SignalCard signal={signals[1]} />
            </div>
        </section>
    );
}

export default BacktestHorizonSection;