import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { PresentDayAssetSignal, ChecklistResult } from '../types.ts';
import { formatCurrency, formatPercentage } from '../utils/formatters.ts';
import GoIcon from './GoIcon.tsx';
import CautionIcon from './CautionIcon.tsx';
import { useData } from '../contexts/DataContext.tsx';
import { apiClient } from '../services/api/bootstrap.ts';
import PresentDaySignalCardSkeleton from './skeletons/PresentDaySignalCardSkeleton.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';
import { HorizonKey, HORIZON_LABELS } from '../services/horizonPolicy.ts';
import ChecklistCollapse from './ChecklistCollapse.tsx';
import ChevronDownIcon from './ChevronDownIcon.tsx';
import InfoTooltip from './InfoTooltip.tsx';
import VisualIndicator from './VisualIndicator.tsx';
import RotateCwIcon from './RotateCwIcon.tsx';
import SignalBlockSkeleton from './skeletons/SignalBlockSkeleton.tsx';
import ChainIcon from './ChainIcon.tsx';
import BotIcon from './BotIcon.tsx';


const BuyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
);

const SellIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
    </svg>
);

const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
);

const ErrorIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const confidenceColorMap: { [key: string]: string } = {
    'Alto': 'bg-green-500',
    'High': 'bg-green-500',
    'Médio': 'bg-yellow-500 text-black',
    'Medium': 'bg-yellow-500 text-black',
    'Baixo': 'bg-red-500',
    'Low': 'bg-red-500',
};

const gradeConfig: { [key: string]: string } = {
    'A': 'bg-green-500 text-white',
    'B': 'bg-blue-500 text-white',
    'C': 'bg-yellow-500 text-black',
    'D': 'bg-orange-500 text-white',
    'F': 'bg-red-700 text-white',
};

