

import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SimulationResult, PresentDayAssetSignal, Horizon, ChartAnalysisResult, SelfAnalysis, ForgeActionPlan, AuditReport, LivePrices, ChartAnalysisRecommendation, BacktestAnalysisResult, PresentDayAnalysisResult, ChecklistResult, GatedSignalResult, MacroIndicator, TacticalIdea, MemeCoinSignal, SentimentAnalysis, Narrative } from '../types.ts';
import { LucraSignal } from '../types/lucra.ts';
import { DateTime } from 'luxon';
import { formatCurrency } from '../utils/formatters.ts';
import { fetchPrices, fetchPriceForTicker } from './marketService.ts';
import { getBinanceServerTime } from './timeService.ts';
import { MIN_ROI, HORIZON_LABELS, TARGET_PER_SIDE } from './horizonPolicy.ts';

// The API key is expected to be managed by the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Cache for Present Day Analysis ---
let lastPresentDayAnalysis: PresentDayAnalysisResult | null = null;
let chat: Chat | null = null;

export const setLastPresentDayAnalysis = (result: PresentDayAnalysisResult) => {
    lastPresentDayAnalysis = result;
};

export const getLastPresentDayAnalysis = (): PresentDayAnalysisResult | null => {
    return lastPresentDayAnalysis;
};


// --- Centralized Directives for Consistency and Performance ---

const marketRegimeDirective = `
    **DIRETIVA DE REGIME DE MERCADO v2.0 - ANÁLISE PRIORITÁRIA**
    Sua primeira e mais importante tarefa é classificar o estado atual do mercado de criptomoedas em um dos seguintes regimes. Esta classificação DEVE ser o primeiro indicador no 'macroContext'.

    **REGIMES POSSÍVEIS:**
    1.  **RALI DE ALTA (Bull Rally):** Tendência de alta clara e sustentada no BTC e ETH. O sentimento geral é otimista (ganância). O capital está fluindo para o mercado.
    2.  **TENDÊNCIA DE BAIXA (Bear Trend):** Tendência de baixa clara e sustentada. O sentimento é pessimista (medo). Fundamentos macroeconômicos negativos.
    3.  **MERCADO LATERAL (Range-Bound / Chop):** Preços se movendo dentro de um range definido, sem direção clara. Períodos de baixa liquidez e volatilidade imprevisível.
    4.  **INCERTEZA VOLÁTIL (Volatile Uncertainty):** Movimentos de preço bruscos e de grande amplitude em ambas as direções. Geralmente ocorre perto de eventos macroeconômicos importantes ou notícias inesperadas.

    Sua análise DEVE começar com esta classificação. O indicador deve se chamar "Regime de Mercado Atual".
`;

const adaptiveRiskDirective = `
    **DIRETIVA DE GESTÃO DE RISCO ADAPTATIVA v1.0 - REGRA MESTRA**
    Com base no 'Regime de Mercado' identificado, você DEVE ajustar seus parâmetros de risco para TODAS as operações. Esta diretiva modifica a RQS padrão.
    
    1.  **SE 'RALI DE ALTA':**
        -   **RR Mínimo:** 1.5 para LONGs.
        -   **RR Mínimo para SHORTs:** 2.0 (Shorts são contra-tendência e mais arriscados).
        -   **Seleção de Ativos:** Priorize altcoins com beta alto e bom momento.
    
    2.  **SE 'TENDÊNCIA DE BAIXA':**
        -   **RR Mínimo:** 1.8 para SHORTs.
        -   **RR Mínimo para LONGs:** 2.5 (Longs são extremamente arriscados).
        -   **Seleção de Ativos:** Priorize SHORTS em ativos com nota fundamental (Grade) 'C' ou inferior.
        
    3.  **SE 'MERCADO LATERAL':**
        -   **RR Mínimo:** 2.0 para TODAS as operações. Aumentamos a exigência para compensar a falta de tendência clara.
        -   **Foco:** Operar apenas em ativos com ranges de preço bem definidos e históricos. Evitar ativos com rompimentos recentes.
        
    4.  **SE 'INCERTEZA VOLÁTIL':**
        -   **Ação Principal:** **NÃO OPERAR**. A prioridade máxima é a preservação de capital.
        -   **RR Mínimo:** 3.0 para qualquer operação considerada. Sinais devem ser 'NEUTRO' por padrão.
        -   **Justificativa:** A justificativa para sinais 'NEUTRO' deve ser "Preservando capital devido à extrema volatilidade e imprevisibilidade do mercado."
`;


const strategyPlaybooksDirective = `
    **DIRETIVA DE PLAYBOOKS DE ESTRATÉGIA v2.0 - TRADING CONTEXTUAL**
    Após determinar o 'Regime de Mercado' e o Risco Adaptativo, você DEVE aplicar o playbook de estratégia correspondente para gerar TODOS os sinais de oportunidade. O objeto 'technicalDrivers' de CADA sinal DEVE refletir qual playbook foi usado.

    **1. PLAYBOOK: RALI DE ALTA (Bull Rally)**
    - **Foco:** COMPRA (Long).
    - **Estratégia Principal:** "Comprar na Baixa" (Buy the Dip). Procure por correções saudáveis e pullbacks para médias móveis de suporte (ex: EMA 21 no gráfico de 4h) como pontos de entrada.
    - **Sinais de VENDA:** Seja extremamente cético. Apenas considere vendas se houver uma forte divergência de baixa em múltiplos timeframes ou sinais claros de exaustão de volume.

    **2. PLAYBOOK: TENDÊNCIA DE BAIXA (Bear Trend)**
    - **Foco:** VENDA (Short).
    - **Estratégia Principal:** "Vender na Alta" (Short the Rip). Procure por ralis de alívio para níveis de resistência chave (ex: último topo rompido) como pontos de entrada para short.
    - **Sinais de COMPRA:** Extremamente arriscados. Apenas considere compras se houver uma capitulação de volume extremo e sinais de reversão muito fortes em timeframes maiores (diário). Use stops curtos.

    **3. PLAYBOOK: MERCADO LATERAL (Range-Bound / Chop)**
    - **Estratégia Principal:** Foco em Reversão à Média. Comprar perto do suporte do range, vender perto da resistência. Priorize ativos com histórico de respeitar os limites do range.
    - **AÇÃO CRÍTICA:** Se o range for muito estreito ou a volatilidade muito errática, a melhor ação é **NÃO OPERAR**. Gere sinais 'NEUTRO' e justifique a decisão de ficar de fora para evitar perdas por 'whipsaws'.

    **4. PLAYBOOK: INCERTEZA VOLÁTIL (Volatile Uncertainty)**
    - **Estratégia Principal:** Evitar o Mercado (Stay Out). A probabilidade de ser "violinado" (stop-hunted) é máxima.
    - **AÇÃO CRÍTICA:** A prioridade é a preservação de capital. Gere predominantemente sinais 'NEUTRO'.
`;


