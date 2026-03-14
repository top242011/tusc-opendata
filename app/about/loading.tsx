import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
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
            <section className="border-b border-[rgb(var(--ios-separator))]/40 py-14">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <Skeleton className="h-6 w-40 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-10 w-72 mx-auto mb-3" />
                    <Skeleton className="h-4 w-96 mx-auto mb-2" />
                    <Skeleton className="h-4 w-80 mx-auto" />
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl space-y-12">
                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 space-y-3">
                            <Skeleton className="h-10 w-10 rounded-[var(--ios-radius-md)]" />
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                        </div>
                    ))}
                </div>

                {/* Content block */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-8 space-y-4">
                    <Skeleton className="h-6 w-48 mb-6" />
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </main>
    );
}
