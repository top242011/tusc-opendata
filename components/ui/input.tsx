import * as React from "react"
import { cn } from "@/utils/cn"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-[var(--ios-radius-sm)] px-4 py-2.5 text-[15px]",
                    "bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-primary))]",
                    "placeholder:text-[rgb(var(--ios-text-tertiary))]",
                    "border-0 ring-0 outline-none",
                    "focus:ring-2 focus:ring-[rgb(var(--ios-accent))] focus:ring-offset-0",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
