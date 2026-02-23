import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
            <section className="bg-gradient-to-br from-[rgb(var(--ios-accent))] via-blue-600 to-indigo-700 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 py-16 md:py-20 px-4">
                <div className="container mx-auto max-w-6xl flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-[var(--ios-radius-lg)] bg-white/15 animate-pulse" />
                    <div className="h-10 w-3/4 max-w-2xl bg-white/15 rounded-[var(--ios-radius-md)] animate-pulse" />
                    <div className="h-6 w-1/2 max-w-xl bg-white/15 rounded-[var(--ios-radius-sm)] animate-pulse" />
                    <div className="pt-6">
                        <div className="h-20 w-40 bg-white/15 rounded-[var(--ios-radius-lg)] animate-pulse" />
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-7xl px-4 -mt-8 relative z-10 space-y-6">
                {/* Stats Section Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-[var(--ios-radius-sm)]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32 mb-2" />
                                <Skeleton className="h-3 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Section Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-[500px]">
                        <CardHeader>
                            <Skeleton className="h-5 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-center py-6">
                                <Skeleton className="h-48 w-48 rounded-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-24 w-full rounded-[var(--ios-radius-md)]" />
                                <Skeleton className="h-24 w-full rounded-[var(--ios-radius-md)]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-[500px]">
                        <CardHeader>
                            <Skeleton className="h-5 w-56" />
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-5 flex-1 rounded-[var(--ios-radius-sm)]" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Table Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <Skeleton className="h-5 w-40" />
                            <div className="flex gap-2 flex-wrap">
                                <Skeleton className="h-10 w-48 rounded-[var(--ios-radius-sm)]" />
                                <Skeleton className="h-10 w-28 rounded-[var(--ios-radius-sm)]" />
                                <Skeleton className="h-10 w-28 rounded-[var(--ios-radius-sm)]" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-[var(--ios-radius-md)] border border-[rgb(var(--ios-separator))] overflow-hidden">
                            <div className="bg-[rgb(var(--ios-bg-tertiary))] px-4 py-3">
                                <div className="grid grid-cols-5 gap-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-4 w-full" />
                                    ))}
                                </div>
                            </div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="border-t border-[rgb(var(--ios-separator))] px-4 py-4">
                                    <div className="grid grid-cols-5 gap-4">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
