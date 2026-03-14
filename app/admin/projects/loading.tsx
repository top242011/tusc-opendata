import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProjectsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-10 w-36 rounded-[var(--ios-radius-lg)]" />
            </div>
            <Skeleton className="h-11 w-full rounded-[var(--ios-radius-lg)]" />
            <div className="space-y-2">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 flex items-center gap-4 px-4 py-3.5">
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-[var(--ios-radius-sm)]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
