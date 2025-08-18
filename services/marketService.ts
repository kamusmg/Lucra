// src/services/marketService.ts
import { LivePrices } from '../types.ts';

export interface PriceInfo {
    price: string | null;
    source: string;
}

export interface LivePricesWithSource {
    [key: string]: PriceInfo;
}

const extractTickerFromAssetName = (assetName: string): string => {
    if (typeof assetName !== 'string') return '';
    const name = assetName.trim();
    
    // Ideal case: "TICKER (Name)" or "TICKER/USDT (Name)"
    const tickerBeforeParenMatch = name.match(/^([A-Z0-9]{2,10}(\/[A-Z]{3,4})?)\s*\(/);
    if (tickerBeforeParenMatch && tickerBeforeParenMatch[1]) {
        return tickerBeforeParenMatch[1].split('/')[0].toUpperCase();
    }
    
    // Second case: "Name (TICKER)" or "Name (TICKER/USDT)"
    const tickerInParenMatch = name.match(/\(([^)]+)\)/);
    if (tickerInParenMatch && tickerInParenMatch[1]) {
        const content = tickerInParenMatch[1].trim();
        const ticker = content.split('/')[0];
        if (/^[A-Z0-9]{2,10}$/i.test(ticker)) {
            return ticker.toUpperCase();
        }
    }
    
    // Fallback for names without parentheses like "BTC" or "BTC/USDT"
    return name.split(' ')[0].split('/')[0].toUpperCase();
};


/**
 * Formats a given asset name/ticker string into the format expected by Binance API (e.g., 'BTC' -> 'BTCUSDT').
 */
const formatBinanceTicker = (assetName: string): string => {
    let symbol = extractTickerFromAssetName(assetName);
    if (!symbol.endsWith('USDT')) {
        symbol = `${symbol}USDT`;
    }
    return symbol;
};

/**
 * Formats a given asset name/ticker string into the format expected by KuCoin API (e.g., 'BTC' -> 'BTC-USDT').
 */
const formatKucoinTicker = (assetName: string): string => {
    let symbol = extractTickerFromAssetName(assetName);
    if (symbol.endsWith('USDT')) {
        symbol = symbol.slice(0, -4);
    }
    return `${symbol}-USDT`;
};


/**
 * Fetches the live price for a single asset ticker, trying Binance, KuCoin, and then Coinbase as fallbacks.
 * @param ticker The asset name or ticker (e.g., 'BTC', 'WIF', 'Polygon (MATIC)').
 * @returns An object containing the price and the source, or a sample price if all sources fail.
 */
export const fetchPriceForTicker = async (ticker: string): Promise<PriceInfo> => {
    // 1. Try Binance
    const binanceSymbol = formatBinanceTicker(ticker);
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(binanceSymbol)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.price) {
                return { price: data.price, source: 'Binance' };
            }
        }
    } catch (error) {
        console.warn(`Binance fetch failed for ${ticker} (as ${binanceSymbol}):`, error);
    }

    // 2. Fallback to KuCoin
    const kucoinSymbol = formatKucoinTicker(ticker);
    try {
        const response = await fetch(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${encodeURIComponent(kucoinSymbol)}`);
        if (response.ok) {
            const data = await response.json();
            if(data?.data?.price) {
                return { price: data.data.price, source: 'KuCoin' };
            }
        }
    } catch (error) {
        console.warn(`KuCoin fetch failed for ${ticker} (as ${kucoinSymbol}):`, error);
    }
    
    // 3. Fallback to Coinbase
    const baseTicker = extractTickerFromAssetName(ticker);
    try {
        const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${baseTicker}`);
        if (response.ok) {
            const data = await response.json();
            if (data?.data?.rates?.USDT) {
                return { price: data.data.rates.USDT, source: 'Coinbase' };
            }
        }
    } catch (error) {
        console.warn(`Coinbase fetch failed for ${ticker} (as ${baseTicker}):`, error);
    }

    console.error(`Failed to fetch price for ${ticker} from all API sources.`);

    // All sources failed, return null as per new requirement.
    return { price: null, source: 'N/A' };
};

/**
 * Fetches the historical price of an asset at a specific point in time.
 * @param assetName The asset name or ticker.
 * @param timestamp The Unix timestamp in milliseconds.
 * @returns The price at that time, or null if not found.
 */
export const fetchHistoricalPriceAt = async (assetName: string, timestamp: number): Promise<{ price: string | null }> => {
    const symbol = formatBinanceTicker(assetName);
    const interval = '1m';
    const limit = 1;
    // The API uses the start time of the candle. We fetch the 1-minute candle that contains our timestamp.
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${timestamp}&limit=${limit}`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                // kline format: [open time, open, high, low, close, volume, ...]
                const closePrice = data[0][4];
                return { price: closePrice };
            }
        }
        console.warn(`No historical data found for ${assetName} at timestamp ${timestamp}`);
        return { price: null };
    } catch (error) {
        console.warn(`Binance historical fetch failed for ${assetName} at ${timestamp}:`, error);
        return { price: null };
    }
};


/**
 * Fetches live prices for a list of asset tickers individually, with fallback logic for each.
 * @param tickers An array of asset tickers (e.g., ['BTC', 'ETH']).
 * @returns A LivePricesWithSource object mapping original tickers to their price info.
 */
export const fetchPrices = async (tickers: string[]): Promise<LivePricesWithSource> => {
    if (tickers.length === 0) {
        return {};
    }
    const results: LivePricesWithSource = {};
    await Promise.all(tickers.map(async ticker => {
        results[ticker] = await fetchPriceForTicker(ticker);
    }));
    return results;
};


/**
 * Fetches the live prices for the major assets required by the main dashboard.
 * @returns A LivePrices object for major assets.
 */
export const fetchLivePrices = async (): Promise<LivePrices> => {
    const majorAssets = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'LTC', 'MATIC', 'DOT'];
    const resultsWithSource = await fetchPrices(majorAssets);
    
    const prices: LivePrices = {};
    for (const ticker in resultsWithSource) {
        prices[ticker] = resultsWithSource[ticker].price;
    }
    return prices;
};