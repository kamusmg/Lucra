
import React from 'react';

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 19v-5h-5M4 19a9 9 0 0113.3-6.4M20 5a9 9 0 01-13.3 6.4" />
    </svg>
);

export default RefreshIcon;