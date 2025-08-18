import { DateTime } from 'luxon';

/**
 * Fetches the official server time from the Binance API.
 * This ensures all timestamps in the application are consistent and authoritative.
 * @returns {Promise<DateTime>} A Luxon DateTime object representing the server time, localized to 'America/Sao_Paulo'.
 */
export const getBinanceServerTime = async (): Promise<DateTime> => {
    try {
        const response = await fetch('https://api.binance.com/api/v3/time');
        if (!response.ok) {
            throw new Error(`Binance time API returned status: ${response.status}`);
        }
        const data = await response.json();
        // data.serverTime is in milliseconds
        return DateTime.fromMillis(data.serverTime).setZone('America/Sao_Paulo');
    } catch (error) {
        console.warn(
            "Could not fetch Binance server time. Falling back to local system time. Timestamps may be inaccurate.",
            error
        );
        // Fallback to local time if the API fails
        return DateTime.now().setZone('America/Sao_Paulo');
    }
};