
import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import BookOpenIcon from './BookOpenIcon';

const GlossaryItem: React.FC<{ title: React.ReactNode; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">{title}</h4>
        <div className="space-y-2 text-text-secondary border-l-2 border-border/50 pl-4">{children}</div>
    </div>
);

const GradeTag: React.FC<{grade: 'A' | 'B' | 'C'}> = ({ grade }) => {
    const gradeConfig: { [key: string]: string } = {
        'A': 'bg-green-500 text-white',
        'B': 'bg-blue-500 text-white',
        'C': 'bg-yellow-500 text-black',
    };
    return <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${gradeConfig[grade]}`}>{grade}</span>
}

const Glossary: React.FC = () => {
    return (
        <CollapsibleSection
            title="Entendendo os Termos (Glossário)"
            icon={<BookOpenIcon className="h-8 w-8 text-primary" />}
            defaultOpen={false}
        >
            <p className="text-sm text-text-secondary mb-8">
                Aqui você encontra explicações claras e resumidas sobre os principais conceitos e métricas usados pela IA para gerar as análises.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                
                <GlossaryItem title={<>Pilares de Análise da IA</>}>
                    <p><strong>Análise Fundamentalista:</strong> Avalia a saúde de um projeto (tecnologia, equipe, etc.) para determinar seu valor a longo prazo, resultando em uma "Nota" (ex: <GradeTag grade="A" />, <GradeTag grade="B" />, <GradeTag grade="C" />).</p>
                    <p><strong>Inteligência On-Chain:</strong> Monitora a atividade na blockchain (movimentação de baleias, etc.) para identificar sinais de compra ou venda em tempo real.</p>
                </GlossaryItem>

                 <GlossaryItem title="Métricas de Risco e Oportunidade">
                    <p><strong>Índice de Validação de Liquidez (IVL):</strong> Uma pontuação de 0 a 100 que mede a força da liquidez e do interesse de compra. Um IVL alto confirma a demanda e aumenta a confiança no sinal.</p>
                    <p><strong>Valor do Risco:</strong> O valor máximo em USD que você está disposto a perder em uma única operação, com base no seu capital e risco definidos.</p>
                    <p><strong>Tamanho da Posição:</strong> O montante em USD que a IA recomenda alocar para uma operação, calculado para que uma perda no stop-loss não exceda seu "Valor do Risco".</p>
                </GlossaryItem>

                <GlossaryItem title="Qualidade do Sinal">
                    <p><strong>Checklist de Entrada:</strong> Uma nota final de 0 a 10 que a IA dá à qualidade do ponto de entrada, avaliando 5 critérios técnicos (RSI, candle, etc.).</p>
                    <p><strong>Probabilidade:</strong> A confiança da IA, em porcentagem, de que a operação atingirá o alvo antes do stop-loss.</p>
                    <p><strong>Risco/Retorno:</strong> A relação lucro/perda potencial. Um valor de 1:2 significa que o lucro esperado é o dobro do risco.</p>
                </GlossaryItem>

                <GlossaryItem title="Painel de Performance">
                    <p><strong>Taxa de Acerto:</strong> A porcentagem de operações que resultaram em lucro.</p>
                    <p><strong>Fator de Lucro:</strong> A razão entre o lucro bruto total e o prejuízo bruto total. Acima de 1 indica um sistema lucrativo.</p>
                    <p><strong><span className="text-success">Lucro</span>/<span className="text-danger">Prejuízo</span> (Líquido):</strong> O resultado financeiro em tempo real de uma posição aberta ou final de uma posição fechada, já descontando taxas e slippage (derrapagem) simulados.</p>
                </GlossaryItem>

                <GlossaryItem title="Análise de Contexto">
                    <p><strong>Regime de Mercado:</strong> A classificação da IA sobre o estado atual do mercado (<span className="text-success font-semibold">Rali de Alta</span>, <span className="text-danger font-semibold">Tendência de Baixa</span>, <span className="text-blue-400 font-semibold">Lateral</span>, ou <span className="text-yellow-400 font-semibold">Incerteza</span>).</p>
                    <p><strong>Sentimento de Mercado:</strong> Uma pontuação de 0 a 100 que mede o humor geral do mercado (medo vs. ganância) com base em notícias e redes sociais.</p>
                </GlossaryItem>

                <GlossaryItem title="Setups de Automação">
                     <p>Sugestões de configuração para bots de trading:</p>
                    <ul className="list-disc list-inside pl-2">
                        <li><strong>DCA (Dollar Cost Averaging):</strong> Ideal para acumulação, comprando mais à medida que o preço cai.</li>
                        <li><strong>Grid:</strong> Perfeito para mercados laterais, lucrando com pequenas flutuações de preço.</li>
                    </ul>
                </GlossaryItem>
                
            </div>
        </CollapsibleSection>
    );
};

export default Glossary;