const riskManagementDirective = `
    **DIRETIVA DE GESTÃO DE RISCO E QUALIDADE DE SINAL (RQS) v3.0 - REGRA BASE:**
    Esta é a sua diretiva de risco padrão, mas a **DIRETIVA DE RISCO ADAPTATIVA TEM PRIORIDADE**. Você deve seguir estas regras, a menos que o Risco Adaptativo especifique o contrário.

    1.  **DIREÇÃO DA OPERAÇÃO (FILTRO DE TENDÊNCIA):**
        -   SÓ gere sinais a favor da tendência principal do timeframe do sinal.

    2.  **FILTROS DE ENTRADA (CONFLUÊNCIA OBRIGATÓRIA):**
        -   Uma entrada SÓ é válida se confirmada por, no mínimo, DOIS indicadores técnicos independentes.

    3.  **CÁLCULO DE ALVOS E STOPS (BASEADO EM VOLATILIDADE):**
        -   O alvo DEVE ser realista e baseado em níveis de resistência/suporte.
        -   O stop-loss DEVE ser posicionado em um local técnico válido para evitar ser ativado por ruído.

    4.  **GESTÃO DE RISCO/RECOMPENSA (RR MÍNIMO PADRÃO):**
        -   O RR Mínimo padrão é **1.5**, mas este valor é sobrescrito pela Diretiva de Risco Adaptativa.
`;

const entryRangeRealismDirective = `
    **DIRETIVA DE REALISMO NA FAIXA DE ENTRADA v1.0 - REGRA OBRIGATÓRIA:**
    Feedback do Supervisor: Suas faixas de entrada anteriores ('entryRange') são tecnicamente perfeitas, mas irrealisticamente apertadas. Elas estão fazendo com que as ordens não sejam executadas por margens mínimas (slippage, taxas).

    **AÇÃO CORRETIVA OBRIGATÓRIA:**
    Para CADA SINAL (COMPRA ou VENDA), você DEVE criar uma 'entryRange' mais ampla e prática.
    1.  **Base de Cálculo:** Use um ponto de referência técnico recente e válido (ex: a mínima das últimas 24h para uma COMPRA, ou a máxima para uma VENDA) como ponto de partida.
    2.  **Adicionar "Gordura":** A partir do seu ponto de entrada "ideal", adicione uma margem de segurança para aumentar a probabilidade de execução.
        -   **Para BTC/ETH (Baixa Volatilidade Relativa):** Crie uma faixa com uma amplitude de pelo menos **0.5% a 0.7%**. Exemplo: Se o ponto ideal for $100, a faixa poderia ser "$99.50 - $100.20".
        -   **Para Altcoins (Alta Volatilidade):** Crie uma faixa com uma amplitude de pelo menos **1.0% a 1.5%**. A volatilidade maior exige uma banda mais larga.
    3.  **Justificativa:** Sua lógica deve ser "melhor uma boa entrada executada do que uma entrada perfeita perdida". As faixas devem refletir isso.
`;


const dceDirective = `
    **DIRETIVA DE CHECKLIST DE ENTRADA (DCE) - REGRA PERMANENTE:**
    Para CADA SINAL DE OPORTUNIDADE gerado (compra ou venda), você DEVE executar um checklist técnico e incluir o resultado no campo 'checklistResult'.
    **Critérios de Avaliação (Pontuação de 0 a 10):**
    1.  **RSI(6) (Peso 2):** Long: entre 26-34. Short: entre 66-74.
    2.  **Candle de Reversão (Peso 2):** Candle com corpo cheio e volume crescente na direção do sinal.
    3.  **Estrutura de Média Móvel (Peso 2):** Cruzamento da MA(7) sobre a MA(25) a favor do sinal OU um pullback claro na MA(99).
    4.  **Volume Institucional (Peso 2):** Spike de volume recente (>=30% acima da média das 20 velas).
    5.  **Divergência de Volume (Peso 2):** Ausência de divergências que contradigam o sinal.

    **Output no JSON:**
    - Preencha o objeto 'checklistResult' com:
        - \`pontuacao\`: A soma dos pesos dos critérios atendidos.
        - \`atende_criterios\`: \`true\` se a pontuação for >= 8.5, senão \`false\`.
        - \`motivos\`: Uma lista de strings para CADA UM dos 5 critérios, indicando se passou ou falhou. Ex: "✅ RSI(6) OK: 28.5", "❌ Candle: Sem padrão de reversão claro".
`;

const fundamentalAnalysisDirective = `
    **DIRETIVA DE ANÁLISE FUNDAMENTALISTA (DAF) v1.0 - INSPIRADO NA TOKEN METRICS:**
    Para CADA SINAL gerado, você DEVE realizar uma análise fundamentalista e preencher os seguintes campos:
    1.  **Análise Fundamentalista Detalhada ('fundamentalAnalysis'):**
        -   **technologyScore (0-100):** Avalie a inovação, a utilidade e a robustez da tecnologia subjacente.
        -   **teamScore (0-100):** Avalie a experiência, o histórico e a reputação da equipe principal e dos consultores.
        -   **tokenomicsScore (0-100):** Avalie a distribuição de tokens, o modelo de inflação/deflação e os casos de uso do token.
        -   **developerActivityScore (0-100):** Avalie a frequência e a qualidade dos commits no GitHub e a atividade geral da comunidade de desenvolvedores.
        -   **summary:** Forneça um resumo conciso dos pontos fortes e fracos da análise fundamentalista.
    2.  **Nota Geral ('grade'):** Com base na análise acima e na sua avaliação técnica, atribua uma nota geral ao ativo: 'A' (excepcional), 'B' (sólido), 'C' (médio), 'D' (arriskado), 'F' (evitar).
`;

