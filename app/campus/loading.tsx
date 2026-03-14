import { Skeleton } from "@/components/ui/skeleton";

export default function CampusLoading() {
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
            <section className="border-b border-[rgb(var(--ios-separator))]/40 py-12 md:py-16">
                <div className="container mx-auto px-4 text-center">
                    <Skeleton className="h-7 w-36 rounded-full mx-auto mb-5" />
                    <Skeleton className="h-9 w-72 mx-auto mb-3" />
                    <Skeleton className="h-5 w-80 mx-auto" />
                </div>
            </section>

            {/* Campus cards grid */}
            <section className="container mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <Skeleton className="size-12 rounded-[var(--ios-radius-md)]" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className="bg-[rgb(var(--ios-fill-tertiary))]/50 rounded-[var(--ios-radius-sm)] p-3 space-y-1.5">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
