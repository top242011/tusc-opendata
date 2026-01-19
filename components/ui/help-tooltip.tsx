'use client';

import { ReactNode, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HelpTooltipProps {
    content: string;
    children?: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HelpTooltip({ content, children, position = 'top' }: HelpTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800',
    };

    return (
        <div className="relative inline-flex">
            <button
                type="button"
                className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
            >
                {children || <HelpCircle className="w-4 h-4" />}
            </button>

            {isVisible && (
                <div
                    className={cn(
                        "absolute z-50 px-3 py-2 text-sm text-white bg-slate-800 rounded-lg shadow-lg max-w-xs whitespace-normal",
                        positionClasses[position],
                        "animate-in fade-in zoom-in-95 duration-150"
                    )}
                >
                    {content}
                    <div
                        className={cn(
                            "absolute w-0 h-0 border-4",
                            arrowClasses[position]
                        )}
                    />
                </div>
            )}
        </div>
    );
}
