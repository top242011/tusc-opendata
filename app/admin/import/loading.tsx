import { Skeleton } from "@/components/ui/skeleton";

export default function ImportLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-9 w-28 rounded-[var(--ios-radius-md)]" />
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        {i < 2 && <Skeleton className="h-0.5 w-8" />}
                    </div>
                ))}
            </div>

            {/* Upload area */}
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-11 w-full rounded-[var(--ios-radius-md)]" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-11 w-full rounded-[var(--ios-radius-md)]" />
                    </div>
                </div>
                <Skeleton className="h-40 w-full rounded-[var(--ios-radius-lg)]" />
                <Skeleton className="h-11 w-full rounded-[var(--ios-radius-lg)]" />
            </div>
        </div>
    );
}
