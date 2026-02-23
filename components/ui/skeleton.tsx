import { cn } from "@/utils/cn"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-fill-secondary))]",
                className
            )}
            {...props}
        />
    )
}

export { Skeleton }
