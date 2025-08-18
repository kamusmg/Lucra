import React from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { PresentDayAssetSignal } from '../types.ts';
import HistoryIcon from './HistoryIcon.tsx';
import { formatCurrency, formatPercentage } from '../utils/formatters.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';
import CollapsibleSection from './CollapsibleSection.tsx';

const SignalHistoryItem: React.FC<{ signal: PresentDayAssetSignal }> = ({ signal }) => {
    const { language } = useLanguage();
    const t = translations[language];
    const isBuy = signal.signalType === 'COMPRA';
    const profitColor = signal.profitProjectionUsd >= 0 ? 'text-success' : 'text-danger';

    return (
        <div className="bg-background/50 p-3 rounded-lg border border-border/50 text-xs">
            <div className="flex justify-between items-center">
                <span className="font-bold text-white truncate pr-2">{signal.assetName}</span>
                <span className={`font-semibold flex-shrink-0 ${isBuy ? 'text-success' : 'text-danger'}`}>{signal.signalType}</span>
            </div>
            <div className="flex justify-between items-center mt-1 text-text-secondary">
                <span>{t.profitProjection}:</span>
                <span className={`font-bold ${profitColor}`}>{formatCurrency(signal.profitProjectionUsd)}</span>
            </div>
        </div>
    );
};


const SignalHistory: React.FC = () => {
    const { signalHistory } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    if (!signalHistory || signalHistory.length === 0) {
        return null;
    }

    return (
        <CollapsibleSection
            title={t.signalHistoryTitle}
            icon={<HistoryIcon className="h-8 w-8 text-primary" />}
        >
            <p className="text-sm text-text-secondary mb-4">
                {t.signalHistoryDescription}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
                {signalHistory.map((signal, index) => (
                    <SignalHistoryItem key={`${signal.assetName}-${index}`} signal={signal} />
                ))}
            </div>
        </CollapsibleSection>
    );
};

export default SignalHistory;