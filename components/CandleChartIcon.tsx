import React from 'react';

const CandleChartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className || "h-8 w-8"}
    >
        <path d="M2 20h20"/>
        <path d="M4 16v-4"/>
        <path d="M4 8V4"/>
        <path d="M12 16v-6"/>
        <path d="M12 6V4"/>
        <path d="M20 16v-2"/>
        <path d="M20 10V4"/>
        <rect x="2" y="8" width="4" height="4" rx="1"/>
        <rect x="10" y="6" width="4" height="4" rx="1"/>
        <rect x="18" y="10" width="4" height="4" rx="1"/>
    </svg>
);

export default CandleChartIcon;
