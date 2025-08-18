

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';
import ChevronDownIcon from './ChevronDownIcon.tsx';

interface ChecklistCollapseProps {
    approved: boolean;
    score: number | undefined;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

const ChecklistCollapse: React.FC<ChecklistCollapseProps> = ({ approved, score, defaultOpen = false, children }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const approvalClass = approved ? "bg-emerald-700 text-white" : "bg-rose-800 text-white";
    const approvalText = approved ? t.checklistApproved : t.checklistRejected;
    const scoreText = score?.toFixed?.(1) ?? "";

    return (
        <details className="group bg-background/30 rounded-lg border border-border/30 transition-all duration-300 open:bg-background/50 open:border-primary/30 text-xs" open={defaultOpen}>
            <summary className="cursor-pointer list-none flex items-center justify-between p-2 font-semibold transition-colors">
                <span className="font-bold text-text-secondary group-hover:text-white uppercase tracking-wider">{t.checklistTitle}</span>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${approvalClass}`}>
                        {approvalText} {scoreText}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-text-secondary transition-transform duration-300 group-open:rotate-180" />
                </div>
            </summary>
            <div className="border-t border-border/30 px-3 pb-3">
                {children}
            </div>
        </details>
    );
};

export default ChecklistCollapse;