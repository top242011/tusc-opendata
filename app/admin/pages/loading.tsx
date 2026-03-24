import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPagesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-10 w-32 rounded-[var(--ios-radius-lg)]" />
            </div>
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 flex items-center gap-4 px-5 py-4">
                        <Skeleton className="h-8 w-8 rounded-[var(--ios-radius-sm)] shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-[var(--ios-radius-sm)]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
