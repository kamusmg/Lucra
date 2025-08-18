
import React from 'react';

const EvolutionCycleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg relative animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div>
            <div className="h-9 w-96 bg-border rounded-md mb-2"></div>
            <div className="h-4 w-full max-w-lg bg-border rounded-md"></div>
        </div>
        <div className="text-right text-xs text-text-secondary flex-shrink-0 ml-4">
            <div className="h-3 w-24 bg-border rounded-md mb-1"></div>
            <div className="h-3 w-32 bg-border rounded-md mb-2"></div>
            <div className="h-3 w-20 bg-border rounded-md mb-1"></div>
            <div className="h-3 w-32 bg-border rounded-md"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 my-8 p-4 bg-background/30 rounded-lg">
          <div className="h-24 w-24 bg-border rounded-full"></div>
          <div className="h-24 w-24 bg-border rounded-full"></div>
          <div className="h-24 w-24 bg-border rounded-full"></div>
      </div>
      
      <div className="space-y-8 mt-8">
        {/* Skeleton for SelfAnalysisCard */}
        <div className="bg-background/50 p-4 rounded-lg border border-border/50 space-y-6">
            <div className="h-5 w-1/3 bg-border rounded-md mb-2"></div>
            <div className="space-y-2">
                <div className="h-4 w-full bg-border rounded-md"></div>
                <div className="h-4 w-5/6 bg-border rounded-md"></div>
            </div>
            <div className="h-16 w-full bg-border rounded-lg"></div>
            <div className="h-24 w-full bg-border rounded-lg"></div>
        </div>
        
        {/* Skeleton for Supervisor Directive */}
         <div className="pt-8 mt-8 border-t border-border/50">
            <div className="h-8 w-1/2 bg-border rounded-md mb-6"></div>
            <div className="h-32 w-full bg-border rounded-lg"></div>
        </div>

        {/* Skeleton for Action Button */}
        <div className="text-center pt-8 mt-8 border-t-4 border-primary/50">
            <div className="h-6 w-1/2 bg-border rounded-md mx-auto mb-2"></div>
            <div className="h-4 w-3/4 bg-border rounded-md mx-auto mb-4"></div>
            <div className="h-12 w-48 bg-border rounded-md mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionCycleCardSkeleton;
