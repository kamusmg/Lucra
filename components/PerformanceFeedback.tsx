import React from 'react';
import BrainIcon from './BrainIcon.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';

interface PerformanceFeedbackProps {
    feedbackText: string;
}

const PerformanceFeedback: React.FC<PerformanceFeedbackProps> = ({ feedbackText }) => {
    const { language } = useLanguage();
    const t = translations[language];

    if (!feedbackText) return null;

    return (
        <div className="bg-secondary/10 border-l-4 border-secondary p-4 rounded-r-lg mb-8">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                    <BrainIcon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                    <h4 className="font-bold text-secondary">Briefing de Performance para a IA</h4>
                    <p className="text-sm text-text-secondary mt-1 font-mono">{feedbackText}</p>
                </div>
            </div>
        </div>
    );
};

export default PerformanceFeedback;