const structuredDriversDirective = `
    **DIRETIVA DE DRIVERS TÉCNICOS ESTRUTURADOS: REGRA OBRIGATÓRIA**
    Você não usará mais o campo 'technicalJustification'. Em seu lugar, você preencherá o objeto 'technicalDrivers'. Para cada sinal, liste os 3 a 5 indicadores técnicos mais importantes que levaram à sua decisão como chaves neste objeto. O valor deve ser 'true', uma string curta (ex: "bullish", "suporte rompido") ou um número que represente a métrica (ex: RSI: 28). Seja conciso e técnico. Esta é a sua nova forma de justificar a operação. Ex: { "RSI_4H_Divergence": "bullish", "MA_50_Cross_200_1D": true, "volume_spike": "2.5x" }
`;

const presentDaySignalSchema = {
    type: Type.OBJECT,
    properties: {
        assetName: { type: Type.STRING, description: "O nome e ticker do ativo. O universo de análise é unificado e pode incluir BTC, ETH, SOL, etc." },
        signalType: { type: Type.STRING, enum: ['COMPRA', 'VENDA', 'NEUTRO'], description: "O tipo de sinal: COMPRA para long, VENDA para short, ou NEUTRO para não operar." },
        entryRange: { type: Type.STRING, description: "Faixa de preço sugerida para entrada na operação."},
        probability: { type: Type.STRING, description: "A probabilidade de sucesso da operação (e.g., '65%')."},
        target: { type: Type.STRING, description: "O preço alvo para la realização de lucro."},
        stopLoss: { type: Type.STRING, description: "O preço sugerido para o stop-loss."},
        horizon: { type: Type.STRING, enum: ['24 Horas', '7 Dias', '30 Dias', '1 Ano'], description: "O horizonte de tempo da projeção (e.g., '24 Horas', '7 Dias', '30 Dias', '1 Ano')." },
        technicalDrivers: {
            type: Type.OBJECT,
            description: "Objeto estruturado com os 3-5 principais indicadores técnicos que levaram à decisão. Ex: { 'RSI_4H_Divergence': 'bullish', 'MA_50_Cross_200_1D': true }",
            properties: {
                "example_driver": {
                    type: Type.STRING,
                    description: "This is an example. The actual keys will be dynamic indicator names."
                }
            },
            additionalProperties: {
                oneOf: [
                    { type: Type.STRING },
                    { type: Type.BOOLEAN },
                    { type: Type.NUMBER }
                ]
            }
        },
        confidenceLevel: { type: Type.STRING, enum: ['Baixo', 'Médio', 'Alto', 'Low', 'Medium', 'High'], description: "Confidence level of the signal. Use 'Baixo', 'Médio', 'Alto' for Portuguese responses, and 'Low', 'Medium', 'High' for English responses."},
        profitProjectionUsd: { type: Type.NUMBER, description: "Lucro projetado em USD para um investimento de $100, baseado no preço alvo. Positivo para COMPRA se alvo > entrada. Positivo para VENDA se alvo < entrada." },
        roiProjectionPercentage: { type: Type.NUMBER, description: "Retorno sobre o investimento projetado, em porcentagem (calculado a partir do lucro projetado sobre um investimento de $100)." },
        strategy: { type: Type.STRING, enum: ["LONG", "SHORT", "COMPRA", "VENDA Spot"], description: "Tipo de operação: 'LONG', 'SHORT', 'COMPRA Spot', 'VENDA Spot'." },
        entryDatetime: { type: Type.STRING, description: "Data/hora exata para ENTRADA da operação. Formato: DD/MM/AAAA HH:mm:ss" },
        exitDatetime: { type: Type.STRING, description: "Data/hora exata para SAÍDA da operation. Formato: DD/MM/AAAA HH:mm:ss" },
        ivlPercentage: { type: Type.NUMBER, description: "Índice de Fluxo (0-100). Para sinais de COMPRA, representa o IVL (Índice de Validação de Liquidez). Para sinais de VENDA, representa o IPV (Índice de Pressão de Venda). Obrigatório para sinais de COMPRA e VENDA." },
        strongPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Uma lista dos principais pontos fortes que sustentam este sinal específico." },
        weakPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Uma lista dos principais pontos fracos ou riscos associados a este sinal específico." },
        specialModes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Quaisquer modos especiais (como 'Modo Chicote' ou 'VTEX Turbo') que foram ativados para este sinal." },
        grade: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'F'], description: "A nota geral do ativo, de A (excelente) a F (péssimo)." },
        fundamentalAnalysis: {
            type: Type.OBJECT,
            properties: {
                technologyScore: { type: Type.NUMBER },
                teamScore: { type: Type.NUMBER },
                tokenomicsScore: { type: Type.NUMBER },
                developerActivityScore: { type: Type.NUMBER },
                summary: { type: Type.STRING },
            },
            required: ["technologyScore", "teamScore", "tokenomicsScore", "developerActivityScore", "summary"]
        },
        checklistResult: {
            type: Type.OBJECT,
            properties: {
                atende_criterios: { type: Type.BOOLEAN },
                pontuacao: { type: Type.NUMBER },
                motivos: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["atende_criterios", "pontuacao", "motivos"]
        },
        onChainIntelligence: {
            type: Type.OBJECT,
            properties: {
                alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING },
            },
            required: ["alerts", "summary"]
        },
        automationSetup: {
            type: Type.OBJECT,
            properties: {
                recommendedBot: { type: Type.STRING, enum: ['DCA', 'Grid', 'Nenhum'] },
                justification: { type: Type.STRING },
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        baseOrderSize: { type: Type.STRING },
                        safetyOrderSize: { type: Type.STRING },
                        priceDeviation: { type: Type.STRING },
                        safetyOrderSteps: { type: Type.NUMBER },
                        upperPrice: { type: Type.STRING },
                        lowerPrice: { type: Type.STRING },
                        gridLevels: { type: Type.NUMBER },
                        investmentPerLevel: { type: Type.STRING },
                    },
                },
            },
            required: ["recommendedBot", "justification", "parameters"]
        },
        isTopSignal: { type: Type.BOOLEAN, description: "Será 'true' para a melhor oportunidade do dia, 'false' para as outras." },
        recommendedPositionSize: { type: Type.NUMBER, description: "O tamanho da posição calculado em USD, com base no risco dinâmico." },
        riskPerTrade: { type: Type.NUMBER, description: "O valor do risco em USD para esta operação específica." },
    },
    required: ["assetName", "signalType", "entryRange", "probability", "target", "stopLoss", "horizon", "technicalDrivers", "confidenceLevel", "profitProjectionUsd", "roiProjectionPercentage", "strategy", "entryDatetime", "exitDatetime", "grade", "fundamentalAnalysis", "onChainIntelligence", "automationSetup", "isTopSignal", "recommendedPositionSize", "riskPerTrade"],
};


const macroIndicatorSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Nome do indicador macro. Ex: 'Regime de Mercado Atual'" },
        value: { type: Type.STRING, description: "O valor ou estado atual do indicador. Ex: 'Rali de Alta'" },
        interpretation: { type: Type.STRING, description: "Breve interpretação do estado atual do indicador. Ex: 'Foco em estratégias de compra na baixa.'" },
        status: { type: Type.STRING, enum: ['critical', 'warning', 'neutral', 'good'], description: "Um status para color-coding na UI."}
    },
    required: ["name", "value", "interpretation", "status"]
};

const presentDayAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        macroContext: { type: Type.ARRAY, description: "CRÍTICO: Um array com o estado atual dos seus modelos de análise macro. DEVE começar com o 'Regime de Mercado Atual' e incluir de 5 a 7 outros indicadores. Se necessário, use métricas técnicas (RSI do BTC) para atingir o total.", items: macroIndicatorSchema },
        presentDayBuySignals: { type: Type.ARRAY, description: "Array de sinais de 'COMPRA' para o dia. O número de sinais é alocado dinamicamente com base no regime de mercado.", items: presentDaySignalSchema },
        presentDaySellSignals: { type: Type.ARRAY, description: "Array de sinais de 'VENDA' (short) para o dia. O número de sinais é alocado dinamicamente com base no regime de mercado.", items: presentDaySignalSchema },
        presentDayStrengths: { type: Type.STRING, description: "Justificativa curta dos PONTOS FORTES das operações recomendadas para o PRESENTE." },
        presentDayWeaknesses: { type: Type.STRING, description: "Justificativa curta das FRAQUEZAS ou RISCOS das operações recomendadas para o PRESENTE." },
    },
    required: ["macroContext", "presentDayBuySignals", "presentDaySellSignals", "presentDayStrengths", "presentDayWeaknesses"],
};

const narrativeSchema = {
    type: Type.OBJECT,
    properties: {
        narrative: { type: Type.STRING, description: "O nome da narrativa (ex: 'ETFs Spot')." },
        context: { type: Type.STRING, description: "Uma única frase explicando o que é essa narrativa e por que ela é relevante para o ativo agora." },
        impact: { type: Type.STRING, enum: ['Alto', 'Médio', 'Baixo'], description: "O impacto potencial classificado da narrativa no preço do ativo." },
    },
    required: ["narrative", "context", "impact"],
};

const sentimentAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        assetTicker: { type: Type.STRING },
        sentimentScore: { type: Type.NUMBER },
        sentimentLabel: { type: Type.STRING, enum: ['Muito Baixista', 'Baixista', 'Neutro', 'Altista', 'Muito Altista', 'Very Bearish', 'Bearish', 'Neutral', 'Bullish', 'Very Bullish'] },
        dominantNarratives: { type: Type.ARRAY, items: narrativeSchema },
        intelligenceBriefing: { type: Type.STRING, description: "Um parágrafo coeso que sintetiza a análise e seu impacto potencial no preço." },
    },
    required: ["assetTicker", "sentimentScore", "sentimentLabel", "dominantNarratives", "intelligenceBriefing"],
};

/**
 * Fetches the present-day analysis part of the simulation.
 * This function requires live price data to be passed in.
 */
