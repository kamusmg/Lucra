
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-screen text-text">
      <div className="p-8 bg-surface border border-danger rounded-lg max-w-md text-center">
        <h2 className="text-2xl font-bold text-danger mb-4">Erro no Motor de Análise</h2>
        <p className="text-text-secondary">Ocorreu um erro ao processar a simulação.</p>
        <p className="mt-4 p-4 bg-background rounded font-mono text-sm text-left">{message}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;