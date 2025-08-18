

import React from 'react';
import { MacroIndicator, BacktestAnalysisResult, PresentDayAnalysisResult } from '../types.ts';
import AICoreMonitorSkeleton from './skeletons/AICoreMonitorSkeleton.tsx';

const getOverallStatus = (context: MacroIndicator[]): 'critical' | 'warning' | 'neutral' | 'good' => {
    const statusCount = context.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (statusCount.critical > 0) return 'critical';
    if (statusCount.warning > statusCount.good) return 'warning';
    if (statusCount.good > statusCount.warning) return 'good';
    return 'neutral';
};

const statusConfig = {
    critical: { color: 'danger', pulseColor: 'red', name: 'Crítico' },
    warning: { color: 'yellow-400', pulseColor: 'yellow', name: 'Alerta' },
    neutral: { color: 'blue-400', pulseColor: 'blue', name: 'Neutro' },
    good: { color: 'success', pulseColor: 'green', name: 'Bom' },
};

interface AICoreMonitorProps {
    presentDayData: PresentDayAnalysisResult;
    backtestData: BacktestAnalysisResult;
}

const AICoreMonitor: React.FC<AICoreMonitorProps> = ({ presentDayData, backtestData }) => {
    if (!presentDayData || !backtestData) return <AICoreMonitorSkeleton />;

    const overallStatus = getOverallStatus(presentDayData.macroContext);
    const config = statusConfig[overallStatus];

    const { evolutionPercentage, realMoneySuccessProbability } = backtestData;

    return (
        <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
                <div className={`absolute inset-0 bg-${config.pulseColor}-500/20 rounded-full animate-pulse`}></div>
                <div className={`relative w-40 h-40 bg-background border-4 border-${config.color} rounded-full flex items-center justify-center`}>
                    <div className="text-center">
                        <p className={`text-4xl font-bold text-${config.color}`}>{config.name}</p>
                        <p className="text-sm text-text-secondary">Status Geral</p>
                    </div>
                </div>
            </div>
            <div className="flex-grow w-full">
                <h3 className="text-2xl font-bold text-text mb-1 text-center md:text-left">Monitor do Núcleo da IA</h3>
                <p className="text-text-secondary text-center md:text-left mb-4">Métricas de performance e confiança baseadas no último ciclo de backtest.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                        <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Progresso de Evolução</p>
                        <p className="text-3xl font-bold text-primary">{evolutionPercentage.toFixed(0)}%</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                        <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Prob. Sucesso (Real)</p>
                        <p className="text-3xl font-bold text-secondary">{realMoneySuccessProbability.toFixed(0)}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICoreMonitor;