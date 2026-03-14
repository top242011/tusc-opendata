import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDocsLoading() {
    return (
        <div className="flex gap-6">
            {/* Sidebar nav */}
            <div className="w-56 shrink-0 space-y-2">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full rounded-[var(--ios-radius-md)]" />
                ))}
            </div>
            {/* Content */}
            <div className="flex-1 bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 space-y-5">
                <Skeleton className="h-7 w-56 mb-2" />
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                ))}
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-32 w-full rounded-[var(--ios-radius-md)]" />
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                ))}
            </div>
        </div>
    );
}
