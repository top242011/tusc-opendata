'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getHelpForPage } from '@/lib/help-content';

export function ContextualHelpButton() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const helpItems = getHelpForPage(pathname);

    if (helpItems.length === 0) return null;

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[rgb(var(--ios-accent))] text-white shadow-lg hover:opacity-90 flex items-center justify-center ios-press md:bottom-8 md:right-8"
                title="ช่วยเหลือ"
            >
                <HelpCircle className="w-5 h-5" />
            </button>

            {/* Slide-out panel */}
            {open && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
                        onClick={() => setOpen(false)}
                    />
                    <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[rgb(var(--ios-bg-secondary))] shadow-2xl animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--ios-separator))]/50">
                            <h2 className="text-lg font-bold text-[rgb(var(--ios-text-primary))]">ช่วยเหลือ</h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-[var(--ios-radius-sm)] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                            >
                                <X className="w-5 h-5 text-[rgb(var(--ios-text-secondary))]" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3 overflow-y-auto max-h-[calc(100vh-80px)]">
                            {helpItems.map((item, i) => (
                                <HelpAccordion key={i} title={item.title} content={item.content} defaultOpen={i === 0} />
                            ))}
                            <div className="pt-4 border-t border-[rgb(var(--ios-separator))]/30">
                                <a
                                    href="/admin/docs"
                                    className="text-sm text-[rgb(var(--ios-accent))] hover:underline"
                                    onClick={() => setOpen(false)}
                                >
                                    ดูคู่มือฉบับเต็ม →
                                </a>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function HelpAccordion({ title, content, defaultOpen }: { title: string; content: string; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen ?? false);

    return (
        <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
                <span className="text-sm font-medium text-[rgb(var(--ios-text-primary))]">{title}</span>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))] flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))] flex-shrink-0" />
                )}
            </button>
            {open && (
                <div className="px-4 pb-3 border-t border-[rgb(var(--ios-separator))]/30">
                    <p className="text-sm text-[rgb(var(--ios-text-secondary))] pt-3 leading-relaxed">{content}</p>
                </div>
            )}
        </div>
    );
}
