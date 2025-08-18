import React from 'react';

const TimeAstronautIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "h-6 w-6"} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {/* Astronaut Helmet */}
        <circle cx="12" cy="10" r="8" />
        <rect x="7" y="7" width="10" height="6" rx="1" fill="currentColor" className="text-gray-900 opacity-50" />
        
        {/* Clock Face inside Helmet */}
        <g strokeWidth="1">
            <path d="M12 8v2l1.5 1" />
        </g>
        
        {/* Body */}
        <path d="M12 18a4 4 0 01-4 4h8a4 4 0 01-4-4z" />
        <path d="M9 22V18" />
        <path d="M15 22V18" />
    </svg>
);

export default TimeAstronautIcon;