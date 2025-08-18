
import React from 'react';

const SignalBlockSkeleton: React.FC = () => (
    <div className="bg-background/50 rounded-lg p-4 flex flex-col h-full border border-border/50 backdrop-blur-sm animate-pulse">
        <div className="flex-grow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 flex gap-2">
                    <div className="h-5 w-20 bg-border rounded-full"></div>
                    <div className="h-5 w-24 bg-border rounded-full"></div>
                </div>
                 <div className="h-7 w-7 bg-border rounded-full"></div>
            </div>
            <div className="h-6 w-32 bg-border rounded-md mb-2"></div>
            
            <div className="bg-background/50 rounded-md p-2 mb-4 border border-border/30 text-center text-xs h-16"></div>

            <div className="space-y-4 text-xs mb-4">
                <div className="h-16 bg-border rounded-md"></div>
                <div className="h-16 bg-border rounded-md"></div>
            </div>
        </div>

        <div className="flex-shrink-0 mt-auto pt-4 border-t border-border/30 space-y-3">
             <div className="h-32 bg-border rounded-md"></div>
             <div className="mt-3 pt-3 border-t border-border/30 text-center bg-background/30 rounded-md p-2 h-20"></div>
        </div>
    </div>
);

const SectionSkeleton: React.FC<{isBuy: boolean}> = ({ isBuy }) => (
    <div className={`bg-gradient-to-br ${isBuy ? 'from-green-600/20' : 'from-red-600/20'} via-surface/50 to-surface/90 border ${isBuy ? 'border-green-500/50' : 'border-red-500/50'} rounded-lg p-6 shadow-2xl`}>
        <div className="flex items-center mb-6 text-white">
            <div className="h-14 w-14 bg-border/30 rounded-full"></div>
            <div className="h-8 w-72 bg-border/30 ml-4 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => <SignalBlockSkeleton key={index} />)}
        </div>
    </div>
);


const PresentDaySignalCardSkeleton: React.FC = () => {
    return (
        <div className="space-y-10">
            <div className="bg-surface/50 border border-border/50 rounded-lg p-6 shadow-lg animate-pulse">
                <div className="h-8 w-3/4 max-w-md bg-border rounded-md mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-24 bg-border/50 rounded-lg"></div>
                    <div className="h-24 bg-border/50 rounded-lg"></div>
                </div>
            </div>
            <SectionSkeleton isBuy={true} />
            <SectionSkeleton isBuy={false} />
        </div>
    );
};

export default PresentDaySignalCardSkeleton;
