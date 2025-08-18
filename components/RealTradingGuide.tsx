
import React from 'react';
import RocketIcon from './RocketIcon';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="pt-6 mt-6 border-t border-border/50">
        <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>
        <div className="space-y-4 text-text-secondary leading-relaxed">{children}</div>
    </div>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4">
        <h4 className="text-lg font-semibold text-text mb-2">{title}</h4>
        <div className="space-y-3 text-sm">{children}</div>
    </div>
);

const CodeBlock: React.FC<{ children: string }> = ({ children }) => (
    <pre className="bg-black/30 text-sm text-cyan-300 p-4 rounded-lg overflow-x-auto font-mono scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
        <code>{children.trim()}</code>
    </pre>
);

const RealTradingGuide: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-surface to-background/50 border border-border/70 rounded-xl p-6 shadow-lg mt-12">
            <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-2 rounded-full">
                    <RocketIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-text ml-4">Como Transformar seu Alpha Engine em Sistema de Trading Real</h2>
            </div>
            
            <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-r-lg mb-6">
                <h4 className="font-bold text-danger">AVISO IMPORTANTE</h4>
                <p className="text-red-300">Crypto trading é <strong>EXTREMAMENTE ARRISCADO</strong>. Nunca invista mais do que pode perder. A maioria dos traders perde dinheiro. Comece sempre com valores pequenos para testar.</p>
            </div>

            <Section title="1. Dados de Mercado em Tempo Real">
                <SubSection title="APIs Essenciais para Integrar:">
                    <div>
                        <h5 className="font-bold text-base text-white">🥇 Binance API (Gratuita + Paga)</h5>
                        <p><strong>Prós:</strong> Oferece vários endpoints para dados ao vivo, incluindo preços de mercado, dados do livro de ordens e histórico de negociações</p>
                        <p><strong>Contras:</strong> Rate limits, necessita autenticação para dados avançados</p>
                        <CodeBlock>{`
// Exemplo de integração no seu código:
const binanceWS = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
binanceWS.on('message', (data) => {
  const ticker = JSON.parse(data);
  // Integrar com seu geminiService.ts
});
                        `}</CodeBlock>
                    </div>
                    <div>
                        <h5 className="font-bold text-base text-white">🥈 CoinMarketCap API</h5>
                        <p><strong>Vantagem:</strong> Fornece acesso a preços em tempo real, capitalização de mercado e dados de volume de 24 horas</p>
                        <p><strong>Uso:</strong> Dados gerais de mercado, menos específico para trading</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-base text-white">🥉 Coinbase Advanced Trade API</h5>
                        <p><strong>Vantagem:</strong> Automatize suas negociações em minutos na plataforma de trading crypto mais confiável</p>
                        <p><strong>Uso:</strong> Para execução real de ordens</p>
                    </div>
                </SubSection>
            </Section>

            <Section title="2. Gestão de Risco (CRÍTICO!)">
                <SubSection title="Regras de Ouro:">
                     <div>
                        <h5 className="font-bold text-base text-white">📏 Position Sizing</h5>
                        <p>Position sizing é um método estratégico onde você aloca uma porção do capital de trading para cada negociação</p>
                        <p className="font-semibold text-text mt-2">Fórmula Básica:</p>
                        <CodeBlock>
Tamanho da Posição = (Capital Total × % de Risco) ÷ Distância do Stop Loss
                        </CodeBlock>
                    </div>
                    <div>
                        <h5 className="font-bold text-base text-white">📉 Máximo de Risco por Trade</h5>
                         <ul className="list-disc list-inside space-y-1">
                            <li><strong>Iniciante:</strong> Talvez seja melhor reduzir seu risco por trade de 8% para 4%</li>
                            <li><strong>Experiente:</strong> Máximo 2-3% do capital total por operação</li>
                            <li><strong>Nunca:</strong> Mais de 10% em uma única operação</li>
                        </ul>
                    </div>
                     <div>
                        <h5 className="font-bold text-base text-white">🛑 Drawdown Protection</h5>
                         <p>Bots avançados podem ser programados para parar de negociar ou reduzir o tamanho da posição se o drawdown exceder um limite específico (por exemplo, 10% do patrimônio da conta)</p>
                    </div>
                </SubSection>
            </Section>

            <Section title="3. Modificações no Seu Código">
                 <SubSection title="A. Adicionar Dados Reais">
                    <CodeBlock>{`
// No seu geminiService.ts, adicione:
interface RealTimeData {
  price: number;
  volume: number;
}
//...
`}</CodeBlock>
                 </SubSection>
            </Section>
        </div>
    );
};

export default RealTradingGuide;