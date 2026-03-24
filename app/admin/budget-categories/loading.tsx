import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetCategoriesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-36 rounded-[var(--ios-radius-lg)]" />
            </div>
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 divide-y divide-[rgb(var(--ios-separator))]/30">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24 ml-auto" />
                        <Skeleton className="h-8 w-16 rounded-[var(--ios-radius-sm)]" />
                        <Skeleton className="h-8 w-16 rounded-[var(--ios-radius-sm)]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
