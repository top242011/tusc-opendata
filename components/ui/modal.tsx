"use client";

import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    // Handle ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEsc);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

            {/* Modal Content - iOS Sheet Style */}
            <div
                className={cn(
                    "relative w-full sm:max-w-lg max-h-[90vh] overflow-hidden",
                    "bg-[rgb(var(--ios-bg-secondary))]",
                    "rounded-t-[var(--ios-radius-xl)] sm:rounded-[var(--ios-radius-xl)]",
                    "shadow-[var(--ios-shadow-xl)]",
                    "animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300",
                    className
                )}
            >
                {/* iOS Drag Handle (mobile only) */}
                <div className="flex justify-center pt-2 pb-1 sm:hidden">
                    <div className="w-9 h-1 rounded-full bg-[rgb(var(--ios-text-quaternary))]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--ios-separator))]">
                    <h2 className="ios-title text-[rgb(var(--ios-text-primary))]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors ios-press"
                        aria-label="ปิด"
                    >
                        <X className="w-5 h-5 text-[rgb(var(--ios-text-secondary))]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
