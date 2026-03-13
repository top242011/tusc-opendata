"use client";

import { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; label: string; bgClass: string; textClass: string }> = {
    success: { icon: CheckCircle, label: 'สำเร็จ', bgClass: 'bg-[rgb(var(--ios-green))]/15', textClass: 'text-[rgb(var(--ios-green))]' },
    error: { icon: AlertCircle, label: 'ข้อผิดพลาด', bgClass: 'bg-[rgb(var(--ios-red))]/15', textClass: 'text-[rgb(var(--ios-red))]' },
    warning: { icon: AlertTriangle, label: 'คำเตือน', bgClass: 'bg-[rgb(var(--ios-orange))]/15', textClass: 'text-[rgb(var(--ios-orange))]' },
    info: { icon: Info, label: 'แจ้งเตือน', bgClass: 'bg-[rgb(var(--ios-blue))]/15', textClass: 'text-[rgb(var(--ios-blue))]' },
};

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

    const config = toastConfig[type];
    const Icon = config.icon;

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={cn(
                "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 min-w-[320px] max-w-[90vw]",
                "rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-xl)]",
                "ios-material-thick",
                "animate-in slide-in-from-bottom-4 fade-in duration-300",
                "border border-[rgb(var(--ios-separator))]/30"
        <div className={cn(
            "fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center gap-3 px-5 py-4 sm:min-w-[320px] max-w-[90vw]",
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
        >
            <div className={cn("p-1.5 rounded-full", config.bgClass)}>
                <Icon className={cn("w-5 h-5", config.textClass)} />
            </div>

            <div className="flex-1">
                <p className={cn("text-xs font-semibold", config.textClass)}>{config.label}</p>
                <p className="text-sm font-medium text-[rgb(var(--ios-text-primary))]">{message}</p>
            </div>

            <button
                onClick={onClose}
                className="p-3 rounded-full hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors ios-press"
                aria-label="ปิด"
            >
                <X className="w-4 h-4 text-[rgb(var(--ios-text-secondary))]" />
            </button>
        </div>
    );
}
