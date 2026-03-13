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

function SkeletonText({
    lines = 3,
    className,
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div className={cn("space-y-2.5", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn("h-3.5", i === lines - 1 ? "w-3/4" : "w-full")}
                />
            ))}
        </div>
    )
}

function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn(
            "rounded-[var(--ios-radius-lg)] bg-[rgb(var(--ios-bg-secondary))] p-5 space-y-4",
            className
        )}>
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    )
}

function SkeletonTable({
    rows = 5,
    columns = 4,
    className,
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div className={cn("w-full space-y-3", className)}>
            {/* Header */}
            <div className="flex gap-4 px-4 py-3">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-3.5 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4 px-4 py-3 border-t border-[rgb(var(--ios-separator))]/30">
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton
                            key={colIdx}
                            className={cn("h-4 flex-1", colIdx === 0 ? "max-w-[200px]" : "max-w-[120px]")}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable }
