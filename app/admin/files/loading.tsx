import { Skeleton } from "@/components/ui/skeleton";

export default function FilesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-10 w-32 rounded-[var(--ios-radius-lg)]" />
            </div>
            <Skeleton className="h-11 w-full rounded-[var(--ios-radius-lg)]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-4 space-y-3">
                        <Skeleton className="h-10 w-10 rounded-[var(--ios-radius-md)]" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                        <div className="flex gap-2 pt-1">
                            <Skeleton className="h-8 flex-1 rounded-[var(--ios-radius-sm)]" />
                            <Skeleton className="h-8 w-8 rounded-[var(--ios-radius-sm)]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