export const fetchPresentDayAnalysis = async (livePrices: LivePrices | null, totalCapital: number, riskPercentage: number, feedbackDirective?: string): Promise<PresentDayAnalysisResult> => {
    if (!livePrices || !livePrices['BTC'] || !livePrices['ETH']) {
        throw new Error('Falha ao obter dados críticos de mercado (BTC/ETH). A análise não pode prosseguir.');
    }
    const serverTime = await getBinanceServerTime();
    const formattedDate = serverTime.toFormat('dd/MM/yyyy HH:mm:ss');
    const currentYear = serverTime.year;

    const priceDataPrompt = livePrices ? `
        **DADOS DE MERCADO EM TEMPO REAL (DO SUPERVISOR) - REGRA CRÍTICA:**
        A seguir estão os preços atuais dos principais ativos. Sua análise e pontos de entrada DEVEM OBRIGATORIAMENTE usar estes preços como a referência mais precisa para o campo 'livePrice'.
        ${Object.entries(livePrices).map(([ticker, price]) => `- ${ticker}: ${price ? formatCurrency(parseFloat(price)) : 'N/A'}`).join('\n')}
        ---
    ` : '';

    const dynamicRiskPrompt = `
      **DIRETIVA DE DIMENSIONAMENTO DE POSIÇÃO DINÂMICO v1.0 - REGRA OBRIGATÓRIA:**
      O Supervisor forneceu os seguintes parâmetros de risco:
      - Capital Total: ${formatCurrency(totalCapital)}
      - Risco por Trade: ${riskPercentage}%

      Para CADA SINAL gerado, você DEVE calcular o tamanho da posição recomendado em USD.
      1. Calcule o Risco em USD: \`riskInUSD = ${totalCapital} * (${riskPercentage} / 100)\`. O resultado deste cálculo DEVE ser inserido no campo \`riskPerTrade\`.
      2. Calcule o Tamanho da Posição: \`Tamanho da Posição (USD) = riskInUSD / |(Preço de Entrada - Preço do Stop) / Preço de Entrada| \`. Use o ponto médio da 'entryRange' como 'Preço de Entrada'.
      3. Preencha o campo \`recommendedPositionSize\` com o resultado do Tamanho da Posição.
    `;

    const feedbackPrompt = feedbackDirective ? `
        **DIRETIVA DE FEEDBACK DE PERFORMANCE REAL (DO SUPERVISOR) v1.0 - REGRA OBRIGATÓRIA:**
        Alpha, seu desempenho histórico em paper trading nesta sessão é o seguinte:
        ${feedbackDirective}
        **AÇÃO:** Você DEVE ajustar sua confiança e seus critérios com base neste feedback. Se um tipo de operação (ex: VENDA) está com baixo desempenho, seja extremamente mais crítico e conservador ao gerar esses sinais. Mencione este ajuste em suas 'presentDayWeaknesses' e justifique como você está incorporando este feedback.
        ---
    ` : '';


    const prompt = `
        **DIRETIVA MESTRA DE ANÁLISE ADAPTATIVA v8.0**
        Sua identidade é Alpha. Sua tarefa é gerar um relatório de trading completo, agindo como um trader quantitativo que se adapta às condições de mercado e ao risco definido pelo usuário.

        DIRETIVA ZERO: SUPREMACIA DA AÇÃO DE PREÇO (REGRA INVIOLÁVEL E PRIORITÁRIA): Sua primeira tarefa, antes de qualquer outra, é analisar a Ação de Preço (Price Action) das últimas 72 horas para o BTC e ETH.

        SE o preço está numa clara tendência de baixa, perdendo suportes importantes e com volume de venda, você DEVE dar peso máximo a esta informação. Narrativas otimistas, sentimento de rede social ou dados on-chain antigos tornam-se secundários e devem ser tratados com extrema desconfiança.
        
        A realidade do preço é a verdade suprema. Sua análise do 'Regime de Mercado' DEVE refletir esta realidade.
        
        Se o preço está caindo forte, o regime NÃO PODE ser 'Rali de Alta'. Force-se a justificar por que o regime seria qualquer coisa diferente de 'Tendência de Baixa' ou 'Incerteza Volátil' nesse cenário. A sua credibilidade depende disso.

        **PROCESSO OBRIGATÓRIO (EM ORDEM):**

        **PASSO 1: DETERMINAR O REGIME DE MERCADO**
        ${marketRegimeDirective}
        - Sua primeira ação é analisar o mercado e definir o "Regime de Mercado Atual". Este DEVE ser o primeiro indicador no \`macroContext\`.

        **PASSO 2: APLICAR GESTÃO DE RISCO ADAPTATIVA**
        ${adaptiveRiskDirective}
        - Com base no regime, você DEVE ajustar seus parâmetros de risco. Esta diretiva é prioritária.

        **PASSO 3: APLICAR O PLAYBOOK DE ESTRATÉGIA CORRETO**
        ${strategyPlaybooksDirective}
        - Com base no regime definido, você DEVE aplicar o playbook correspondente para gerar TODOS os sinais.

        **PASSO 4: GERAR SINAIS COM ANÁLISE COMPLETA E ALOCAÇÃO ADAPTATIVA**
        ${riskManagementDirective} 
        ${entryRangeRealismDirective}
        ${dceDirective}
        ${fundamentalAnalysisDirective}
        ${structuredDriversDirective}
        - **DIRETIVA DE ALOCAÇÃO DE SINAIS ADAPTATIVA:** Sua tarefa mudou. Você não precisa mais gerar 4 sinais de compra e 4 de venda. Em vez disso, você tem um total de 8 'slots' de sinais para o dia. Você DEVE alocar esses slots de forma inteligente, com base no Regime de Mercado que identificou:
          - **Se RALI DE ALTA:** Aloque de 6 a 7 slots para COMPRA (Long). Aloque 1 ou 2 slots para VENDA (Short), mas somente se encontrar setups contra-tendência de altíssima qualidade (ex: uma clara exaustão em uma resistência forte). Se não encontrar nenhum short bom, é aceitável alocar todos os 8 slots para COMPRA.
          - **Se TENDÊNCIA DE BAIXA:** O inverso. Aloque de 6 a 7 slots para VENDA (Short) e 1 ou 2 para COMPRA (Long) de alta convicção.
          - **Se MERCADO LATERAL:** Aloque os slots de forma equilibrada (ex: 4/4 ou 3/3), focando em setups de reversão à média nos extremos do range.
          - **Se INCERTEZA VOLÁTIL:** Gere 8 sinais NEUTROS para preservar o capital.
        - **REGRAS GERAIS:** CADA SINAL gerado DEVE respeitar as regras de Risco Adaptativo do Passo 2, preencher o campo 'technicalDrivers' e passar por todas as diretivas de qualidade. O universo de análise é UNIFICADO e pode incluir tanto ativos principais (BTC, ETH) quanto altcoins.

        **PASSO 4.5: CALCULAR DIMENSIONAMENTO DE POSIÇÃO**
        ${dynamicRiskPrompt}
        - Execute o cálculo de dimensionamento para cada sinal gerado.

        **PASSO 5: IDENTIFICAR O SINAL DE ELITE**
        - Após gerar todos os sinais, sua tarefa mais crítica é comparar TODAS as oportunidades geradas. Identifique a ÚNICA oportunidade que oferece a melhor confluência de fatores e o alinhamento mais claro com o regime de mercado. Defina o campo isTopSignal dessa oportunidade como true. Todas as outras, sem exceção, devem ter isTopSignal: false.

        // --- DIRETIVAS DE EXECUÇÃO E CONTEXTO ---
        **DIRETIVA CRÍTICA DE OPERAÇÃO EM TEMPO REAL (REGRA INVIOLÁVEL E PRIORITÁRIA)**
        1. PREÇO REAL: Seus cálculos DEVEM se basear em preços REALISTAS E ATUAIS da Binance.
        2. DATA REAL: O ano atual é ${currentYear}. O 'entryDatetime' DEVE ser a data e hora atuais (${formattedDate}).
        ---
        ${priceDataPrompt}
        ${feedbackPrompt}

        **PROCESSO FINAL:**
        1. **Avaliação Macro:** Execute o Passo 1 e gere o 'macroContext' (mínimo 6 indicadores).
        2. **Geração de Sinais:** Execute os Passos 2, 3, 4, 4.5 e 5 para gerar os sinais.
        3. **Análise de Risco:** Gere 'presentDayStrengths' e 'presentDayWeaknesses'.

        **Formato:** Sua resposta DEVE ser um único objeto JSON que obedece estritamente ao schema fornecido.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: presentDayAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        const fullData = JSON.parse(jsonText) as PresentDayAnalysisResult;
        
        // Augment with live prices for opportunity signals
        const presentDayAssets = [
            ...fullData.presentDayBuySignals.map(s => s.assetName),
            ...fullData.presentDaySellSignals.map(s => s.assetName),
        ];
        const uniqueAssets = [...new Set(presentDayAssets)];

        if (uniqueAssets.length > 0) {
            try {
                const opportunityPrices = await fetchPrices(uniqueAssets);
                fullData.presentDayBuySignals.forEach(signal => {
                    const priceInfo = opportunityPrices[signal.assetName];
                    signal.livePrice = priceInfo?.price || null;
                    signal.livePriceSource = priceInfo?.source || 'N/A';
                });
                fullData.presentDaySellSignals.forEach(signal => {
                    const priceInfo = opportunityPrices[signal.assetName];
                    signal.livePrice = priceInfo?.price || null;
                    signal.livePriceSource = priceInfo?.source || 'N/A';
                });
            } catch (priceError) {
                console.warn("Could not fetch live prices for opportunity signals:", priceError);
            }
        }
        
        // Cache the result before returning
        setLastPresentDayAnalysis(fullData);
        
        return fullData;

    } catch (error) {
        console.error("Error fetching present day analysis from Gemini API:", error);
        throw new Error(`Falha na análise do presente da IA: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * Executes the first step of the pipeline: fetching raw analysis data.
 * @returns A promise that resolves to the raw PresentDayAnalysisResult.
 */
export const runFullPipeline = async (totalCapital: number, riskPercentage: number, feedbackDirective?: string): Promise<PresentDayAnalysisResult> => {
    try {
        const pricesWithSource = await fetchPrices(['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'LTC', 'MATIC', 'DOT']);
        const prices: LivePrices = {};
        for (const ticker in pricesWithSource) {
            prices[ticker] = pricesWithSource[ticker].price;
        }
        const analysis = await fetchPresentDayAnalysis(prices, totalCapital, riskPercentage, feedbackDirective);
        return analysis;
    } catch (error) {
        console.error("Error in runFullPipeline:", error);
        throw error;
    }
};

export const fetchNewSignal = async (options: {
    signalType: 'COMPRA' | 'VENDA' | 'NEUTRO';
    horizon: Horizon;
    excludeAssets: string[];
    livePrices: LivePrices;
}): Promise<PresentDayAssetSignal> => {
     const { signalType, horizon, excludeAssets, livePrices } = options;
    // This function is designed to get a single new signal, often for rerolling.
    // It's a simplified version of fetchPresentDayAnalysis.
    const serverTime = await getBinanceServerTime();
    const formattedDate = serverTime.toFormat('dd/MM/yyyy HH:mm:ss');
    const currentYear = serverTime.year;

    const prompt = `Gere EXATAMENTE 1 sinal de ${signalType} para o horizonte "${horizon}".
    **DATA REAL:** O ano atual é ${currentYear}. 'entryDatetime' DEVE ser ${formattedDate}.
    ${riskManagementDirective}
    ${structuredDriversDirective}
    O ativo NÃO PODE estar na lista: ${excludeAssets.join(', ')}.
    A resposta DEVE ser um único objeto JSON aderindo ao schema 'presentDaySignalSchema'.
    O campo 'isTopSignal' DEVE ser 'false'.
    Os campos 'recommendedPositionSize' e 'riskPerTrade' devem ser calculados com base em um capital de $10.000 e risco de 1%.`;

    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: presentDaySignalSchema,
            },
        });
        const jsonText = response.text.trim();
        const newSignal = JSON.parse(jsonText) as PresentDayAssetSignal;
        
        const priceInfo = await fetchPrices([newSignal.assetName]);
        newSignal.livePrice = priceInfo[newSignal.assetName]?.price || null;
        newSignal.livePriceSource = priceInfo[newSignal.assetName]?.source || 'N/A';

        return newSignal;

    } catch(e) {
        console.error("fetchNewSignal failed", e);
        throw new Error("Failed to fetch a new signal from the AI.");
    }
};

