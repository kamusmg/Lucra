
import React from 'react';

const MacroCardSkeleton: React.FC = () => (
    <div className="bg-surface border-l-4 border-border/50 rounded-r-lg p-4 shadow-md animate-pulse">
        <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-2/3 bg-border rounded"></div>
            <div className="h-5 w-5 bg-border rounded-full"></div>
        </div>
        <div className="h-8 w-1/2 bg-border rounded mb-1"></div>
        <div className="h-3 w-full bg-border rounded"></div>
    </div>
);

const MacroDashboardSkeleton: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-text mb-6 pb-2 border-b-2 border-border">Painel de Controle Macro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                    <MacroCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
};

export default MacroDashboardSkeleton;
