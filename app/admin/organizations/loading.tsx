import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrganizationsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-10 w-36 rounded-[var(--ios-radius-lg)]" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-10 flex-1 rounded-[var(--ios-radius-md)]" />
                <Skeleton className="h-10 w-36 rounded-[var(--ios-radius-md)]" />
                <Skeleton className="h-10 w-36 rounded-[var(--ios-radius-md)]" />
            </div>
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
                <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-[rgb(var(--ios-fill-tertiary))]">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
                <div className="divide-y divide-[rgb(var(--ios-separator))]/30">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3.5 items-center">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-16 rounded-[var(--ios-radius-sm)]" />
                                <Skeleton className="h-8 w-16 rounded-[var(--ios-radius-sm)]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
