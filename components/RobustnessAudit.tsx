
import React, { useState, useCallback } from 'react';
import { apiClient } from '../services/api/bootstrap.ts';
import { AuditReport } from '../types.ts';
import { formatCurrency, formatPercentage } from '../utils/formatters.ts';
import ShieldCheckIcon from './ShieldCheckIcon.tsx';
import GoIcon from './GoIcon.tsx';
import CautionIcon from './CautionIcon.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { translations } from '../utils/translations.ts';

// Circular Progress Bar Component
const CircularProgress: React.FC<{ percentage: number; color: string; trackColor: string }> = ({ percentage, color, trackColor }) => {
    const radius = 50;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
            <circle
                stroke={trackColor}
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke={color}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};

const RobustnessAudit: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunAudit = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAuditReport(null);
        try {
            const report = await apiClient.fetchRobustnessAudit();
            setAuditReport(report);
        } catch (e: any) {
            setError(e.message || "Falha ao executar a auditoria.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-6">
                <div className="bg-secondary/10 p-2 rounded-full">
                    <ShieldCheckIcon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-text ml-4">{t.robustnessAuditTitle}</h3>
            </div>
            <p className="text-text-secondary max-w-4xl mb-6">
                {t.robustnessAuditDescription}
            </p>

            {!auditReport && !isLoading && !error && (
                <div className="text-center py-8">
                    <button
                        onClick={handleRunAudit}
                        className="bg-secondary text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-all duration-200 text-base flex items-center justify-center mx-auto"
                    >
                        {t.robustnessAuditRun}
                    </button>
                </div>
            )}

            {isLoading && (
                <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg font-semibold text-secondary animate-pulse">{t.robustnessAuditRunning}</p>
                    <p className="text-sm text-text-secondary">{t.robustnessAuditRunningSub}</p>
                </div>
            )}
            
            {error && (
                 <div className="text-center p-4 bg-danger/20 text-danger rounded-lg">
                    <p className="font-semibold">{t.robustnessAuditError}</p>
                    <p className="text-sm">{error}</p>
                 </div>
            )}

            {auditReport && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Success Rate */}
                        <div className="md:col-span-1 flex flex-col items-center justify-center bg-background/50 p-4 rounded-lg border border-border/50">
                            <div className="relative">
                                <CircularProgress percentage={auditReport.successRate} color={auditReport.successRate >= 85 ? '#22C55E' : '#EF4444'} trackColor="#374151" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-3xl font-bold ${auditReport.successRate >= 85 ? 'text-success' : 'text-danger'}`}>{auditReport.successRate.toFixed(1)}%</span>
                                </div>
                            </div>
                            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mt-2">{t.successRate}</h4>
                        </div>
                        {/* Net Profit & Conclusion */}
                        <div className="md:col-span-2 bg-background/50 p-6 rounded-lg border border-border/50 space-y-4">
                             <div>
                                <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider">{t.totalNetResult}</h4>
                                <div className="flex items-baseline gap-4">
                                    <p className={`text-4xl font-bold ${auditReport.totalNetProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {formatCurrency(auditReport.totalNetProfit)}
                                    </p>
                                    <p className={`text-2xl font-semibold ${auditReport.totalNetProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                        ({formatPercentage(auditReport.totalNetProfitPercentage)})
                                    </p>
                                </div>
                                <p className="text-sm text-text-secondary">{t.totalNetResultSub}</p>
                            </div>
                            <div className="border-t border-border/50 pt-4">
                                <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider">{t.auditConclusion}</h4>
                                <p className={`text-2xl font-bold ${auditReport.robustnessConclusion === 'Satisfatório' ? 'text-success' : 'text-danger'}`}>
                                    {auditReport.robustnessConclusion}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Diagnosis */}
                    <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                        <h4 className="text-lg font-bold text-primary mb-2">{t.errorDiagnosis}</h4>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{auditReport.errorDiagnosis}</p>
                    </div>
                    
                    {/* Examples */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 text-green-400 mt-1"><GoIcon className="h-6 w-6" /></div>
                                <div>
                                    <h6 className="font-bold text-green-300">{t.successExamples}</h6>
                                    <ul className="list-disc list-inside text-sm text-text-secondary mt-2 space-y-1">
                                        {auditReport.positiveExamples.map((ex, i) => <li key={`pos-${i}`}>{ex}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                         <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
                             <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 text-red-400 mt-1"><CautionIcon className="h-6 w-6" /></div>
                                <div>
                                    <h6 className="font-bold text-red-300">{t.failureExamples}</h6>
                                     <ul className="list-disc list-inside text-sm text-text-secondary mt-2 space-y-1">
                                        {auditReport.negativeExamples.map((ex, i) => <li key={`neg-${i}`}>{ex}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default RobustnessAudit;