

export const formatCurrency = (value: number | null | undefined) => {
    if (typeof value !== 'number') return 'N/A';
    if (value < 0.01 && value > -0.01 && value !== 0) {
         return `$${value.toPrecision(4)}`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const formatPercentage = (value: number | null | undefined, showSignForPositive = false) => {
    if (typeof value !== 'number') return 'N/A';
    const sign = value > 0 ? '+' : '';
    return `${showSignForPositive ? sign : ''}${value.toFixed(2)}%`;
};

export const formatLargeNumber = (value: number | null | undefined): string => {
    if (typeof value !== 'number') return 'N/A';
    
    const tiers = [
        { value: 1e12, symbol: "T" },
        { value: 1e9, symbol: "B" },
        { value: 1e6, symbol: "M" },
        { value: 1e3, symbol: "K" },
    ];
    
    const tier = tiers.find(t => value >= t.value);

    if (tier) {
        const formattedValue = (value / tier.value).toFixed(2);
        return `$${formattedValue}${tier.symbol}`;
    }

    return `$${value.toLocaleString('en-US')}`;
};