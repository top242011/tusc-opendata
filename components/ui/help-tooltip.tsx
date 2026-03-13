'use client';

import { ReactNode, useId, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HelpTooltipProps {
    content: string;
    children?: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HelpTooltip({ content, children, position = 'top' }: HelpTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipId = useId();

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[rgb(var(--ios-bg-tertiary))]',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[rgb(var(--ios-bg-tertiary))]',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[rgb(var(--ios-bg-tertiary))]',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[rgb(var(--ios-bg-tertiary))]',
    };

    return (
        <div className="relative inline-flex">
            <button
                type="button"
                className="p-1 text-[rgb(var(--ios-text-quaternary))] hover:text-[rgb(var(--ios-accent))] transition-colors rounded-full hover:bg-[rgb(var(--ios-fill-tertiary))]"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                aria-describedby={isVisible ? tooltipId : undefined}
            >
                {children || <HelpCircle className="w-4 h-4" />}
            </button>

            {isVisible && (
                <div
                    id={tooltipId}
                    role="tooltip"
                    className={cn(
                        "absolute z-50 px-3 py-2 text-sm text-[rgb(var(--ios-text-primary))] bg-[rgb(var(--ios-bg-tertiary))] rounded-[var(--ios-radius-sm)] shadow-[var(--ios-shadow-lg)] max-w-xs whitespace-normal",
                        positionClasses[position],
                        "animate-scale-in"
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
