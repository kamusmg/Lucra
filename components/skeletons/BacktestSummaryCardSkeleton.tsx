
import React from 'react';

const SummaryBlockSkeleton: React.FC = () => (
    <div className="p-6 rounded-lg bg-surface/50 border border-border/50 animate-pulse">
        <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-border"></div>
            <div className="h-6 w-48 bg-border ml-3 rounded-md"></div>
        </div>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-border rounded-md"></div>
                <div className="h-4 w-16 bg-border rounded-md"></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-border rounded-md"></div>
                <div className="h-4 w-16 bg-border rounded-md"></div>
            </div>
            <hr className="border-border/50 my-2"/>
            <div className="text-center pt-2">
                <div className="h-3 w-24 bg-border rounded-md mx-auto mb-2"></div>
                <div className="h-8 w-32 bg-border rounded-md mx-auto mb-2"></div>
                <div className="h-5 w-20 bg-border rounded-md mx-auto"></div>
            </div>
        </div>
    </div>
);

const BacktestSummaryCardSkeleton: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg">
            <div className="h-8 w-3/4 max-w-sm bg-border rounded-md mx-auto mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummaryBlockSkeleton />
                <SummaryBlockSkeleton />
            </div>
        </div>
    );
};

export default BacktestSummaryCardSkeleton;