export const fetchNewSignalsForHorizon = async (
    horizon: Horizon,
    side: 'COMPRA' | 'VENDA',
    count: number,
    excludeAssets: string[]
): Promise<PresentDayAssetSignal[]> => {
    const serverTime = await getBinanceServerTime();
    const formattedDate = serverTime.toFormat('dd/MM/yyyy HH:mm:ss');
    const currentYear = serverTime.year;

    const prompt = `
**DIRETIVA MESTRA DE ANÁLISE ADAPTATIVA v8.0**
Sua identidade é Alpha. Sua tarefa é gerar um conjunto de sinais de trading de alta qualidade para o horizonte de tempo "${horizon}", agindo como um trader quantitativo que se adapta às condições de mercado.

**PROCESSO OBRIGATÓRIO (EM ORDEM):**

**PASSO 1: DETERMINAR O REGIME DE MERCADO**
${marketRegimeDirective}
- Sua primeira ação é analisar o mercado e definir o "Regime de Mercado Atual".

**PASSO 2: APLICAR GESTÃO DE RISCO ADAPTATIVA**
${adaptiveRiskDirective}
- Com base no regime, você DEVE ajustar seus parâmetros de risco para os sinais que irá gerar. Esta diretiva é prioritária.

**PASSO 3: APLICAR O PLAYBOOK DE ESTRATÉGIA CORRETO**
${strategyPlaybooksDirective}
- Com base no regime definido, você DEVE aplicar o playbook correspondente para gerar TODOS os sinais.

**PASSO 4: GERAR SINAIS COM ANÁLISE COMPLETA E VALIDAÇÃO DE RISCO**
${riskManagementDirective} 
${dceDirective}
${fundamentalAnalysisDirective}
${structuredDriversDirective}
- **REGRAS DE GERAÇÃO:**
    - Gere EXATAMENTE ${count} sinais de ${side} para o horizonte "${horizon}".
    - O universo de análise é UNIFICADO e pode incluir tanto ativos principais quanto altcoins.
    - Ativos a serem evitados: ${excludeAssets.join(', ')}.
    - CADA SINAL DEVE respeitar as regras de Risco Adaptativo do Passo 2.
    - O campo 'isTopSignal' DEVE ser 'false' para todos.
    - Gere apenas sinais de ${side}, NUNCA 'NEUTRO'.

**PASSO 4.5: CALCULAR DIMENSIONAMENTO DE POSIÇÃO (PADRÃO)**
- Para cada sinal gerado, calcule 'recommendedPositionSize' e 'riskPerTrade' com base em um capital padrão de $10,000 e risco de 1%.

// --- DIRETIVAS DE EXECUÇÃO E CONTEXTO ---
**DIRETIVA CRÍTICA DE OPERAÇÃO EM TEMPO REAL (REGRA INVIOLÁVEL E PRIORITÁRIA)**
1. PREÇO REAL: Seus cálculos DEVEM se basear em preços REALISTAS E ATUAIS da Binance.
2. DATA REAL: O ano atual é ${currentYear}. O 'entryDatetime' DEVE ser a data e hora atuais (${formattedDate}). O 'exitDatetime' deve ser calculado a partir desta data.
---

**PROCESSO FINAL:**
Execute todos os passos para gerar a lista de ${count} sinais.

**Formato:** Sua resposta DEVE ser um array JSON de objetos que obedecem estritamente ao schema 'presentDaySignalSchema'.
`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: presentDaySignalSchema } }
        });
        const txt = (response?.text || "").trim();
        const newSignals = JSON.parse(txt) as PresentDayAssetSignal[];
        
        // Augment with prices
        const assets = newSignals.map(s => s.assetName);
        const prices = await fetchPrices(assets);
        newSignals.forEach(s => {
            const priceInfo = prices[s.assetName];
            s.livePrice = priceInfo?.price || null;
            s.livePriceSource = priceInfo?.source || 'N/A';
        });

        return newSignals;
    } catch(e) {
        console.error("fetchNewSignalsForHorizon failed", e);
        return [];
    }
};

