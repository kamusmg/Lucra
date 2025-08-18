
import React from 'react';

const AssetCardSkeleton: React.FC = () => (
    <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-5 shadow-lg flex flex-col h-full animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-border rounded-full"></div>
                <div>
                    <div className="h-6 w-12 bg-border rounded-md"></div>
                    <div className="h-4 w-20 bg-border rounded-md mt-1"></div>
                </div>
            </div>
            <div className="h-6 w-24 bg-border rounded-full"></div>
        </div>
        
        <div className="text-center mb-4">
            <div className="h-9 w-32 bg-border rounded-md mx-auto"></div>
            <div className="h-5 w-16 bg-border rounded-md mx-auto mt-2"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="bg-background/40 p-2 rounded-md h-14 space-y-2">
                <div className="h-3 w-16 bg-border rounded-md"></div>
                <div className="h-5 w-20 bg-border rounded-md"></div>
            </div>
            <div className="bg-background/40 p-2 rounded-md h-14 space-y-2">
                <div className="h-3 w-16 bg-border rounded-md"></div>
                <div className="h-5 w-20 bg-border rounded-md"></div>
            </div>
        </div>

        <div className="mt-auto bg-background/50 rounded-lg p-4 border border-border/50">
             <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-border rounded-md"></div>
                    <div className="h-4 w-24 bg-border rounded-md"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-3 w-10 bg-border rounded-md"></div>
                    <div className="h-4 w-24 bg-border rounded-md"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-3 w-12 bg-border rounded-md"></div>
                    <div className="h-4 w-24 bg-border rounded-md"></div>
                </div>
            </div>
        </div>
    </div>
);


const MajorAssetSectionSkeleton: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-indigo-900/40 to-transparent border border-indigo-500/30 rounded-xl p-6 shadow-lg shadow-indigo-500/10">
            <div className="flex items-center mb-6">
                <div className="bg-secondary/10 p-2 rounded-full h-12 w-12"></div>
                <div className="h-8 w-80 bg-border ml-4 rounded-md"></div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4 animate-pulse">
                <div className="h-8 w-20 bg-surface rounded-full"></div>
                <div className="h-8 w-28 bg-surface rounded-full"></div>
                <div className="h-8 w-32 bg-surface rounded-full"></div>
                <div className="h-8 w-24 bg-surface rounded-full"></div>
                <div className="h-8 w-28 bg-surface rounded-full"></div>
            </div>

            <div className="border-b border-border mb-6 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-24 bg-border/30 rounded-t-lg"></div>
                    <div className="h-10 w-24 bg-border/30 rounded-t-lg"></div>
                    <div className="h-10 w-24 bg-border/30 rounded-t-lg"></div>
                    <div className="h-10 w-24 bg-border/30 rounded-t-lg"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, index) => (
                    <AssetCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
};

export default MajorAssetSectionSkeleton;
