
import React from 'react';
import AnalysisEngineIcon from './AnalysisEngineIcon';

interface LogoProps {
    title: string;
    subtitle: string;
}

const Logo: React.FC<LogoProps> = ({ title, subtitle }) => (
    <div className="flex items-center gap-4">
        <AnalysisEngineIcon className="w-14 h-14 flex-shrink-0" />
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider uppercase">{title}</h1>
            <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
        </div>
    </div>
);

export default Logo;