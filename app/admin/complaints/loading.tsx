import { Skeleton } from "@/components/ui/skeleton";

export default function ComplaintsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-[var(--ios-radius-lg)]" />
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-6 w-20 rounded-full shrink-0" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-3 pt-1">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
