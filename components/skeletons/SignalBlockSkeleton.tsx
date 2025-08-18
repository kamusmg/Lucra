import React from 'react';

const Shimmer: React.FC = () => (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/50 to-transparent"></div>
);

const SignalBlockSkeleton: React.FC = () => {
  return (
    <div className="relative bg-background/50 rounded-xl p-4 flex flex-col border border-border/50 backdrop-blur-sm overflow-hidden">
        <div className="flex-grow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 flex gap-2">
                    <div className="h-5 w-20 bg-border rounded-full"></div>
                    <div className="h-5 w-24 bg-border rounded-full"></div>
                </div>
                 <div className="h-7 w-7 bg-border rounded-full"></div>
            </div>
            <div className="h-6 w-32 bg-border rounded-md mb-2"></div>
            
            <div className="bg-background/50 rounded-md p-2 mb-4 border border-border/30 text-center h-16">
                 <div className="h-3 w-3/4 bg-border rounded-full mx-auto mb-2"></div>
                 <div className="h-6 w-1/2 bg-border rounded-md mx-auto"></div>
            </div>

            <div className="space-y-4 text-xs mb-4">
                <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-border rounded-md"></div>
                    <div className="h-3 w-full bg-border rounded-md"></div>
                    <div className="h-3 w-5/6 bg-border rounded-md"></div>
                </div>
                 <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-border rounded-md"></div>
                    <div className="h-3 w-full bg-border rounded-md"></div>
                    <div className="h-3 w-4/6 bg-border rounded-md"></div>
                </div>
            </div>
             <div className="space-y-2 text-xs mb-4 p-3 bg-background/50 rounded-md border border-border/30 h-24"></div>
        </div>

        <div className="flex-shrink-0 mt-auto pt-4 border-t border-border/30 space-y-3">
             <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                     <div key={i} className="flex justify-between">
                         <div className="h-3 w-1/3 bg-border rounded-md"></div>
                         <div className="h-3 w-1/4 bg-border rounded-md"></div>
                     </div>
                ))}
             </div>
             <div className="mt-3 pt-3 border-t border-border/30 text-center bg-background/30 rounded-md p-2 h-20"></div>
        </div>
        <Shimmer />
    </div>
  );
};

export default SignalBlockSkeleton;
