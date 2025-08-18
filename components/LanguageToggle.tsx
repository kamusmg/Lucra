
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const baseClasses = 'px-2 py-1 text-xs font-bold rounded-md transition-colors';
    const activeClasses = 'bg-primary text-white';
    const inactiveClasses = 'bg-surface hover:bg-border text-text-secondary';

    return (
        <div className="flex items-center p-0.5 bg-background rounded-lg border border-border">
            <button
                onClick={() => setLanguage('pt')}
                className={`${baseClasses} ${language === 'pt' ? activeClasses : inactiveClasses}`}
                aria-pressed={language === 'pt'}
            >
                PT
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`${baseClasses} ${language === 'en' ? activeClasses : inactiveClasses}`}
                aria-pressed={language === 'en'}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageToggle;
