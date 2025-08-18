
import React from 'react';

const AnalysisEngineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className={className}
    aria-hidden="true"
  >
    <g fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Orbits representing the 3 pillars of analysis */}
      <ellipse cx="32" cy="32" rx="28" ry="12" stroke="currentColor" className="text-secondary opacity-30" transform="rotate(15 32 32)" />
      <ellipse cx="32" cy="32" rx="28" ry="12" stroke="currentColor" className="text-secondary opacity-40" transform="rotate(75 32 32)" />
      <ellipse cx="32" cy="32" rx="28" ry="12" stroke="currentColor" className="text-secondary opacity-50" transform="rotate(135 32 32)" />

      {/* Central Hexagon Core (AI) */}
      <path
        d="M32 16L44 24L44 40L32 48L20 40L20 24Z"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-primary animate-core-pulse"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Inner Symbol representing data/intelligence */}
      <g stroke="currentColor" className="text-white" strokeWidth="2">
        {/* A simple, optimistic upward trend line */}
        <path d="M26 40 L 42 24" />
      </g>
    </g>
  </svg>
);

export default AnalysisEngineIcon;
