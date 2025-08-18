

import React from 'react';
import TimeAstronautIcon from './TimeAstronautIcon.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';

const BacktestExplanationCard: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="bg-surface/50 border border-border/50 rounded-xl p-6 mb-12 flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-shrink-0">
                <TimeAstronautIcon className="h-20 w-20 text-primary" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-primary mb-2">{t.backtestExplanationTitle}</h3>
                <p className="text-text-secondary leading-relaxed">
                    {t.backtestExplanationContent}
                </p>
            </div>
        </div>
    );
};

export default BacktestExplanationCard;