
import React from 'react';

const AnalysisEngineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className={className}
    aria-hidden="true"
  >
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Outer Circle */}
      <circle cx="32" cy="32" r="29" stroke="currentColor" className="text-secondary opacity-40" />
      
      {/* Crescent Moon */}
      <path 
        d="M32,8 A24,24 0 1,0 32,56 A18,18 0 1,1 32,8 Z" 
        stroke="currentColor" 
        className="text-primary" 
        strokeWidth="3"
      />

      {/* Ascending Arrow */}
      <g stroke="currentColor" className="text-white" strokeWidth="3">
        <path d="M28 40 L36 32 L44 40" />
        <path d="M36 32 L36 22" />
      </g>
    </g>
  </svg>
);

export default AnalysisEngineIcon;