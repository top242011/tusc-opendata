import { PublicNavbar } from "@/components/public-navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Navbar - Static content to prevent layout shift */}
            <PublicNavbar />

            {/* Hero Section Skeleton */}
            <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-20 px-4 h-[500px]">
                <div className="container mx-auto max-w-6xl flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse" />
                    <div className="h-12 w-3/4 max-w-2xl bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-8 w-1/2 max-w-xl bg-white/10 rounded-lg animate-pulse" />
                    <div className="pt-8">
                        <div className="h-16 w-48 bg-white/10 rounded-lg animate-pulse" />
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-7xl px-4 -mt-10 relative z-10 space-y-8">
                {/* Stats Section Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Section Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pie Chart Skeleton */}
                    <Card className="h-[500px]">
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-center py-8">
                                <Skeleton className="h-64 w-64 rounded-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-24 w-full rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bar Chart Skeleton */}
                    <Card className="h-[500px]">
                        <CardHeader>
                            <Skeleton className="h-6 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 flex-1" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Table Skeleton */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <div className="border-b px-4 py-3">
                                <div className="grid grid-cols-6 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <Skeleton key={i} className="h-4 w-full" />
                                    ))}
                                </div>
                            </div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="border-b px-4 py-4">
                                    <div className="grid grid-cols-6 gap-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
