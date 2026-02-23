import * as React from "react"
import { cn } from "@/utils/cn"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "destructive" | "success" | "warning";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-primary))] border-[rgb(var(--ios-separator))]",
            destructive: "bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))] border-[rgb(var(--ios-red))]/20",
            success: "bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))] border-[rgb(var(--ios-green))]/20",
            warning: "bg-[rgb(var(--ios-orange))]/10 text-[rgb(var(--ios-orange))] border-[rgb(var(--ios-orange))]/20",
        };

        return (
            <div
                ref={ref}
                role="alert"
                className={cn(
                    "relative w-full rounded-[var(--ios-radius-md)] border p-4",
                    "[&>svg~*]:pl-8 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h5
            ref={ref}
            className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
);
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)}
            {...props}
        />
    )
);
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
