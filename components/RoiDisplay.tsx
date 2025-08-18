



import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters.ts';

interface RoiDisplayProps {
    profit: number;
    roiPercentage: number;
}

const RoiDisplay: React.FC<RoiDisplayProps> = ({ profit, roiPercentage }) => {
    const isProfit = profit >= 0;

    return (
        <>
            <div className="flex justify-between items-center">
                <span className="text-text-secondary">Resultado:</span>
                <span className={`font-bold text-lg ${isProfit ? 'text-success' : 'text-danger'}`}>{formatCurrency(profit)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-text-secondary">Retorno (ROI):</span>
                <span className={`font-bold text-lg ${isProfit ? 'text-success' : 'text-danger'}`}>{formatPercentage(roiPercentage)}</span>
            </div>
        </>
    );
}

export default RoiDisplay;