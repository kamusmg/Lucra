

import React, { useState, useEffect } from 'react';
import AnalysisEngineIcon from './AnalysisEngineIcon.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';

const LoadingSpinner: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const loadingSteps = [
        t.loadingStep1, t.loadingStep2, t.loadingStep3, t.loadingStep4, t.loadingStep5,
        t.loadingStep6, t.loadingStep7, t.loadingStep8, t.loadingStep9, t.loadingStep10,
    ];

    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prevStep) => (prevStep + 1) % loadingSteps.length);
        }, 2200); // Change step every 2.2 seconds

        return () => clearInterval(interval);
    }, [loadingSteps.length]);

    const starBg1 = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'none\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'0.5\' fill=\'%23F3F4F6\'/%3E%3C/svg%3E")';
    const starBg2 = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\'%3E%3Crect width=\'150\' height=\'150\' fill=\'none\'/%3E%3Ccircle cx=\'20\' cy=\'80\' r=\'1\' fill=\'%239CA3AF\'/%3E%3Ccircle cx=\'100\' cy=\'30\' r=\'1\' fill=\'%239CA3AF\'/%3E%3C/svg%3E")';

    return (
        <div className="relative flex flex-col items-center justify-center h-screen text-text bg-background overflow-hidden">
            {/* Starry background layers for parallax effect */}
            <div className="absolute inset-0 bg-repeat bg-center animate-scroll-bg" style={{backgroundImage: starBg1, animationDuration: '150s'}}></div>
            <div className="absolute inset-0 bg-repeat bg-center animate-scroll-bg" style={{backgroundImage: starBg2, animationDuration: '100s'}}></div>
            
            <div className="relative flex flex-col items-center justify-center text-center z-10 p-4">
                
                {/* Analysis Engine Icon */}
                <div className="relative mb-8">
                     <AnalysisEngineIcon className="h-40 w-40" />
                </div>
                
                {/* Loading Text */}
                <div className="relative w-full max-w-lg">
                     <h2 className="text-3xl font-bold mb-4 text-white">{t.loadingTitle}</h2>
                     <div style={{minHeight: '28px'}}>
                        <p 
                            key={currentStep} 
                            className="text-lg text-text-secondary animate-text-fade-in"
                        >
                            {loadingSteps[currentStep]}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;