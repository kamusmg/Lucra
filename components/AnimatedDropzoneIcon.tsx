import React from 'react';

const AnimatedDropzoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className={className || "w-16 h-16"}
    >
        <defs>
            <style>
                {`
                .ad-cloud {
                    animation: ad-cloud-move 3s infinite ease-in-out;
                    transform-origin: center;
                }
                .ad-arrow {
                    animation: ad-arrow-move 1.5s infinite ease-in-out;
                    transform-origin: center;
                }
                @keyframes ad-cloud-move {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes ad-arrow-move {
                    0% { transform: translateY(-4px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(4px); opacity: 0; }
                }
                `}
            </style>
        </defs>
        <g strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Cloud */}
            <path d="M46.6,27.2c-0.2-7.8-6.7-14-14.6-14c-6.1,0-11.3,3.7-13.5,9c-0.2,0-0.4,0-0.6,0c-5.7,0-10.4,4.7-10.4,10.4s4.7,10.4,10.4,10.4h27.4c5.1,0,9.3-4.1,9.3-9.3C55.9,31.4,51.8,27.2,46.6,27.2z"
                className="ad-cloud text-text-secondary"
            />
            {/* Arrow */}
            <g className="ad-arrow text-primary">
                <line x1="32" y1="28" x2="32" y2="45" />
                <polyline points="26,39 32,45 38,39" />
            </g>
        </g>
    </svg>
);

export default AnimatedDropzoneIcon;
