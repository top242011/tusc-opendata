"use client";

import { useEffect } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 min-w-[320px] max-w-[90vw]",
            "rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-xl)]",
            "ios-material-thick",
            "animate-in slide-in-from-bottom-4 fade-in duration-300",
            "border border-[rgb(var(--ios-separator))]/30"
        )}>
            {type === 'success' ? (
                <div className="p-1.5 rounded-full bg-[rgb(var(--ios-green))]/15">
                    <CheckCircle className="w-5 h-5 text-[rgb(var(--ios-green))]" />
                </div>
            ) : (
                <div className="p-1.5 rounded-full bg-[rgb(var(--ios-red))]/15">
                    <AlertCircle className="w-5 h-5 text-[rgb(var(--ios-red))]" />
                </div>
            )}

            <div className="flex-1 text-sm font-medium text-[rgb(var(--ios-text-primary))]">
                {message}
            </div>

            <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors ios-press"
                aria-label="ปิด"
            >
                <X className="w-4 h-4 text-[rgb(var(--ios-text-secondary))]" />
            </button>
        </div>
    );
}
