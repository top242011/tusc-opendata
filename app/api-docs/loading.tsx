import { Skeleton } from "@/components/ui/skeleton";

export default function ApiDocsLoading() {
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

            <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
                {/* Hero */}
                <div className="mb-10 space-y-3">
                    <Skeleton className="h-6 w-28 rounded-full" />
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>

                {/* Quick start box */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 mb-8">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-12 w-full rounded-[var(--ios-radius-md)]" />
                </div>

                {/* Endpoint sections */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 mb-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <div className="space-y-2 pl-4">
                            {[...Array(3)].map((_, j) => (
                                <Skeleton key={j} className="h-3 w-full" />
                            ))}
                        </div>
                        <Skeleton className="h-32 w-full rounded-[var(--ios-radius-md)]" />
                    </div>
                ))}
            </div>
        </main>
    );
}