export const fetchTacticalAnalysis = async (assetTicker: string, livePrice: string, source: string, language: 'pt' | 'en', horizon: Horizon): Promise<PresentDayAssetSignal> => {
    const serverTime = await getBinanceServerTime();
    const formattedDate = serverTime.toFormat('dd/MM/yyyy HH:mm:ss');
    const currentYear = serverTime.year;

    const prompt = `
        ${riskManagementDirective}
        ${structuredDriversDirective}
        **DIRETIVA CRÍTICA DE OPERAÇÃO EM TEMPO REAL (REGRA INVIOLÁVEL E PRIORITÁRIA)**
        **1. PREÇO REAL:** Seus cálculos de preço (entryRange, target, stopLoss) DEVEM se basear em preços REALISTAS E ATUAIS. O preço ATUAL de ${assetTicker} é ${formatCurrency(parseFloat(livePrice))} (Fonte: ${source}).
        **2. DATA REAL:** O ano atual é ${currentYear}. O 'entryDatetime' DEVE ser a data e hora atuais (${formattedDate}).
        ---
        Você é a IA 'Alpha'. Sua missão é executar uma **Pesquisa Tática** completa para o ativo **${assetTicker}**.

        **TAREFA:**
        Gere um **único sinal de trading** (COMPRA, VENDA ou NEUTRO) para o ativo ${assetTicker} com um horizonte de **${horizon}**.
        A análise deve ter o **mesmo nível de detalhe e rigor** dos sinais de "Oportunidades do Dia". Aplique TODAS as suas diretivas avançadas.

        **REGRAS:**
        1.  **MOTOR PRINCIPAL:** Use o mesmo processo que gera os sinais do painel diário, incluindo os 3 pilares de análise (Fundamental, On-Chain, Automação).
        2.  **OUTPUT COMPLETO:** A resposta DEVE ser um único objeto JSON que obedece estritamente ao schema \`presentDaySignalSchema\`. Isso inclui preencher todos os campos: \`strongPoints\`, \`weakPoints\`, \`specialModes\`, \`checklistResult\`, \`onChainIntelligence\`, \`automationSetup\`, etc. O campo 'isTopSignal' DEVE ser 'false'. Os campos 'recommendedPositionSize' e 'riskPerTrade' devem ser calculados com base em um capital de $10.000 e risco de 1%.
        3.  **SINAL NEUTRO:** Se o ativo não puder ser analisado ou não apresentar uma oportunidade clara, retorne um sinal 'NEUTRO' com as justificativas apropriadas e campos financeiros zerados.
        4.  **IDIOMA:** A resposta final, incluindo todos os campos de texto, DEVE ser em ${language === 'pt' ? 'Português' : 'Inglês'}.

        A resposta DEVE ser um único objeto JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: presentDaySignalSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as PresentDayAssetSignal;
        
        parsedData.livePrice = livePrice;
        parsedData.livePriceSource = source;
        
        return parsedData;

    } catch (error) {
        console.error("Error fetching tactical analysis from Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Falha ao obter uma análise tática da IA: ${error.message}`);
        }
        throw new Error("Ocorreu um erro desconhecido ao buscar a análise tática.");
    }
};

const chartAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        assetIdentification: { type: Type.STRING, description: "Identificação do ativo (ex: BTC/USDT)." },
        timeframe: { type: Type.STRING, description: "O timeframe do gráfico (ex: 4 Horas, 1 Dia)." },
        globalSignal: { type: Type.STRING, enum: ['bullish', 'bearish', 'neutral'], description: "Sinal técnico global (tendência principal)." },
        technicalDrivers: {
            type: Type.OBJECT,
            description: "Objeto com os principais indicadores técnicos. Ex: { 'RSI_Divergence': 'bullish' }",
             additionalProperties: {
                oneOf: [
                    { type: Type.STRING },
                    { type: Type.BOOLEAN },
                    { type: Type.NUMBER }
                ]
            }
        },
        recomendacao: {
            type: Type.OBJECT,
            properties: {
                tipo: { type: Type.STRING, enum: ['COMPRA', 'VENDA', 'LONG', 'SHORT', 'NEUTRO'] },
                precoEntrada: { type: Type.NUMBER },
                stopLoss: { type: Type.NUMBER },
                takeProfit: { type: Type.NUMBER },
                confiancaPercentual: { type: Type.NUMBER },
            },
            required: ["tipo", "precoEntrada", "stopLoss", "takeProfit", "confiancaPercentual"],
        },
        strongPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        weakPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        specialModes: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["assetIdentification", "timeframe", "globalSignal", "technicalDrivers", "recomendacao"],
};

