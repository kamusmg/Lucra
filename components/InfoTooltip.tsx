import React from 'react';

interface InfoTooltipProps {
  text: string;
  children: React.ReactNode;
}

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, children }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="ml-1.5 cursor-help">
        <InfoIcon className="h-4 w-4 text-text-secondary/60 group-hover:text-primary transition-colors" />
      </div>
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[var(--tooltip-bg)] text-[var(--tooltip-text)] text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        role="tooltip"
      >
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[var(--tooltip-bg)]"></div>
      </div>
    </div>
  );
};

export default InfoTooltip;
