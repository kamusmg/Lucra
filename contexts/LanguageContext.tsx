
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Language = 'pt' | 'en';

interface ILanguageContext {
    language: Language;
    setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<ILanguageContext | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLang = localStorage.getItem('lucra-crypto-lang') as Language;
        return savedLang || 'pt';
    });

    useEffect(() => {
        localStorage.setItem('lucra-crypto-lang', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): ILanguageContext => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};