import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
    return (
        <div className="space-y-6 max-w-2xl">
            <Skeleton className="h-8 w-36" />
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 space-y-5">
                <Skeleton className="h-5 w-40 mb-2" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-11 w-full rounded-[var(--ios-radius-md)]" />
                    </div>
                ))}
                <div className="flex gap-3 pt-2">
                    <Skeleton className="h-10 w-28 rounded-[var(--ios-radius-lg)]" />
                    <Skeleton className="h-10 w-24 rounded-[var(--ios-radius-lg)]" />
                </div>
            </div>
        </div>
    );
}
