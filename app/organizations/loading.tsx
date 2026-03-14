import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationsLoading() {
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
                {/* Hero */}
                <div className="mb-8 text-center">
                    <Skeleton className="h-8 w-56 mx-auto mb-2" />
                    <Skeleton className="h-4 w-80 mx-auto" />
                </div>

                {/* Filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Skeleton className="h-11 flex-1 rounded-[var(--ios-radius-lg)]" />
                    <Skeleton className="h-11 w-40 rounded-[var(--ios-radius-md)]" />
                    <Skeleton className="h-11 w-40 rounded-[var(--ios-radius-md)]" />
                </div>

                {/* Org cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-[var(--ios-radius-md)] shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-3 w-3/4" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[rgb(var(--ios-separator))]/40">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
