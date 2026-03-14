import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] pb-20">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 h-14 ios-material-thick border-b border-[rgb(var(--ios-separator))]/50">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 md:px-8 py-8">
                {/* Header + filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-[var(--ios-radius-md)]" />
                </div>

                {/* Search + filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Skeleton className="h-11 flex-1 rounded-[var(--ios-radius-lg)]" />
                    <Skeleton className="h-11 w-32 rounded-[var(--ios-radius-md)]" />
                    <Skeleton className="h-11 w-32 rounded-[var(--ios-radius-md)]" />
                </div>

                {/* Project rows */}
                <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-8 w-16 rounded-[var(--ios-radius-md)]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
