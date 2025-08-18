
import React, { useState, useEffect } from 'react';
import { SelfAnalysis, BacktestAnalysisResult } from '../types.ts';
import SelfAnalysisCard from './SelfAnalysisCard.tsx';
import UserIcon from './UserIcon.tsx';
import { apiClient } from '../services/api/bootstrap.ts';
import EvolutionCycleCardSkeleton from './skeletons/EvolutionCycleCardSkeleton.tsx';
import CopyIcon from './CopyIcon.tsx';
import CheckIcon from './CheckIcon.tsx';
import BrainIcon from './BrainIcon.tsx';

// Icons
const CodeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const SupervisorDirectiveDisplay: React.FC<{
    isLoading: boolean;
    error: string | null;
    directive: string | null;
}> = ({ isLoading, error, directive }) => {
    if (isLoading) {
        return (
            <div className="bg-background/50 border border-border/50 rounded-lg p-6 space-y-4 animate-pulse">
                <div className="h-4 bg-border rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-border rounded w-full"></div>
                <div className="h-4 bg-border rounded w-full"></div>
                <div className="h-4 bg-border rounded w-2/3"></div>
                <p className="text-secondary text-sm font-semibold pt-4">A IA Supervisora está analisando o relatório da Alpha...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-danger/10 border border-danger/50 rounded-lg p-6 text-center text-danger">
                <h4 className="font-bold">Erro na Análise da Supervisora</h4>
                <p className="text-sm">{error}</p>
            </div>
        );
    }
    
    if (!directive) return null;

    return (
        <div className="bg-background/50 border-2 border-secondary/50 rounded-lg p-4">
             <pre className="text-text-secondary whitespace-pre-wrap text-sm leading-relaxed overflow-x-auto font-mono bg-black/20 p-3 rounded">
                {directive}
            </pre>
        </div>
    );
};

interface EvolutionCycleCardProps {
    backtestData: BacktestAnalysisResult | null;
}

const EvolutionCycleCard: React.FC<EvolutionCycleCardProps> = ({ backtestData }) => {
  const [copied, setCopied] = useState(false);
  const [supervisorDirective, setSupervisorDirective] = useState<string | null>(null);
  const [isLoadingSupervisor, setIsLoadingSupervisor] = useState(true);
  const [supervisorError, setSupervisorError] = useState<string | null>(null);

  useEffect(() => {
    const getDirective = async (analysis: SelfAnalysis, promptText: string) => {
        try {
            setIsLoadingSupervisor(true);
            setSupervisorError(null);
            const data = await apiClient.fetchSupervisorDirective(analysis, promptText);
            setSupervisorDirective(data.directive);
        } catch (e: any) {
            setSupervisorError(e.message || "Não foi possível carregar a diretiva da IA Supervisora.");
        } finally {
            setIsLoadingSupervisor(false);
        }
    };

    if (backtestData?.selfAnalysis && backtestData?.evolutionPrompt) {
        getDirective(backtestData.selfAnalysis, backtestData.evolutionPrompt);
    } else {
        setIsLoadingSupervisor(false);
    }
  }, [backtestData]);

  if (!backtestData) {
      return <EvolutionCycleCardSkeleton />;
  }

  const { selfAnalysis, evolutionPrompt, backtestStrengths, backtestWeaknesses, versionId, dateGenerated } = backtestData;

  const handleCopy = () => {
    if (!supervisorDirective) return;
    navigator.clipboard.writeText(supervisorDirective);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  
  return (
    <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg relative">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="text-3xl font-bold text-text">Ciclo de Evolução Automatizado</h3>
            <p className="text-text-secondary max-w-4xl">
                A IA 'Alpha' analisa seu desempenho, a IA 'Supervisora' refina a requisição de upgrade e você autoriza a evolução para o 'Forge' com um clique.
            </p>
        </div>
        <div className="text-right text-xs text-text-secondary flex-shrink-0 ml-4">
            <p><strong>ID da Versão:</strong></p>
            <p className="font-mono">{versionId}</p>
            <p className="mt-1"><strong>Gerado em:</strong></p>
            <p className="font-mono">{dateGenerated}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 my-8 p-4 bg-background/30 rounded-lg">
          <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full border-2 border-primary/30">
                  <BrainIcon className="h-10 w-10 text-primary" />
              </div>
              <p className="font-bold text-lg mt-2 text-primary">1. Diagnóstico (Alpha)</p>
          </div>
          <div className="text-4xl font-thin text-text-secondary transform md:-translate-y-4 animate-pulse">→</div>
           <div className="flex flex-col items-center text-center">
              <div className="bg-secondary/10 p-4 rounded-full border-2 border-secondary/30">
                  <UserIcon className="h-10 w-10 text-secondary" />
              </div>
              <p className="font-bold text-lg mt-2 text-secondary">2. Supervisão (IA)</p>
          </div>
          <div className="text-4xl font-thin text-text-secondary transform md:-translate-y-4 animate-pulse">→</div>
           <div className="flex flex-col items-center text-center">
              <div className="bg-gray-500/10 p-4 rounded-full border-2 border-gray-500/30">
                  <CodeIcon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="font-bold text-lg mt-2 text-gray-400">3. Ação (Você para o Forge)</p>
          </div>
      </div>
      
      <div className="space-y-8 mt-8">
        {/* Etapa 1: Diagnóstico da Alpha */}
        <SelfAnalysisCard 
          analysis={selfAnalysis} 
          backtestStrengths={backtestStrengths}
          backtestWeaknesses={backtestWeaknesses}
        />
        
        {/* Etapa 2: Análise da Supervisora */}
         <div className="pt-8 mt-8 border-t border-border/50">
            <div className="flex items-center mb-6">
                <div className="bg-secondary/10 p-2 rounded-full">
                    <UserIcon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-secondary ml-4">Etapa 2: Análise e Diretiva da IA Supervisora</h3>
            </div>
            <SupervisorDirectiveDisplay
                isLoading={isLoadingSupervisor}
                error={supervisorError}
                directive={supervisorDirective}
            />
        </div>

        {/* Etapa 3: Ação do Usuário */}
        <div className="text-center pt-8 mt-8 border-t-4 border-primary/50">
            <h4 className="text-xl font-bold text-primary mb-2">Etapa 3: Autorizar Upgrade para o Forge</h4>
            <p className="text-text-secondary text-sm mb-4">A IA Supervisora analisou o relatório e gerou a diretiva final. Copie este prompt e envie-o para o Forge para executar a evolução.</p>
            <button
                onClick={handleCopy}
                className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-80 transition-all duration-200 text-base flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-wait"
                disabled={isLoadingSupervisor || !!supervisorError || copied || !supervisorDirective}
                aria-label="Copiar Diretiva Final para o Forge"
            >
                {copied ? <CheckIcon className="h-5 w-5 mr-2" /> : <CopyIcon className="h-5 w-5 mr-2" />}
                {copied ? 'Diretiva Copiada!' : (isLoadingSupervisor ? 'Aguardando Diretiva...' : 'Copiar Diretiva para o Forge')}
            </button>
        </div>

      </div>
    </div>
  );
};

export default EvolutionCycleCard;