
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { DateTime } from 'luxon';
import BellIcon from './icons/BellIcon';
import XIcon from './icons/XIcon';
import CheckIcon from './CheckIcon';
import SparklesIcon from './SparklesIcon';

const NotificationCenter: React.FC = () => {
    const { notifications, markAllNotificationsAsRead, clearAllNotifications } = useData();
    const { language } = useLanguage();
    const t = translations[language];

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
        if (!isOpen) {
            markAllNotificationsAsRead();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const timeAgo = (isoString: string) => {
        return DateTime.fromISO(isoString).setLocale(language).toRelative();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-full text-text-secondary hover:bg-surface hover:text-white transition-colors"
                aria-label={`${unreadCount} ${t.notifications}`}
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-primary text-xs text-white items-center justify-center">{unreadCount}</span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-lg shadow-2xl z-50 text-text">
                    <div className="p-3 flex justify-between items-center border-b border-border">
                        <h4 className="font-bold">{t.notifications}</h4>
                        <div className="flex items-center gap-2">
                             <button onClick={clearAllNotifications} className="text-xs text-text-secondary hover:text-danger" title={t.clearAll}>
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    {notifications.length === 0 ? (
                        <p className="p-6 text-center text-sm text-text-secondary">{t.noNotifications}</p>
                    ) : (
                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
                            {notifications.map(n => (
                                <div key={n.id} className="p-3 border-b border-border/50 flex items-start gap-3 hover:bg-background/50">
                                    <div className={`mt-1 flex-shrink-0 h-2 w-2 rounded-full ${!n.read ? 'bg-primary' : 'bg-transparent'}`}></div>
                                    <div className="flex-grow">
                                        <p className="text-sm">{n.message}</p>
                                        <p className="text-xs text-text-secondary mt-1">{timeAgo(n.timestamp)}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-primary">
                                        {n.type === 'new_top_signal' ? <SparklesIcon className="h-4 w-4" /> : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
