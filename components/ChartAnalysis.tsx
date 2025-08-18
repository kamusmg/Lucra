





import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { apiClient } from '../services/api/bootstrap.ts';
import { ChartAnalysisResult, ChartAnalysisRecommendation } from '../types.ts';
import { formatCurrency, formatPercentage } from '../utils/formatters.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';
import AnimatedDropzoneIcon from './AnimatedDropzoneIcon.tsx';
import CopyIcon from './CopyIcon.tsx';
import CheckIcon from './CheckIcon.tsx';
import ChevronDownIcon from './ChevronDownIcon.tsx';
import ShieldIcon from './ShieldIcon.tsx';
import InfoTooltip from './InfoTooltip.tsx';
import VisualIndicator from './VisualIndicator.tsx';
import SparklesIcon from './SparklesIcon.tsx';

// Icons
const BuyIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>);
const SellIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const ErrorInfoIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);
const RocketIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>);


const ImageDropZone: React.FC<{
    image: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    isLoading: boolean;
    isDisabled?: boolean;
}> = ({ image, onFileChange, fileInputRef, isLoading, isDisabled }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const handleWrapper = (handler: (e: any) => void) => (e: any) => {
        if (isDisabled || isLoading) {
            e.preventDefault();
            return;
        }
        handler(e);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (isDisabled || isLoading) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const syntheticEvent = {
                target: { files: e.dataTransfer.files },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onFileChange(syntheticEvent);
        }
    }
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isDisabled || isLoading) return;
        if(e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
    }
    
    return (
        <div
            onClick={handleWrapper(() => fileInputRef.current?.click())}
            onDrop={handleDrop}
            onDragOver={handleWrapper(e => e.preventDefault())}
            onKeyDown={handleKeyDown}
            tabIndex={isDisabled || isLoading ? -1 : 0}
            className={`relative block w-full h-full rounded-2xl border-2 border-dashed p-4 text-center transition-colors 
                ${isDisabled ? 'border-border/30 bg-background/30 cursor-not-allowed' : 'border-border hover:border-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary'}`}
            aria-disabled={isDisabled}
        >
            <input type="file" ref={fileInputRef} onChange={handleWrapper(onFileChange)} accept="image/*" className="sr-only" disabled={isDisabled || isLoading} />
            
            {image ? (
                <div className="relative h-full">
                    <img src={image} alt={t.chartAnalysisTitle} className={`rounded-lg w-full h-full object-contain ${isLoading ? 'opacity-30' : ''}`} />
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-lg font-semibold text-text animate-pulse">{t.analyzingImage}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className={`p-8 flex flex-col items-center justify-center h-full ${isDisabled ? 'opacity-50' : ''}`}>
                    <AnimatedDropzoneIcon className="mx-auto h-20 w-20 text-text-secondary" />
                    <span className="mt-4 block font-semibold text-text">{t.pasteOrSelect}</span>
                    <span className="mt-1 block text-sm text-text-secondary">{t.waitingForChartSubtitle}</span>
                </div>
            )}
        </div>
    );
};

const Accordion: React.FC<{ title: string; children: React.ReactNode; isAvailable: boolean }> = ({ title, children, isAvailable }) => {
    if (!isAvailable) return null;

    return (
        <details className="group bg-background/30 rounded-lg border border-border/30 transition-all duration-300 open:bg-background/50 open:border-primary/30">
            <summary className="cursor-pointer list-none flex items-center justify-between text-text-secondary hover:text-white p-3 font-semibold transition-colors">
                <span className="font-bold text-sm text-white">{title}</span>
                <ChevronDownIcon className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="border-t border-border/30 px-3 pb-3">
                <div className="mt-2 text-sm text-text-secondary max-h-48 overflow-y-auto pr-2 border-l-2 border-blue-500/30 pl-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
                    {children}
                </div>
            </div>
        </details>
    );
};

const formatKey = (key: string) => {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize each word
};

const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
        return value ? '✅' : '❌';
    }
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    return String(value);
};


