import * as React from "react"
import { cn } from "@/utils/cn"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    prefixIcon?: React.ReactNode;
    suffixIcon?: React.ReactNode;
    error?: boolean;
    errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, prefixIcon, suffixIcon, error, errorMessage, id, ...props }, ref) => {
        const errorId = errorMessage ? `${id ?? "input"}-error` : undefined;

        return (
            <div className="w-full">
                <div className="relative">
                    {prefixIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--ios-text-tertiary))] pointer-events-none">
                            {prefixIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        id={id}
                        className={cn(
                            "flex h-11 w-full rounded-[var(--ios-radius-sm)] px-4 py-2.5 text-[15px]",
                            "bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-primary))]",
                            "placeholder:text-[rgb(var(--ios-text-tertiary))]",
                            "border-0 ring-0 outline-none",
                            "focus:ring-2 focus:ring-[rgb(var(--ios-accent))] focus:ring-offset-0",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "transition-all duration-[var(--duration-normal)]",
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                            prefixIcon && "pl-10",
                            suffixIcon && "pr-10",
                            error && "ring-2 ring-[rgb(var(--ios-red))] focus:ring-[rgb(var(--ios-red))]",
                            className
                        )}
                        ref={ref}
                        aria-invalid={error || undefined}
                        aria-describedby={errorId}
                        {...props}
                    />
                    {suffixIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--ios-text-tertiary))]">
                            {suffixIcon}
                        </div>
                    )}
                </div>
                {errorMessage && (
                    <p id={errorId} className="mt-1.5 text-xs text-[rgb(var(--ios-red))]" role="alert">
                        {errorMessage}
                    </p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
