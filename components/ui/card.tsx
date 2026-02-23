import { cn } from "@/utils/cn"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "inset" | "plain";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-[var(--ios-radius-lg)] transition-colors duration-200",
                variant === "default" && "bg-[rgb(var(--ios-bg-secondary))] shadow-[var(--ios-shadow-md)]",
                variant === "inset" && "bg-[rgb(var(--ios-bg-secondary))] mx-4",
                variant === "plain" && "bg-transparent",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("ios-title text-[rgb(var(--ios-text-primary))]", className)} {...props}>
            {children}
        </h3>
    )
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn("text-sm text-[rgb(var(--ios-text-secondary))]", className)} {...props}>
            {children}
        </p>
    )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-5 pt-0", className)} {...props}>
            {children}
        </div>
    )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex items-center p-5 pt-0", className)} {...props}>
            {children}
        </div>
    )
}