const FundamentalAnalysisCollapse: React.FC<{
    signal: PresentDayAssetSignal;
    t: any;
}> = ({ signal, t }) => {
    const { grade, fundamentalAnalysis } = signal;

    if (!grade || !fundamentalAnalysis) {
        return null;
    }

    const gradeClasses = gradeConfig[grade] || 'bg-gray-500';

    return (
        <details className="group bg-background/30 rounded-lg border border-border/30 transition-all duration-300 open:bg-background/50 open:border-primary/30 text-xs">
            <summary className="cursor-pointer list-none flex items-center justify-between p-2 font-semibold transition-colors">
                <span className="font-bold text-text-secondary group-hover:text-white uppercase tracking-wider">{t.fundamentalAnalysis}</span>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${gradeClasses}`}>
                        {t.grade}: {grade}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-text-secondary transition-transform duration-300 group-open:rotate-180" />
                </div>
            </summary>
            <div className="border-t border-border/30 p-3 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="text-text-secondary">{t.technology}:</div>
                    <VisualIndicator percentage={fundamentalAnalysis.technologyScore} />
                    
                    <div className="text-text-secondary">{t.team}:</div>
                    <VisualIndicator percentage={fundamentalAnalysis.teamScore} />
                    
                    <div className="text-text-secondary">{t.tokenomics}:</div>
                    <VisualIndicator percentage={fundamentalAnalysis.tokenomicsScore} />
                    
                    <div className="text-text-secondary">{t.devActivity}:</div>
                    <VisualIndicator percentage={fundamentalAnalysis.developerActivityScore} />
                </div>

                <div>
                    <h6 className="font-bold text-text mb-1">{t.analysisSummary}:</h6>
                    <p className="text-text-secondary leading-relaxed">{fundamentalAnalysis.summary}</p>
                </div>
            </div>
        </details>
    );
};

const OnChainIntelligenceCollapse: React.FC<{
    signal: PresentDayAssetSignal;
    t: any;
}> = ({ signal, t }) => {
    const { onChainIntelligence } = signal;

    if (!onChainIntelligence || (!onChainIntelligence.alerts?.length && !onChainIntelligence.summary)) {
        return null;
    }

    return (
        <details className="group bg-background/30 rounded-lg border border-border/30 transition-all duration-300 open:bg-background/50 open:border-primary/30 text-xs">
            <summary className="cursor-pointer list-none flex items-center justify-between p-2 font-semibold transition-colors">
                <div className="flex items-center gap-2">
                    <ChainIcon className="h-4 w-4 text-primary" />
                    <span className="font-bold text-text-secondary group-hover:text-white uppercase tracking-wider">{t.onChainIntelligence}</span>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-text-secondary transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="border-t border-border/30 p-3 space-y-3">
                {onChainIntelligence.alerts && onChainIntelligence.alerts.length > 0 && (
                    <div>
                        <h6 className="font-bold text-text mb-1">{t.onChainAlerts}:</h6>
                        <ul className="list-disc list-inside text-text-secondary pl-2 space-y-1">
                            {onChainIntelligence.alerts.map((alert, index) => (
                                <li key={index}>{alert}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {onChainIntelligence.summary && (
                    <div>
                        <h6 className="font-bold text-text mb-1">{t.onChainSummary}:</h6>
                        <p className="text-text-secondary leading-relaxed">{onChainIntelligence.summary}</p>
                    </div>
                )}
            </div>
        </details>
    );
};

const AutomationSetupCollapse: React.FC<{
    signal: PresentDayAssetSignal;
    t: any;
}> = ({ signal, t }) => {
    const { automationSetup } = signal;

    if (!automationSetup) {
        return null;
    }
    
    const parameters = Object.entries(automationSetup.parameters || {}).filter(([_, value]) => value !== undefined && value !== null);

    return (
        <details className="group bg-background/30 rounded-lg border border-border/30 transition-all duration-300 open:bg-background/50 open:border-primary/30 text-xs">
            <summary className="cursor-pointer list-none flex items-center justify-between p-2 font-semibold transition-colors">
                 <div className="flex items-center gap-2">
                    <BotIcon className="h-4 w-4 text-secondary" />
                    <span className="font-bold text-text-secondary group-hover:text-white uppercase tracking-wider">{t.automationSetup}</span>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-text-secondary transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="border-t border-border/30 p-3 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-text-secondary font-bold">{t.recommendedBot}:</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-secondary/20 text-secondary">{automationSetup.recommendedBot}</span>
                </div>
                <div>
                    <h6 className="font-bold text-text mb-1">{t.botJustification}:</h6>
                    <p className="text-text-secondary leading-relaxed">{automationSetup.justification}</p>
                </div>
                {parameters.length > 0 && (
                    <div>
                        <h6 className="font-bold text-text mb-1">{t.botParameters}:</h6>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-background/50 p-2 rounded-md border border-border/50">
                            {parameters.map(([key, value]) => (
                                <React.Fragment key={key}>
                                    <div className="text-text-secondary">{t[key] || key}:</div>
                                    <div className="text-white font-semibold text-right">{String(value)}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </details>
    );
};

export const SignalBlock: React.FC<{
    signal: PresentDayAssetSignal;
    type?: 'buy' | 'sell';
    index?: number;
    onReroll?: (type: 'buy' | 'sell', index: number) => void;
    isRerolling?: boolean;
    rerollError?: string | null;
    showProminentProfit?: boolean;
    isTacticalSearch?: boolean;
    showTooltips?: boolean;
}> = ({signal, type, index, onReroll, isRerolling = false, rerollError = null, showProminentProfit = false, isTacticalSearch = false, showTooltips = true}) => {
    const { language } = useLanguage();
    const t = translations[language];
    
    const confidenceClasses = confidenceColorMap[signal.confidenceLevel] || 'bg-gray-500';
    const isProjectedProfit = signal.profitProjectionUsd > 0;
    const profitColor = isProjectedProfit ? 'text-success' : 'text-danger';
    const profitLabel = t[signal.signalType === 'VENDA' ? 'profitOnFall' : 'estimatedProfit'];

    if (rerollError) {
        return (
             <div className="bg-danger/20 rounded-lg p-4 flex flex-col h-full border border-danger/50 backdrop-blur-sm items-center justify-center text-center">
                 <ErrorIcon className="h-8 w-8 text-danger" />
                 <p className="text-danger text-sm mt-2 font-semibold">{rerollError}</p>
                 <p className="text-red-400 text-xs mt-1">{t.tryAgain}</p>
            </div>
        )
    }

    if (isRerolling) {
        return (
            <div className="bg-background/50 rounded-lg p-4 flex flex-col h-full border border-primary/50 backdrop-blur-sm items-center justify-center">
                 <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-primary text-xs mt-2 animate-pulse">{t.rerolling}</p>
            </div>
        )
    }
    
    const probabilityValue = parseFloat(String(signal.probability || '0').replace('%',''));

    return (
        <div className={`relative bg-background/50 rounded-xl p-4 flex flex-col border backdrop-blur-sm transition-all duration-300
        ${signal.isTopSignal 
            ? 'border-primary shadow-lg shadow-primary/20 animate-strong-pulse' 
            : 'border-border/50 hover:shadow-primary/20 hover:border-primary/40'}`
        }>
            {signal.isTopSignal && (
                <div className="absolute -top-3 -right-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    {t.topSignal}
                </div>
            )}
            <div className="flex-grow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary`}>
                            {signal.horizon}
                        </span>
                         <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${confidenceClasses} text-white`}>
                            {t.confidence}: {signal.confidenceLevel}
                        </span>
                    </div>
                     {onReroll && type && index !== undefined && (
                        <button 
                            onClick={() => onReroll(type, index)}
                            disabled={isRerolling}
                            className="flex-shrink-0 bg-primary/20 text-primary p-1.5 rounded-full hover:bg-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t.rerollButtonTitle}
                            aria-label={t.rerollButtonTitle}
                        >
                           <RotateCwIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <h5 className="text-lg font-bold text-white tracking-tight mb-2">{signal.assetName}</h5>
                
                <div className="my-4 space-y-2">
                    {signal?.grade && signal?.fundamentalAnalysis && (
                        <FundamentalAnalysisCollapse signal={signal} t={t} />
                    )}
                    <OnChainIntelligenceCollapse signal={signal} t={t} />
                    <AutomationSetupCollapse signal={signal} t={t} />
                    {signal?.checklistResult && (
                        <ChecklistCollapse
                            approved={signal.checklistResult.atende_criterios}
                            score={signal.checklistResult.pontuacao}
                            defaultOpen={false}
                        >
                             {Array.isArray(signal.checklistResult.motivos) && (
                                <ul className="list-disc ml-5 mt-2 text-text-secondary">
                                    {signal.checklistResult.motivos.map((m:string, i:number)=> <li key={i}>{m}</li>)}
                                </ul>
                            )}
                        </ChecklistCollapse>
                    )}
                </div>
                
                <div className="bg-background/50 rounded-md p-2 mb-4 border border-border/30 text-center text-xs">
                    <div className="text-text-secondary uppercase">{t.livePrice} ({signal.livePriceSource || '...'})</div>
                    {signal.livePrice ? (
                         <div className="flex items-center justify-center gap-2">
                             <span className="relative flex h-2 w-2 mt-1">
                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                             </span>
                             <p className="text-lg font-bold text-white">{formatCurrency(parseFloat(signal.livePrice))}</p>
                        </div>
                    ) : (
                        <p className="text-sm font-semibold text-yellow-400 mt-1">N/A</p>
                    )}
                </div>

                {(signal.strongPoints?.length > 0 || signal.weakPoints?.length > 0 || signal.specialModes?.length > 0) && (
                    <details className="group bg-background/30 rounded-lg border border-border/30 transition-all duration-300 open:bg-background/50 open:border-primary/30 text-xs mb-4">
                        <summary className="cursor-pointer list-none flex items-center justify-between p-2 font-semibold transition-colors">
                            <span className="font-bold text-text-secondary group-hover:text-white uppercase tracking-wider">{t.justifications}</span>
                            <ChevronDownIcon className="h-4 w-4 text-text-secondary transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="border-t border-border/30 p-3 space-y-2">
                            {signal.strongPoints && signal.strongPoints.length > 0 && (
                                <div>
                                    <h6 className="font-bold text-green-400">{t.strongPoints}</h6>
                                    <ul className="list-disc list-inside text-text-secondary pl-2">
                                        {signal.strongPoints.map((point, i) => <li key={`strong-${i}`}>{point}</li>)}
                                    </ul>
                                </div>
                            )}
                            {signal.weakPoints && signal.weakPoints.length > 0 && (
                                    <div className="mt-2">
                                    <h6 className="font-bold text-red-400">{t.weakPoints}</h6>
                                    <ul className="list-disc list-inside text-text-secondary pl-2">
                                        {signal.weakPoints.map((point, i) => <li key={`weak-${i}`}>{point}</li>)}
                                    </ul>
                                </div>
                            )}
                            {signal.specialModes && signal.specialModes.length > 0 && (
                                    <div className="mt-2">
                                    <h6 className="font-bold text-yellow-400">{t.specialModes}</h6>
                                    <ul className="list-disc list-inside text-text-secondary pl-2">
                                        {signal.specialModes.map((mode, i) => <li key={`mode-${i}`}>{mode}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </details>
                )}
            </div>

            <div className="flex-shrink-0 mt-auto pt-4 border-t border-border/30 space-y-3">
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center text-text-secondary">
                      <span>{t.entryPrice}</span>
                      {showTooltips && <InfoTooltip text={t.tooltipEntryPrice} />}
                    </div>
                    <div className="text-white font-semibold text-right">{signal.entryRange}</div>
                    
                    <div className="flex items-center text-text-secondary">
                        <span>{t.probability}</span>
                        {showTooltips && <InfoTooltip text={t.tooltipProbability} />}
                    </div>
                    <VisualIndicator percentage={probabilityValue} />
                    
                    {signal.ivlPercentage !== undefined && (
                        <>
                            <div className="flex items-center text-text-secondary">
                                <span>{t.ivl}</span>
                                {showTooltips && <InfoTooltip text={t.tooltipIvl} />}
                            </div>
                            <VisualIndicator percentage={signal.ivlPercentage} />
                        </>
                    )}

                    <div className="flex items-center text-text-secondary">
                        <span>{t.target}</span>
                        {showTooltips && <InfoTooltip text={t.tooltipTarget} />}
                    </div>
                    <div className="text-green-400 font-semibold text-right">{signal.target}</div>

                    <div className="flex items-center text-text-secondary">
                        <span>{t.stopLoss}</span>
                        {showTooltips && <InfoTooltip text={t.tooltipStopLoss} />}
                    </div>
                    <div className="text-red-400 font-semibold text-right">{signal.stopLoss}</div>

                    {(signal.riskPerTrade !== undefined && signal.recommendedPositionSize !== undefined) && (
                        <>
                            <div className="text-text-secondary col-span-2 my-1 border-t border-border/30"></div>

                            <div className="flex items-center text-text-secondary">
                                <span>{t.riskValue}</span>
                                {showTooltips && <InfoTooltip text={t.tooltipRiskValue} />}
                            </div>
                            <div className="text-white font-semibold text-right">{formatCurrency(signal.riskPerTrade)}</div>

                            <div className="flex items-center text-text-secondary">
                                <span>{t.positionSize}</span>
                                {showTooltips && <InfoTooltip text={t.tooltipPositionSize} />}
                            </div>
                            <div className="text-white font-semibold text-right">{formatCurrency(signal.recommendedPositionSize)}</div>
                        </>
                    )}
                    
                    <div className="text-text-secondary col-span-2 my-1 border-t border-border/30"></div>

                    <div className="flex items-center text-text-secondary">
                        <span>{t.strategy}</span>
                    </div>
                    <div className="text-white font-semibold text-right">{signal.strategy}</div>

                    <div className="flex items-center text-text-secondary">
                        <span>{t.entryDate}</span>
                    </div>
                    <div className="text-white font-semibold text-right">{signal.entryDatetime}</div>

                    <div className="flex items-center text-text-secondary">
                        <span>{t.exitDate}</span>
                    </div>
                    <div className="text-white font-semibold text-right">{signal.exitDatetime}</div>
                </div>
                 <div className="mt-3 pt-3 border-t border-border/30 text-center bg-background/30 rounded-md p-2">
                    <div className="text-xs text-text-secondary mb-1 flex items-center justify-center">
                        {profitLabel} ({t.baseInvestment})
                        {showTooltips && <InfoTooltip text={t.tooltipRoi} />}
                    </div>
                    <div className={`${showProminentProfit ? 'text-4xl' : 'text-2xl'} font-bold ${profitColor}`}>{formatCurrency(signal.profitProjectionUsd)}</div>
                    <div className={`text-sm font-semibold ${profitColor}`}>({formatPercentage(signal.roiProjectionPercentage)})</div>
                </div>
            </div>
        </div>
    )
}

const AddSignalCard: React.FC<{ onAdd: () => void; isLoading: boolean; t: any }> = ({ onAdd, isLoading, t }) => {
    return (
        <div className="bg-surface/30 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-border/50 h-full min-h-[400px] transition-colors hover:border-primary/50">
            <p className="text-text-secondary text-sm mb-4 text-center">{t.noSignalHere}</p>
            <button
                onClick={onAdd}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
            >
                <PlusIcon className="h-5 w-5" />
                {isLoading ? t.generatingSignal : t.generateSignal}
            </button>
        </div>
    );
};

const SignalGrid: React.FC<{
    signals: { signal: PresentDayAssetSignal; originalIndex: number }[];
    side: 'buy' | 'sell';
    onReroll: (type: 'buy' | 'sell', index: number) => void;
    onAddSignal: (side: 'buy' | 'sell') => void;
    isRerolling: Record<string, boolean>;
    isAddingSignal: 'buy' | 'sell' | null;
    rerollErrors: Record<string, string | null>;
    t: any;
}> = ({ signals, side, onReroll, onAddSignal, isRerolling, isAddingSignal, rerollErrors, t }) => {
    
    // The grid dynamically renders all signals and fills remaining space up to a minimum of 4 slots.
    const MINIMUM_CARD_SLOTS = 4;
    const emptySlotsCount = Math.max(0, MINIMUM_CARD_SLOTS - signals.length);

    return (
        <>
            {signals.map(item => (
                <SignalBlock 
                    key={`${side}-${item.originalIndex}-${item.signal.assetName}`}
                    signal={item.signal}
                    type={side}
                    index={item.originalIndex}
                    onReroll={onReroll}
                    isRerolling={!!isRerolling[`${side}-${item.originalIndex}`]}
                    rerollError={rerollErrors[`${side}-${item.originalIndex}`] || null}
                />
            ))}
            {emptySlotsCount > 0 && [...Array(emptySlotsCount)].map((_, i) => (
                <AddSignalCard 
                    key={`add-${side}-${i}`}
                    onAdd={() => onAddSignal(side)}
                    isLoading={isAddingSignal === side}
                    t={t}
                />
            ))}
        </>
    );
};


const PresentDaySignalCard: React.FC = () => {
    const { 
        presentDayData, 
        isInitialLoading,
        isRecalculating,
        updatePresentDaySignal,
        addPresentDaySignal,
        loadedHorizons,
        horizonsLoading,
        lazyLoadHorizon
    } = useData();
    const { language } = useLanguage();
    const t = translations[language];
    const [tabSide, setTabSide] = useState<'buy' | 'sell'>('buy');
    const [tabH, setTabH] = useState<HorizonKey>('24h');

    const [isRerolling, setIsRerolling] = useState<Record<string, boolean>>({});
    const [rerollErrors, setRerollErrors] = useState<Record<string, string | null>>({});
    const [isAddingSignal, setIsAddingSignal] = useState<'buy' | 'sell' | null>(null);
    const [addSignalError, setAddSignalError] = useState<string | null>(null);


    useEffect(() => {
        if (!loadedHorizons.has(tabH)) {
            lazyLoadHorizon(tabH);
        }
    }, [tabH, loadedHorizons, lazyLoadHorizon]);

    const handleReroll = useCallback(async (type: 'buy' | 'sell', index: number) => {
        if (!presentDayData) return;

        const key = `${type}-${index}`;
        setIsRerolling(prev => ({ ...prev, [key]: true }));
        setRerollErrors(prev => ({ ...prev, [key]: null }));

        const signals = type === 'buy' ? presentDayData.presentDayBuySignals : presentDayData.presentDaySellSignals;
        const currentSignal = signals[index];

        const allAssetNames = [
            ...presentDayData.presentDayBuySignals.map(s => s.assetName),
            ...presentDayData.presentDaySellSignals.map(s => s.assetName),
        ];

        try {
            const newSignal = await apiClient.fetchNewSignal(
                currentSignal.signalType,
                currentSignal.horizon,
                allAssetNames,
            );
            await updatePresentDaySignal(type, index, newSignal);
        } catch (e) {
            console.error(`Failed to fetch new ${type} signal at index ${index}`, e);
            setRerollErrors(prev => ({ ...prev, [key]: t.rerollError }));
            setTimeout(() => setRerollErrors(prev => ({ ...prev, [key]: null })), 3000);
        } finally {
            setIsRerolling(prev => ({ ...prev, [key]: false }));
        }
    }, [presentDayData, updatePresentDaySignal, t]);

    const handleAddSignal = useCallback(async (side: 'buy' | 'sell') => {
        if (!presentDayData || isAddingSignal) return;
    
        setIsAddingSignal(side);
        setAddSignalError(null);
    
        const allAssetNames = [
            ...presentDayData.presentDayBuySignals.map(s => s.assetName),
            ...presentDayData.presentDaySellSignals.map(s => s.assetName),
        ];
        
        const signalType = side === 'buy' ? 'COMPRA' : 'VENDA';
        const horizonLabel = HORIZON_LABELS[tabH];
    
        try {
            const newSignal = await apiClient.fetchNewSignal(
                signalType,
                horizonLabel,
                allAssetNames,
            );
            addPresentDaySignal(side, newSignal); 
        } catch (e) {
            console.error(`Failed to add new ${side} signal`, e);
            setAddSignalError(t.rerollError); // reuse translation
            setTimeout(() => setAddSignalError(null), 3000); // show error briefly
        } finally {
            setIsAddingSignal(null);
        }
    }, [presentDayData, isAddingSignal, tabH, addPresentDaySignal, t.rerollError]);
    
    const { presentDayBuySignals, presentDaySellSignals, presentDayStrengths, presentDayWeaknesses } = presentDayData || {};
    
    const matchesHorizonLabel = useCallback((signal: PresentDayAssetSignal, horizonKey: HorizonKey) => {
        const label = HORIZON_LABELS[horizonKey];
        return String(signal?.horizon).trim() === label;
    }, []);

    const buyFiltered = useMemo(
        () => (presentDayBuySignals || [])
          .map((signal, index) => ({ signal, originalIndex: index }))
          .filter(item => matchesHorizonLabel(item.signal, tabH)),
        [presentDayBuySignals, tabH, matchesHorizonLabel]
    );

    const sellFiltered = useMemo(
        () => (presentDaySellSignals || [])
          .map((signal, index) => ({ signal, originalIndex: index }))
          .filter(item => matchesHorizonLabel(item.signal, tabH)),
        [presentDaySellSignals, tabH, matchesHorizonLabel]
    );
    
    if (isInitialLoading) return <PresentDaySignalCardSkeleton />;
    if (!presentDayData) return null;

    const allSignals = [...(presentDayBuySignals || []), ...(presentDaySellSignals || [])];
    const parseProbability = (probString?: string) => parseFloat(String(probString || '0').replace('%','')) || 0;
    
    const topAssets = [...allSignals]
        .sort((a, b) => parseProbability(b.probability) - parseProbability(a.probability))
        .slice(0, 3)
        .map(s => s.assetName);
        
    const dominantTrend = (presentDayBuySignals?.length || 0) >= (presentDaySellSignals?.length || 0) 
        ? t.marketUp
        : t.marketDown;

    const totalConfidence = allSignals.reduce((acc, signal) => acc + parseProbability(signal.probability), 0);
    const averageConfidence = allSignals.length > 0 ? totalConfidence / allSignals.length : 0;

  return (
    <div className="relative">
        {isRecalculating && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}
        <div className="space-y-10">
            <div className="bg-surface/50 border border-border/50 rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-primary mb-4">{t.riskAnalysisTitle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                        <div className="flex-shrink-0 text-green-400 mt-1"><GoIcon className="h-6 w-6" /></div>
                        <div>
                            <h6 className="font-bold text-green-300">{t.strongPoints}</h6>
                            <p className="text-sm text-text-secondary mt-1">{presentDayStrengths}</p>
                        </div>
                    </div>
                    <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <div className="flex-shrink-0 text-red-400 mt-1"><CautionIcon className="h-6 w-6" /></div>
                        <div>
                            <h6 className="font-bold text-red-300">{t.weakPointsAndRisks}</h6>
                            <p className="text-sm text-text-secondary mt-1">{presentDayWeaknesses}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <div className="bg-surface/50 border border-border/50 rounded-lg p-6 shadow-lg mb-6">
                  <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>{t.daySummary}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-text-secondary font-bold uppercase tracking-wider">{t.top3Assets}</p>
                      <p className="text-lg font-semibold text-white mt-1" title={topAssets.length > 0 ? topAssets.join(', ') : t.noAssets}>
                        {topAssets.length > 0 ? topAssets.join(', ') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary font-bold uppercase tracking-wider">{t.dominantTrend}</p>
                      <p className="text-lg font-semibold text-white mt-1">{dominantTrend}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary font-bold uppercase tracking-wider">{t.avgConfidence}</p>
                      <p className="text-lg font-semibold text-white mt-1">{averageConfidence.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                    <div className={`bg-gradient-to-br ${tabSide === 'buy' ? 'from-green-600/20 border-green-500/50' : 'from-red-600/20 border-red-500/50'} via-surface/50 to-surface/90 border rounded-lg p-4 md:p-6 shadow-2xl relative overflow-hidden`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                            <div className="flex items-center text-white">
                                <div className={`bg-${tabSide === 'buy' ? 'green' : 'red'}-500/20 p-3 rounded-full`}>
                                    {tabSide === 'buy' ? <BuyIcon className="h-8 w-8 text-green-300" /> : <SellIcon className="h-8 w-8 text-red-300" />}
                                </div>
                                <h3 className="text-2xl font-bold ml-4">{tabSide === 'buy' ? t.buyOpportunities : t.sellOpportunities}</h3>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                 <button onClick={() => setTabSide("buy")} className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-colors ${tabSide === "buy" ? "bg-success text-white shadow-md" : "bg-surface hover:bg-border text-text-secondary"}`}>
                                    {t.buy}
                                </button>
                                <button onClick={() => setTabSide("sell")} className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-colors ${tabSide === "sell" ? "bg-danger text-white shadow-md" : "bg-surface hover:bg-border text-text-secondary"}`}>
                                    {t.sell}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-6 border-t border-b border-border/50 py-4">
                            <span className="text-sm font-semibold text-text-secondary mr-2">Horizonte:</span>
                            {(Object.keys(HORIZON_LABELS) as HorizonKey[]).map(h =>(
                              <button key={h}
                                onClick={()=>setTabH(h)}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${tabH === h ? "bg-primary text-white" : "bg-surface hover:bg-border text-text-secondary"}`}>
                                {HORIZON_LABELS[h]}
                              </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                           {horizonsLoading[tabH] ? (
                                [...Array(4)].map((_, i) => <SignalBlockSkeleton key={i} />)
                           ) : (
                                <SignalGrid
                                    signals={tabSide === 'buy' ? buyFiltered : sellFiltered}
                                    side={tabSide}
                                    onReroll={handleReroll}
                                    onAddSignal={handleAddSignal}
                                    isRerolling={isRerolling}
                                    isAddingSignal={isAddingSignal}
                                    rerollErrors={rerollErrors}
                                    t={t}
                               />
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PresentDaySignalCard;