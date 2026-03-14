import * as React from "react"
import { cn } from "@/utils/cn"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
    errorMessage?: string;
    showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, errorMessage, id, showCount, maxLength, value, defaultValue, onChange, ...props }, ref) => {
        const errorId = id ? `${id}-error` : undefined;
        const [charCount, setCharCount] = React.useState(() => {
            const initial = (value ?? defaultValue ?? '') as string;
            return initial.length;
        });

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCharCount(e.target.value.length);
            onChange?.(e);
        };

        // Sync charCount when value is controlled
        React.useEffect(() => {
            if (value !== undefined) {
                setCharCount((value as string).length);
            }
        }, [value]);

        const showCharCount = showCount && maxLength;
        const ratio = maxLength ? charCount / maxLength : 0;

        return (
            <div className="w-full">
                <textarea
                    id={id}
                    className={cn(
                        "flex min-h-[100px] w-full rounded-[var(--ios-radius-sm)] px-4 py-3 text-[15px]",
                        "bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-primary))]",
                        "placeholder:text-[rgb(var(--ios-text-tertiary))]",
                        "border-0 ring-0 outline-none",
                        "focus:ring-2 focus:ring-[rgb(var(--ios-accent))] focus:ring-offset-0",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-[var(--duration-normal)]",
                        "resize-none",
                        error && "ring-2 ring-[rgb(var(--ios-red))] focus:ring-[rgb(var(--ios-red))]",
                        className
                    )}
                    ref={ref}
                    maxLength={maxLength}
                    value={value}
                    defaultValue={defaultValue}
                    onChange={handleChange}
                    aria-invalid={error || undefined}
                    aria-describedby={error && errorId ? errorId : undefined}
                    {...props}
                />
                <div className="flex items-center justify-between mt-1.5">
                    {error && errorMessage && errorId ? (
                        <p id={errorId} role="alert" className="text-xs text-[rgb(var(--ios-red))]">
                            {errorMessage}
                        </p>
                    ) : <span />}
                    {showCharCount && (
                        <span className={cn(
                            "text-xs tabular-nums",
                            ratio >= 1 ? "text-[rgb(var(--ios-red))] font-medium" :
                            ratio >= 0.9 ? "text-[rgb(var(--ios-orange))]" :
                            "text-[rgb(var(--ios-text-tertiary))]"
                        )}>
                            {charCount}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
