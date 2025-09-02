import React from 'react';

const PieChartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "h-4 w-4"} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M21.21 15.89A10 10 0 1 1 8.11 2.99" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
);

export default PieChartIcon;
