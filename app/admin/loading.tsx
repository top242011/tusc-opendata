import { Skeleton } from "@/components/ui/skeleton";

// Rendered inside AdminLayout (navbar + sidebar already provided)
export default function AdminLoading() {
    return (
        <div className="space-y-6">
            {/* Quick start banner */}
            <Skeleton className="h-32 w-full rounded-[var(--ios-radius-lg)]" />

            {/* Alert banner */}
            <Skeleton className="h-16 w-full rounded-[var(--ios-radius-lg)]" />

            {/* Section header + import action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-12 w-56 rounded-[var(--ios-radius-lg)]" />
            </div>
            <Skeleton className="h-14 w-full rounded-[var(--ios-radius-lg)]" />

            {/* Section heading */}
            <Skeleton className="h-8 w-56" />

            {/* Search/filter bar */}
            <Skeleton className="h-12 w-full rounded-[var(--ios-radius-lg)]" />

            {/* Project rows */}
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="h-16 bg-[rgb(var(--ios-bg-secondary))] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-lg)] flex items-center px-4 gap-4"
                    >
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                        <Skeleton className="h-8 w-16 rounded-[var(--ios-radius-sm)]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
