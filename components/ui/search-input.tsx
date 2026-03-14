"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    onClear?: () => void;
    containerClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, value, onClear, containerClassName, onChange, ...props }, ref) => {
        const hasValue = value !== undefined && value !== "";

        return (
            <div className={cn("relative w-full", containerClassName)}>
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--ios-text-tertiary))]"
                    aria-hidden="true"
                />
                <input
                    type="text"
                    className={cn(
                        "h-10 w-full rounded-[var(--ios-radius-sm)] pl-9 pr-9 py-2 text-sm",
                        "bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-primary))]",
                        "placeholder:text-[rgb(var(--ios-text-tertiary))]",
                        "border-0 ring-0 outline-none",
                        "focus:ring-2 focus:ring-[rgb(var(--ios-accent))] focus:ring-offset-0",
                        "transition-all duration-200",
                        className
                    )}
                    value={value}
                    onChange={onChange}
                    ref={ref}
                    {...props}
                />
                {hasValue && onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[rgb(var(--ios-fill-secondary))] transition-colors"
                        aria-label="ล้างการค้นหา"
                    >
                        <X className="h-3.5 w-3.5 text-[rgb(var(--ios-text-tertiary))]" />
                    </button>
                )}
            </div>
        );
    }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
