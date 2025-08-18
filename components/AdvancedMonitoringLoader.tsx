

import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';

import AICoreMonitor from './AICoreMonitor.tsx';
import RobustnessAudit from './RobustnessAudit.tsx';

import AICoreMonitorSkeleton from './skeletons/AICoreMonitorSkeleton.tsx';

const AdvancedMonitoringLoader: React.FC = () => {
    const { 
        backtestData, 
        presentDayData,
        isBacktestLoading, 
        loadBacktestData 
    } = useData();
    
    useEffect(() => {
        if (!backtestData && !isBacktestLoading) {
            loadBacktestData();
        }
    }, [backtestData, isBacktestLoading, loadBacktestData]);

    return (
        <div className="space-y-12">
            {(isBacktestLoading || !backtestData || !presentDayData) ? (
                <AICoreMonitorSkeleton />
            ) : (
                <AICoreMonitor 
                    presentDayData={presentDayData} 
                    backtestData={backtestData} 
                />
            )}
            <RobustnessAudit />
        </div>
    );
};

export default AdvancedMonitoringLoader;