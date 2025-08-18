
import React from 'react';

const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "h-8 w-8"} 
        viewBox="0 0 24 24" 
        strokeWidth="1.5" 
        stroke="currentColor" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M15.5 14a3.5 3.5 0 0 0 -3.5 3.5v1.5a3.5 3.5 0 0 0 7 0v-1.5a3.5 3.5 0 0 0 -3.5 -3.5z" />
        <path d="M8.5 14a3.5 3.5 0 0 1 3.5 3.5v1.5a3.5 3.5 0 0 1 -7 0v-1.5a3.5 3.5 0 0 1 3.5 -3.5z" />
        <path d="M12 14h-1" />
        <path d="M13 14h-1" />
        <path d="M12 17v-2.5" />
        <path d="M15.5 14a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 0 0 7" />
        <path d="M12 4v2" />
        <path d="M9 7h-1" />
        <path d="M16 7h-1" />
    </svg>
);

export default BrainIcon;
