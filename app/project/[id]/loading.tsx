import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProjectLoading() {
    return (
        <div className="min-h-screen bg-[rgb(var(--ios-bg-grouped))]">
            {/* Navbar Skeleton */}
            <nav className="sticky top-0 z-50 h-14 ios-material-thick border-b border-[rgb(var(--ios-separator))]/50">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </nav>

            <div className="py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-6">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-52" />
                    </div>

                    {/* Header Card */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] px-8 py-8 shadow-[var(--ios-shadow-sm)] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-lg)] mb-6">
                        {/* Completeness score */}
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex-1 max-w-48 flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-1.5 w-full rounded-full" />
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2 mb-4">
                            <Skeleton className="h-6 w-32 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>

                        {/* Title + Org */}
                        <Skeleton className="h-9 w-3/4 mb-3" />
                        <Skeleton className="h-6 w-1/2" />

                        {/* Stats Grid 3-col */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-[rgb(var(--ios-separator))]/50">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-7 w-36" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8">
                        <div className="flex border-b border-[rgb(var(--ios-separator))]/50 mb-6 gap-1">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className={`h-10 rounded-t-md ${i === 0 ? 'w-32' : 'w-28'}`} />
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="bg-[rgb(var(--ios-bg-secondary))] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-lg)] p-6 space-y-4">
                            <Skeleton className="h-5 w-40 mb-6" />
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-4 w-32 shrink-0" />
                                    <Skeleton className="h-4 flex-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
