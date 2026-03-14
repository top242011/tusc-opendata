import * as React from "react"
import { cn } from "@/utils/cn"
import { ChevronDown } from "lucide-react"

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    options: SelectOption[];
    placeholder?: string;
    error?: boolean;
    errorMessage?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, placeholder, error, errorMessage, id, ...props }, ref) => {
        const selectId = id || React.useId();
        const errorId = errorMessage ? `${selectId}-error` : undefined;

        return (
            <div className="relative w-full">
                <select
                    id={selectId}
                    className={cn(
                        "h-10 w-full rounded-[var(--ios-radius-sm)] px-3 pr-8 py-2 text-sm",
                        "bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-primary))]",
                        "border-0 focus:ring-2 focus:ring-[rgb(var(--ios-accent))] focus:ring-offset-0 focus:outline-none",
                        "transition-colors appearance-none cursor-pointer",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error && "ring-2 ring-[rgb(var(--ios-red))]",
                        className
                    )}
                    ref={ref}
                    aria-invalid={error || undefined}
                    aria-describedby={errorId}
                    {...props}
                >
                    {placeholder && (
                        <option value="">{placeholder}</option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--ios-text-tertiary))] pointer-events-none"
                    aria-hidden="true"
                />
                {errorMessage && (
                    <p id={errorId} className="mt-1.5 text-xs text-[rgb(var(--ios-red))]">
                        {errorMessage}
                    </p>
                )}
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }
