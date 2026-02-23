import * as React from "react"
import { cn } from "@/utils/cn"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[100px] w-full rounded-[var(--ios-radius-sm)] px-4 py-3 text-[15px]",
                    "bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-primary))]",
                    "placeholder:text-[rgb(var(--ios-text-tertiary))]",
                    "border-0 ring-0 outline-none",
                    "focus:ring-2 focus:ring-[rgb(var(--ios-accent))] focus:ring-offset-0",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200",
                    "resize-none",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