const AnalysisResultPanel: React.FC<{ result: ChartAnalysisResult }> = ({ result }) => {
    const { language } = useLanguage();
    const t = translations[language];
    const [isCopied, setIsCopied] = useState(false);

    const { recomendacao } = result;
    const recommendationText = `Análise para ${result.assetIdentification}:\n- Sinal: ${recomendacao.tipo}\n- Entrada: ${formatCurrency(recomendacao.precoEntrada)}\n- Alvo: ${formatCurrency(recomendacao.takeProfit)}\n- Stop: ${formatCurrency(recomendacao.stopLoss)}\n- Confiança: ${formatPercentage(recomendacao.confiancaPercentual)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(recommendationText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const signalConfig = {
        bullish: { color: 'text-success', label: 'Bullish' },
        bearish: { color: 'text-danger', label: 'Bearish' },
        neutral: { color: 'text-blue-400', label: 'Neutral' },
    };

    const recConfig = {
        'COMPRA': { color: 'text-success', Icon: BuyIcon },
        'VENDA': { color: 'text-danger', Icon: SellIcon },
        'LONG': { color: 'text-success', Icon: BuyIcon },
        'SHORT': { color: 'text-danger', Icon: SellIcon },
        'NEUTRO': { color: 'text-blue-400', Icon: SellIcon },
    };

    const currentSignalConfig = signalConfig[result.globalSignal];
    const currentRecConfig = recConfig[result.recomendacao.tipo];
    const isBuySignal = result.recomendacao.tipo === 'COMPRA' || result.recomendacao.tipo === 'LONG';
    
    return (
        <div className="bg-background/50 rounded-2xl p-6 border border-primary/50 animate-fade-in space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-xl font-bold text-white">{result.assetIdentification}</h4>
                    <p className="text-sm text-text-secondary">{result.timeframe}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${currentSignalConfig.color.replace('text-','bg-')}/20 ${currentSignalConfig.color}`}>
                    <span>{currentSignalConfig.label}</span>
                </div>
            </div>
            <div className={`bg-gradient-to-br ${isBuySignal ? 'from-green-600/20' : 'from-red-600/20'} via-surface/30 to-surface/60 border ${isBuySignal ? 'border-green-500/50' : 'border-red-500/50'} rounded-lg p-4`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`${currentRecConfig.color.replace('text-','bg-')}/20 p-2 rounded-full`}>
                        <currentRecConfig.Icon className={`h-6 w-6 ${currentRecConfig.color}`} />
                    </div>
                    <h5 className="text-lg font-bold text-white">{t.operationalSummary}: {result.recomendacao.tipo}</h5>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-xs text-text-secondary uppercase font-bold">{t.entry}</p>
                        <p className="text-base font-semibold text-white mt-1">{formatCurrency(result.recomendacao.precoEntrada)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-green-400 uppercase font-bold">{t.target}</p>
                        <p className="text-base font-semibold text-white mt-1">{formatCurrency(result.recomendacao.takeProfit)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-red-400 uppercase font-bold">{t.stop}</p>
                        <p className="text-base font-semibold text-white mt-1">{formatCurrency(result.recomendacao.stopLoss)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase font-bold">{t.confidence}</p>
                        <VisualIndicator percentage={result.recomendacao.confiancaPercentual} />
                    </div>
                </div>
            </div>
            <Accordion title={t.technicalDriversTitle} isAvailable={!!result.technicalDrivers && Object.keys(result.technicalDrivers).length > 0}>
                <div className="space-y-1.5">
                    {result.technicalDrivers && Object.entries(result.technicalDrivers).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center gap-2">
                            <span className="text-text-secondary truncate">{formatKey(key)}:</span>
                            <span className="font-semibold text-white text-right bg-background/50 px-2 py-0.5 rounded">
                                {formatValue(value)}
                            </span>
                        </div>
                    ))}
                </div>
            </Accordion>
            <Accordion title={t.tradeRationaleTitle} isAvailable={!!(result.strongPoints?.length || result.weakPoints?.length)}>
                <div className="space-y-3">
                    {result.strongPoints && result.strongPoints.length > 0 && (
                        <div>
                            <h6 className="font-bold text-green-400">{t.strongPoints}</h6>
                            <ul className="list-disc list-inside pl-2">
                                {result.strongPoints.map((point, i) => <li key={`strong-${i}`}>{point}</li>)}
                            </ul>
                        </div>
                    )}
                    {result.weakPoints && result.weakPoints.length > 0 && (
                         <div>
                            <h6 className="font-bold text-red-400">{t.weakPoints}</h6>
                            <ul className="list-disc list-inside pl-2">
                                {result.weakPoints.map((point, i) => <li key={`weak-${i}`}>{point}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </Accordion>
            <div className="mt-4">
                <button onClick={handleCopy} className="w-full bg-secondary/20 text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-secondary/30 transition-colors flex items-center justify-center gap-2">
                    {isCopied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
                    {isCopied ? t.setupCopied : t.copySetup}
                </button>
            </div>
        </div>
    );
};


const ChartAnalysis: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<ChartAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImage(base64String);
                handleSubmit(base64String, file.type);
            };
            reader.readAsDataURL(file);
        }
    }, [language]);

    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                if (!blob) continue;

                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setImage(base64String);
                    handleSubmit(base64String, blob.type);
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    }, [language]);

    useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const handleSubmit = async (base64Image: string, mimeType: string) => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await apiClient.analyzeChartImage(base64Image.split(',')[1], mimeType, language);
            setResult(data);
        } catch (e: any) {
            setError(t.analysisFailed);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-2 rounded-full">
                    <SparklesIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-text ml-4">{t.chartAnalysisTitle}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                <div className="md:col-span-1">
                    <ImageDropZone 
                        image={image}
                        onFileChange={handleFileChange}
                        fileInputRef={fileInputRef}
                        isLoading={isLoading}
                    />
                </div>
                <div className="md:col-span-1 flex flex-col items-center justify-center">
                    {isLoading ? (
                         <div className="text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-lg font-semibold text-primary animate-pulse">{t.analyzingImage}</p>
                        </div>
                    ) : error ? (
                        <div className="text-center p-4 bg-danger/20 text-danger rounded-lg">
                            <ErrorInfoIcon className="mx-auto h-10 w-10" />
                            <p className="mt-2 font-semibold">{error}</p>
                        </div>
                    ) : result ? (
                        <AnalysisResultPanel result={result} />
                    ) : (
                         <div className="text-center p-4">
                            <RocketIcon className="mx-auto h-16 w-16 text-text-secondary opacity-30" />
                            <h4 className="mt-4 text-lg font-semibold text-text">{t.waitingForChartTitle}</h4>
                            <p className="text-sm text-text-secondary">{t.waitingForChartSubtitle}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChartAnalysis;