

import React from 'react';
import { SelfAnalysis } from '../types.ts';
import GoIcon from './GoIcon.tsx';
import CautionIcon from './CautionIcon.tsx';

interface SelfAnalysisCardProps {
    analysis: SelfAnalysis;
    backtestStrengths: string;
    backtestWeaknesses: string;
}

const SelfAnalysisCard: React.FC<SelfAnalysisCardProps> = ({ analysis, backtestStrengths, backtestWeaknesses }) => {
    return (
        <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Relatório de Diagnóstico (Alpha)</h4>
            <div className="bg-background/50 p-4 rounded-lg border border-border/50 space-y-6">
                <div>
                    <h5 className="font-bold text-text mb-2">Análise Técnica da Falha (Backtest)</h5>
                    <p className="text-text-secondary leading-relaxed"><strong className="text-text">Diagnóstico:</strong> {analysis.errorExplanation}</p>
                    <p className="text-text-secondary mt-2"><strong className="text-text">Análise do Modelo com Falha:</strong> {analysis.failedModel}</p>
                </div>
                <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-r-lg">
                    <h5 className="text-sm font-bold text-danger uppercase tracking-wider mb-2">Análise de Impacto do Erro (Backtest)</h5>
                    <p className="text-red-300 italic">{analysis.errorImpactAnalysis}</p>
                </div>
                
                <div className="pt-6 border-t border-border/50">
                    <h5 className="font-bold text-text mb-3">Análise de Desempenho do Backtest</h5>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                             <div className="flex-shrink-0 text-green-400 mt-1">
                                <GoIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h6 className="font-bold text-green-300">Pontos Fortes Validados</h6>
                                <p className="text-sm text-text-secondary mt-1">{backtestStrengths}</p>
                            </div>
                        </div>
                         <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                            <div className="flex-shrink-0 text-red-400 mt-1">
                                <CautionIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h6 className="font-bold text-red-300">Fraquezas Críticas Identificadas</h6>
                                <p className="text-sm text-text-secondary mt-1">{backtestWeaknesses}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelfAnalysisCard;