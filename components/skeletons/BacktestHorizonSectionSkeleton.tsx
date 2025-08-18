
import React from 'react';

const SignalCardSkeleton: React.FC = () => (
    <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg flex flex-col h-full animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-border"></div>
                <div>
                    <div className="h-7 w-32 bg-border rounded-md"></div>
                     <div className="h-4 w-40 bg-border rounded-md mt-2"></div>
                </div>
            </div>
            <div className="h-6 w-20 bg-border rounded-full"></div>
        </div>

        <div className="my-4 p-3 bg-background/30 rounded-lg border border-border/30 space-y-2">
            <div className="h-4 w-full bg-border rounded"></div>
            <div className="h-4 w-full bg-border rounded"></div>
        </div>
        
        <div className="space-y-4 mb-6 flex-grow">
            <div className="bg-background/30 p-4 rounded-lg border border-border/30 h-24"></div>
            <div className="bg-background/30 p-4 rounded-lg border border-border/30 h-24"></div>
        </div>

        <div className="mt-auto bg-background/50 rounded-lg p-4 border border-border/50 h-48">
        </div>
    </div>
);

interface BacktestHorizonSectionSkeletonProps {
    title: string;
}

const BacktestHorizonSectionSkeleton: React.FC<BacktestHorizonSectionSkeletonProps> = ({ title }) => {
    return (
        <section>
            <h2 className="text-3xl font-bold text-text mb-6 pb-2 border-b-2 border-border">{title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SignalCardSkeleton />
                <SignalCardSkeleton />
            </div>
        </section>
    );
};

export default BacktestHorizonSectionSkeleton;
