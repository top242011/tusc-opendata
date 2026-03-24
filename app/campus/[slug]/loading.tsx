import { Skeleton } from "@/components/ui/skeleton";

export default function CampusDetailLoading() {
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

            {/* Hero */}
            <section className="border-b border-[rgb(var(--ios-separator))]/40 py-10 md:py-14">
                <div className="container mx-auto px-4 md:px-8">
                    <Skeleton className="h-4 w-36 mb-4" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-12 rounded-[var(--ios-radius-md)] shrink-0" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-9 w-56" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                    ))}
                </div>

                {/* Top orgs */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6">
                    <Skeleton className="h-5 w-48 mb-5" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-1.5">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
                    <div className="p-4 border-b border-[rgb(var(--ios-separator))]/50">
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <div className="divide-y divide-[rgb(var(--ios-separator))]/30">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4">
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
