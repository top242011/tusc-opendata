import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <Skeleton className="h-10 w-32 rounded-[var(--ios-radius-sm)]" />
            </div>

            {/* Fiscal Year Pills */}
            <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-16 rounded-full" />
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-4">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-7 w-16" />
                    </div>
                ))}
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-36 rounded-full" />
                ))}
            </div>

            {/* Chart Placeholders */}
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-md)] p-5">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-3 w-72 mb-6" />
                <Skeleton className="h-[350px] w-full rounded-[var(--ios-radius)]" />
            </div>

            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-md)] p-5">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-60 mb-6" />
                <Skeleton className="h-[250px] w-full rounded-[var(--ios-radius)]" />
            </div>
        </div>
    );
}
