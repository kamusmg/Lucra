


import React from 'react';

interface EvolutionPromptBoxProps {
    promptText: string;
    correctionSuggestion: string;
}

const EvolutionPromptBox: React.FC<EvolutionPromptBoxProps> = ({ promptText, correctionSuggestion }) => {
    return (
        <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Requisição de Upgrade (Alpha para Forge)</h4>
            <div className="bg-background/50 border border-border rounded-lg p-4">
                 <h5 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Sugestão Técnica</h5>
                <p className="text-text-secondary leading-relaxed mb-4">{correctionSuggestion}</p>
                <div className="border-t border-border pt-4">
                    <h5 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Diretiva de Evolução para o Forge</h5>
                    <pre className="text-text-secondary whitespace-pre-wrap text-sm leading-relaxed overflow-x-auto font-mono bg-black/20 p-3 rounded">
                        {promptText}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default EvolutionPromptBox;