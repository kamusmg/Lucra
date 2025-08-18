

import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { ApiKey } from '../types';
import KeyIcon from './icons/KeyIcon';
import TrashIcon from './icons/TrashIcon';
import CheckIcon from './CheckIcon';

const ApiKeyManager: React.FC = () => {
    const { 
        apiKeys, addApiKey, removeApiKey,
        totalCapital, setTotalCapital,
        riskPercentage, setRiskPercentage
    } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    const [exchange, setExchange] = useState<'Binance'>('Binance');
    const [apiKey, setApiKeyInput] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim() || !secretKey.trim()) {
            return;
        }

        const newKey: ApiKey = {
            id: Date.now().toString(),
            exchange,
            apiKey: apiKey.trim(),
            secretKey: secretKey.trim(),
        };

        addApiKey(newKey);
        setApiKeyInput('');
        setSecretKey('');
        showToast(t.keyAdded);
    };

    const handleRemove = (id: string) => {
        if (window.confirm(t.removeKeyConfirm)) {
            removeApiKey(id);
            showToast(t.keyRemoved);
        }
    };

    const maskApiKey = (key: string) => {
        if (key.length <= 8) return '****';
        return `${key.slice(0, 4)}...${key.slice(-4)}`;
    };

    return (
        <div>
             {toast && (
                <div className="mb-4 bg-success/20 text-success font-semibold p-3 rounded-lg flex items-center gap-2">
                    <CheckIcon className="h-5 w-5" />
                    <span>{toast}</span>
                </div>
            )}
            <p className="text-sm text-text-secondary mb-6">{t.apiKeyManagementDescription}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:items-start">
                {/* Risk Settings */}
                <div className="lg:col-span-1">
                    <h4 className="text-lg font-bold text-primary mb-4">{t.riskSettings}</h4>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="total-capital" className="block text-sm font-medium text-text-secondary mb-1">{t.totalCapital}</label>
                            <input
                                id="total-capital"
                                type="number"
                                value={totalCapital}
                                onChange={(e) => setTotalCapital(Number(e.target.value))}
                                className="w-full bg-background/50 border border-border rounded-md px-3 py-2 text-white placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-primary transition"
                                step="100"
                                min="0"
                            />
                        </div>
                         <div>
                            <label htmlFor="risk-percentage" className="block text-sm font-medium text-text-secondary mb-1">{t.riskPerTrade}</label>
                            <input
                                id="risk-percentage"
                                type="number"
                                value={riskPercentage}
                                onChange={(e) => setRiskPercentage(Number(e.target.value))}
                                className="w-full bg-background/50 border border-border rounded-md px-3 py-2 text-white placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-primary transition"
                                step="0.1"
                                min="0.1"
                                max="100"
                            />
                        </div>
                    </div>
                </div>

                {/* Add New Key Form */}
                <div className="lg:col-span-1">
                    <h4 className="text-lg font-bold text-primary mb-4">{t.addApiKey}</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="exchange" className="block text-sm font-medium text-text-secondary mb-1">{t.exchange}</label>
                            <select
                                id="exchange"
                                value={exchange}
                                onChange={(e) => setExchange(e.target.value as 'Binance')}
                                className="w-full bg-background/50 border border-border rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                            >
                                <option>Binance</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="api-key" className="block text-sm font-medium text-text-secondary mb-1">{t.apiKey}</label>
                            <input
                                id="api-key"
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                className="w-full bg-background/50 border border-border rounded-md px-3 py-2 text-white placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-primary transition"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="secret-key" className="block text-sm font-medium text-text-secondary mb-1">{t.secretKey}</label>
                            <input
                                id="secret-key"
                                type="password"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                className="w-full bg-background/50 border border-border rounded-md px-3 py-2 text-white placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-primary transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md flex items-center justify-center hover:bg-opacity-90 transition-all disabled:opacity-50"
                        >
                            <KeyIcon className="h-5 w-5 mr-2" />
                            {t.saveKey}
                        </button>
                    </form>
                </div>

                {/* Saved Keys List */}
                <div className="lg:col-span-1">
                    <h4 className="text-lg font-bold text-primary mb-4">{t.savedKeys}</h4>
                    <div className="bg-surface/50 p-3 rounded-lg border border-border/50 min-h-[200px]">
                        {apiKeys.length > 0 ? (
                            <ul className="space-y-2">
                                {apiKeys.map(key => (
                                    <li key={key.id} className="bg-background/50 p-3 rounded-md flex items-center justify-between group">
                                        <div>
                                            <p className="font-bold text-white">{key.exchange}</p>
                                            <p className="text-xs text-text-secondary font-mono">{maskApiKey(key.apiKey)}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleRemove(key.id)}
                                            title={t.removeKey}
                                            className="p-2 text-text-secondary hover:text-danger opacity-50 group-hover:opacity-100 transition-opacity"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-text-secondary text-sm py-4">{t.noKeysSaved}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyManager;