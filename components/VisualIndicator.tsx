import React from 'react';

interface VisualIndicatorProps {
  percentage: number;
}

const VisualIndicator: React.FC<VisualIndicatorProps> = ({ percentage }) => {
    const getColor = (p: number) => {
        if (p >= 80) return 'bg-success';
        if (p >= 60) return 'bg-green-400';
        if (p >= 40) return 'bg-yellow-400';
        return 'bg-danger';
    };

    const colorClass = getColor(percentage);

    return (
        <div className="flex items-center justify-end gap-2">
            <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <span className="text-white font-semibold w-10 text-right">{percentage.toFixed(0)}%</span>
        </div>
    );
};

export default VisualIndicator;
