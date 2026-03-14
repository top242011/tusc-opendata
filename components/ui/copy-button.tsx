'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "p-1.5 rounded-[var(--ios-radius-sm)] transition-colors",
                copied
                    ? "text-[rgb(var(--ios-green))] bg-[rgb(var(--ios-green))]/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-700",
                className
            )}
            aria-label={copied ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
    );
}
