import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentCheckerLoading() {
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

            <div className="container mx-auto px-4 md:px-8 py-10 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8 space-y-3">
                    <Skeleton className="h-6 w-32 rounded-full mx-auto" />
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <Skeleton className="h-4 w-80 mx-auto" />
                </div>

                {/* Upload card */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-8 space-y-6">
                    <Skeleton className="h-5 w-40" />
                    {/* Drop zone */}
                    <Skeleton className="h-40 w-full rounded-[var(--ios-radius-lg)]" />
                    <Skeleton className="h-11 w-full rounded-[var(--ios-radius-lg)]" />
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 space-y-2">
                            <Skeleton className="h-8 w-8 rounded-[var(--ios-radius-sm)]" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
