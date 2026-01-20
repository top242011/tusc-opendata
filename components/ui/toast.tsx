
import { useEffect, useState } from 'react';
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
            "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-in fade-in slide-in-from-bottom-2 duration-300",
            type === 'success' ? "bg-slate-800" : "bg-red-600"
        )}>
            {type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
                <AlertCircle className="w-5 h-5 text-white" />
            )}

            <div className="flex-1 text-sm font-medium">
                {message}
            </div>

            <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
