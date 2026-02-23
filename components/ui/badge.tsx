import { cn } from "@/utils/cn"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "bg-[rgb(var(--ios-accent))]/15 text-[rgb(var(--ios-accent))]",
        secondary: "bg-[rgb(var(--ios-fill-secondary))] text-[rgb(var(--ios-text-secondary))]",
        destructive: "bg-[rgb(var(--ios-red))]/15 text-[rgb(var(--ios-red))]",
        outline: "border border-[rgb(var(--ios-separator))] text-[rgb(var(--ios-text-primary))] bg-transparent",
        success: "bg-[rgb(var(--ios-green))]/15 text-[rgb(var(--ios-green))]",
        warning: "bg-[rgb(var(--ios-orange))]/15 text-[rgb(var(--ios-orange))]",
    }

    return (
        <div className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            variants[variant],
            className
        )} {...props} />
    )
}
