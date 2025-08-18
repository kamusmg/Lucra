
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Notification } from '../types';
import SparklesIcon from './SparklesIcon';
import BellIcon from './icons/BellIcon';
import XIcon from './icons/XIcon';

interface ToastProps {
    notification: Notification;
    onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            const dismissTimer = setTimeout(() => onDismiss(notification.id), 300);
            return () => clearTimeout(dismissTimer);
        }, 7000); // 7 seconds until dismiss

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);
    
    const handleDismissClick = () => {
         setIsExiting(true);
         setTimeout(() => onDismiss(notification.id), 300);
    }

    const Icon = notification.type === 'new_top_signal' ? SparklesIcon : BellIcon;

    return (
        <div
            className={`
                w-full max-w-sm bg-surface border border-border rounded-lg shadow-2xl p-4 flex items-start gap-3
                transition-all duration-300 ease-in-out
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex-shrink-0 text-primary mt-0.5">
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-grow">
                <p className="text-sm font-semibold text-text">{notification.message}</p>
            </div>
            <button 
                onClick={handleDismissClick}
                className="flex-shrink-0 p-1 rounded-full text-text-secondary hover:bg-border"
                aria-label="Dismiss notification"
            >
                <XIcon className="h-4 w-4" strokeWidth={2.5} />
            </button>
        </div>
    );
};

const NotificationToasts: React.FC = () => {
    const { notifications } = useData();
    const [toasts, setToasts] = useState<Notification[]>([]);
    const [lastSeenTimestamp, setLastSeenTimestamp] = useState<string>(new Date(0).toISOString());

    useEffect(() => {
        const unreadNotifications = notifications.filter(n => !n.read && n.timestamp > lastSeenTimestamp);
        
        if (unreadNotifications.length > 0) {
            setToasts(prev => [...prev, ...unreadNotifications]);
            setLastSeenTimestamp(unreadNotifications[0].timestamp); // Most recent is at the start
        }
    // We only want to run this when notifications array updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);
    
    const handleDismiss = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <div className="fixed top-20 right-4 z-50 space-y-3 w-full max-w-sm">
            {toasts.map(notification => (
                <Toast key={notification.id} notification={notification} onDismiss={handleDismiss} />
            ))}
        </div>
    );
};

export default NotificationToasts;
