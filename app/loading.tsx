import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] pb-20">
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

            {/* Hero Section Skeleton */}
            <section className="bg-gradient-to-b from-[rgb(var(--ios-accent))]/5 to-transparent border-b border-[rgb(var(--ios-separator))]/30">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-10 pb-8">
                    <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
                        <Skeleton className="h-6 w-44 rounded-full" />
                        <Skeleton className="h-10 w-72 md:w-96" />
                        <Skeleton className="h-8 w-56 md:w-72" />
                        <Skeleton className="h-4 w-80" />
                        <Skeleton className="h-4 w-64" />
                        <div className="w-full max-w-md mt-2">
                            <Skeleton className="h-12 w-full rounded-[var(--ios-radius-lg)]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
                {/* Action bar */}
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-9 w-32 rounded-[var(--ios-radius-md)]" />
                </div>

                {/* KPI Cards: 3 cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] p-5 border border-[rgb(var(--ios-separator))]/50"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <Skeleton className="h-9 w-9 rounded-[var(--ios-radius-sm)]" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-32 mb-2" />
                            <Skeleton className="h-8 w-44" />
                            <Skeleton className="h-3 w-36 mt-2" />
                        </div>
                    ))}
                </div>

                {/* Charts: Treemap (col-span-2) + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Treemap card */}
                    <div className="lg:col-span-2 bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 flex flex-col min-h-[500px]">
                        <div className="p-5 border-b border-[rgb(var(--ios-separator))]/50">
                            <Skeleton className="h-5 w-64 mb-1" />
                            <Skeleton className="h-3 w-52" />
                        </div>
                        {/* Desktop treemap blocks */}
                        <div className="hidden md:flex p-5 flex-1 flex-col gap-1">
                            <div className="flex flex-1 gap-1">
                                <Skeleton className="w-[45%] rounded-sm" style={{ minHeight: 280 }} />
                                <div className="flex flex-1 flex-col gap-1">
                                    <Skeleton className="h-[60%] w-full rounded-sm" />
                                    <div className="flex flex-1 gap-1">
                                        <Skeleton className="flex-1 rounded-sm" />
                                        <Skeleton className="flex-1 rounded-sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="h-[120px] flex gap-1">
                                <Skeleton className="w-[30%] rounded-sm" />
                                <Skeleton className="w-[25%] rounded-sm" />
                                <Skeleton className="w-[20%] rounded-sm" />
                                <Skeleton className="flex-1 rounded-sm" />
                            </div>
                        </div>
                        {/* Mobile bar chart */}
                        <div className="md:hidden p-5 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Top orgs + Donut */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5">
                            <Skeleton className="h-5 w-48 mb-5" />
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                        <Skeleton className="h-2 w-full rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 flex flex-col">
                            <Skeleton className="h-5 w-52 mb-4" />
                            <div className="flex items-center justify-center my-4">
                                <Skeleton className="w-48 h-48 rounded-full" />
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <Skeleton className="w-2.5 h-2.5 rounded-full" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-5 w-72" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                        <div className="flex gap-2">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-7 w-14 rounded-[var(--ios-radius-sm)]" />
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-64 w-full rounded-[var(--ios-radius-md)]" />
                </div>
            </div>
        </main>
    );
}
