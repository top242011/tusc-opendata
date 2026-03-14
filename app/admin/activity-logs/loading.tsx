import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLogsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-9 w-32 rounded-[var(--ios-radius-md)]" />
            </div>
            <Skeleton className="h-11 w-full rounded-[var(--ios-radius-lg)]" />
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 divide-y divide-[rgb(var(--ios-separator))]/30">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-3 w-24 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
