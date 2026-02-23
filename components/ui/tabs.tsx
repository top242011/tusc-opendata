"use client";

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    badge?: string | number;
}

interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    className?: string;
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Update indicator position on active tab change
    useEffect(() => {
        const activeIndex = tabs.findIndex(t => t.id === activeTab);
        const activeRef = tabRefs.current[activeIndex];

        if (activeRef) {
            setIndicatorStyle({
                left: activeRef.offsetLeft,
                width: activeRef.offsetWidth,
            });
        }
    }, [activeTab, tabs]);

    return (
        <div className={cn(
            "bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-md)] overflow-hidden transition-colors duration-200",
            className
        )}>
            {/* iOS Segmented Control Style Tab Headers */}
            <div className="p-2 bg-[rgb(var(--ios-bg-tertiary))]">
                <div className="relative flex bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-sm)] p-1">
                    {/* Sliding Indicator */}
                    <div
                        className="absolute top-1 bottom-1 bg-[rgb(var(--ios-bg-secondary))] rounded-[calc(var(--ios-radius-sm)-2px)] shadow-[var(--ios-shadow-sm)] transition-all duration-300 ease-out"
                        style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width,
                        }}
                    />

                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            ref={(el) => { tabRefs.current[index] = el; }}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-200 z-10 whitespace-nowrap ios-press",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ios-accent))] focus-visible:ring-inset rounded-[calc(var(--ios-radius-sm)-2px)]",
                                activeTab === tab.id
                                    ? "text-[rgb(var(--ios-text-primary))]"
                                    : "text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-text-primary))]"
                            )}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && (
                                <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium transition-colors",
                                    activeTab === tab.id
                                        ? "bg-[rgb(var(--ios-accent))]/15 text-[rgb(var(--ios-accent))]"
                                        : "bg-[rgb(var(--ios-fill-secondary))] text-[rgb(var(--ios-text-secondary))]"
                                )}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Panels */}
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    id={`panel-${tab.id}`}
                    role="tabpanel"
                    aria-labelledby={tab.id}
                    hidden={activeTab !== tab.id}
                    className="p-5 md:p-6 animate-in fade-in duration-200"
                >
                    {activeTab === tab.id && tab.content}
                </div>
            ))}
        </div>
    );
}