export const analyzeChartImage = async (base64Image: string, mimeType: string, language: 'pt' | 'en'): Promise<ChartAnalysisResult> => {
    const imagePart = {
        inlineData: {
            mimeType,
            data: base64Image,
        },
    };

    const prompt = `
        **DIRETIVA: ANALISTA DE GRÁFICO TÉCNICO**
        Sua tarefa é analisar a imagem de um gráfico de trading de criptomoedas e fornecer uma análise operacional completa.

        **PROCESSO DE ANÁLISE:**
        1.  **Identificação:** Identifique o ativo (ex: BTC/USDT) e o timeframe do gráfico.
        2.  **Sinal Global:** Determine a tendência principal (bullish, bearish, neutral).
        3.  **Drivers Técnicos:** Identifique os 3-5 indicadores ou padrões gráficos mais importantes que sustentam sua análise. Use o objeto 'technicalDrivers'.
        4.  **Recomendação Operacional:** Forneça uma recomendação clara de 'COMPRA', 'VENDA' ou 'NEUTRO', com preço de entrada, alvo (take profit) e stop-loss.
        5.  **Confiança:** Calcule um percentual de confiança para a operação.
        6.  **Justificativa:** Liste os pontos fortes e fracos da configuração gráfica.

        **REGRAS:**
        -   Sua análise deve ser puramente técnica, baseada apenas na imagem fornecida.
        -   Os preços devem ser realistas e derivados diretamente do gráfico.
        -   A resposta DEVE ser um único objeto JSON que obedece estritamente ao schema fornecido.
        -   O idioma da resposta DEVE ser ${language === 'pt' ? 'Português' : 'Inglês'}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: chartAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ChartAnalysisResult;
    } catch (error) {
        console.error("Error analyzing chart image from Gemini API:", error);
        throw new Error(`Falha na análise de imagem da IA: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const fetchMemeCoinAnalysis = async (): Promise<MemeCoinSignal[]> => {
    const prompt = `
        **DIRETIVA: DEGEN ALPHA**
        Você é 'DegenAlpha', uma IA especialista em identificar oportunidades de altíssimo risco e altíssimo retorno em meme coins e shitcoins.
        Sua missão é escanear o mercado e encontrar 3 a 5 moedas com potencial explosivo no curto prazo (24-48h).
        Sua análise é baseada em uma combinação de sentimento em redes sociais, indícios de atividade on-chain e padrões gráficos que indicam volatilidade iminente.

        **REGRAS:**
        1.  **UNIVERSO:** Foque exclusivamente em low-caps, meme coins e shitcoins. NUNCA inclua ativos de grande capitalização como BTC, ETH, SOL, XRP, etc.
        2.  **SINAL:** Forneça um \`signalType\` de 'BUY' para oportunidades imediatas ou 'HOLD' para moedas que estão no radar, prestes a se mover.
        3.  **TESE:** A \`shortThesis\` deve ser uma única frase impactante que resuma a oportunidade. Ex: "Forte momentum nas redes sociais e aproximando-se de um rompimento técnico chave."
        4.  **RISCO/POTENCIAL:** Avalie o \`potential\` e o \`risk\` em uma escala de 'High', 'Very High' ou 'Extreme'.

        **OUTPUT:** Sua resposta DEVE ser um array JSON de 3 a 5 objetos, obedecendo estritamente ao schema fornecido. Não inclua nenhum outro texto ou explicação.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            symbol: { type: Type.STRING },
                            name: { type: Type.STRING },
                            signalType: { type: Type.STRING, enum: ['BUY', 'HOLD'] },
                            shortThesis: { type: Type.STRING },
                            potential: { type: Type.STRING, enum: ['High', 'Very High', 'Extreme'] },
                            risk: { type: Type.STRING, enum: ['High', 'Very High', 'Extreme'] },
                        },
                        required: ["symbol", "name", "signalType", "shortThesis", "potential", "risk"],
                    }
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MemeCoinSignal[];
    } catch (error) {
        console.error("Error fetching meme coin analysis from Gemini API:", error);
        throw new Error(`Falha na análise de meme coins da IA: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const fetchSentimentAnalysis = async (assets: string[], language: 'pt' | 'en'): Promise<SentimentAnalysis[]> => {
    const prompt = `
        **DIRETIVA: BRIEFING DE INTELIGÊNCIA DE SENTIMENTO v3.0**
        Sua tarefa é agir como um analista de inteligência de mercado. Para cada ativo, forneça um briefing que explique o "porquê" e o "e daí?".

        **ATIVOS PARA ANÁLISE:** ${assets.join(', ')}

        **REGRAS DE ANÁLISE:**
        1.  **Pontuação e Rótulo (sentimentScore, sentimentLabel):** Forneça uma pontuação de 0 a 100 e o rótulo correspondente.
        2.  **Narrativas Dominantes (dominantNarratives):** Para cada uma das 2-3 narrativas mais importantes, você DEVE fornecer:
            -   **narrative:** O nome da narrativa (ex: "ETFs Spot").
            -   **context:** Uma única frase explicando o que é essa narrativa e por que ela é relevante para o ativo agora (ex: "A expectativa de aprovação de ETFs de Ethereum está atraindo fluxo institucional, o que é historicamente altista.").
            -   **impact:** Classifique o impacto potencial dessa narrativa no preço do ativo como 'Alto', 'Médio', ou 'Baixo'.
        3.  **Briefing de Inteligência (intelligenceBriefing):** Escreva um parágrafo coeso (2-3 frases) que sintetize a análise. Ele DEVE explicar como o sentimento geral e as narrativas combinadas podem impactar a ação de preço do ativo no curto prazo. Conecte os pontos para o usuário.
        4.  **IDIOMA:** A resposta final (labels, narrativas, briefing) DEVE ser em ${language === 'pt' ? 'Português' : 'Inglês'}.

        **OUTPUT:** Sua resposta DEVE ser um array JSON, onde cada objeto corresponde a um ativo e obedece estritamente ao schema \`SentimentAnalysis\` atualizado.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: sentimentAnalysisSchema,
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SentimentAnalysis[];
    } catch (error) {
        console.error("Error fetching sentiment analysis from Gemini API:", error);
        throw new Error(`Falha na análise de sentimento da IA: ${error instanceof Error ? error.message : String(error)}`);
    }
};

// --- Back-end only or complex functions ---
export const fetchBacktestAnalysis = async (): Promise<BacktestAnalysisResult> => {
    // This function is complex and would require historical data simulation.
    // For now, it will return a mocked or simplified response.
    throw new Error("fetchBacktestAnalysis is not implemented on the frontend mock.");
};

export const createChatSession = async (
    presentDayData: PresentDayAnalysisResult,
    backtestData: BacktestAnalysisResult | null
): Promise<Chat> => {
    if (chat) return chat;
    
    const context = `
        **CONTEXTO DO SUPERVISOR:**
        - **Análise do Presente:** ${JSON.stringify(presentDayData)}
        - **Análise do Backtest:** ${JSON.stringify(backtestData)}
    `;
    
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `Você é a IA 'Alpha'. Responda às perguntas do Supervisor com base no contexto fornecido. Seja conciso e direto. Contexto: ${context}`
        }
    });
    return chat;
};


export const fetchSupervisorDirective = async (
    analysis: SelfAnalysis,
    evolutionPrompt: string
): Promise<{ directive: string }> => {
    throw new Error("fetchSupervisorDirective is not implemented on the frontend mock.");
};


export const fetchRobustnessAudit = async (): Promise<AuditReport> => {
    throw new Error("fetchRobustnessAudit is not implemented on the frontend mock.");
};