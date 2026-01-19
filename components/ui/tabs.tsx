"use client";

import { useState } from 'react';
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

    return (
        <div className={cn("bg-white border rounded-lg overflow-hidden shadow-sm", className)}>
            {/* Tab Headers */}
            <div className="flex border-b bg-slate-50 overflow-x-auto scrollbar-hide" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap",
                            "border-b-2 -mb-px focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset",
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600 bg-white"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                            )}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    id={`panel-${tab.id}`}
                    role="tabpanel"
                    aria-labelledby={tab.id}
                    hidden={activeTab !== tab.id}
                    className="p-6 md:p-8 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                    {activeTab === tab.id && tab.content}
                </div>
            ))}
        </div>
    );
}
