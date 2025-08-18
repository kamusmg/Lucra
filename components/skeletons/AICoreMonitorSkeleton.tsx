import React from 'react';

const AICoreMonitorSkeleton: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg flex flex-col md:flex-row items-center gap-8 animate-pulse">
            <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-border rounded-full flex items-center justify-center">
                    <div className="text-center">
                        <div className="h-12 w-24 bg-border/50 rounded-md mb-1"></div>
                        <div className="h-4 w-20 bg-border/50 rounded-md"></div>
                    </div>
                </div>
            </div>
            <div className="flex-grow w-full">
                <div className="h-8 md:w-3/4 w-full bg-border rounded-md mb-2 mx-auto md:mx-0"></div>
                <div className="h-10 w-full bg-border rounded-md mb-4"></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                        <div className="h-4 w-2/3 bg-border/50 rounded-md mb-2"></div>
                        <div className="h-7 w-1/2 bg-border/50 rounded-md"></div>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                        <div className="h-4 w-2/3 bg-border/50 rounded-md mb-2"></div>
                        <div className="h-7 w-1/2 bg-border/50 rounded-md"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICoreMonitorSkeleton;
