import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20 animate-pulse">
            {/* AdminNavbar Skeleton */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4">
                <Skeleton className="h-6 w-32" />
                <div className="ml-auto flex items-center gap-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4">
                {/* AdminQuickStart Skeleton */}
                <Skeleton className="h-32 w-full rounded-lg my-6" />

                {/* Alert Skeleton */}
                <Skeleton className="h-16 w-full rounded-lg mb-6" />

                {/* Section 1: "การดำเนินการ" */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-12 w-56 rounded-lg" />
                    </div>
                    <Skeleton className="h-14 w-full rounded-lg" />
                </div>

                {/* Section 2: "จัดการข้อมูลโครงการ" */}
                <div>
                    <Skeleton className="h-8 w-56 mb-4" />

                    {/* Search/Filter bar */}
                    <Skeleton className="h-12 w-full rounded-lg mb-4" />

                    {/* Project rows */}
                    <div className="space-y-2">
                        {[...Array(5)].map((i) => (
                            <div
                                key={i}
                                className="h-16 bg-white border border-slate-100 rounded-lg flex items-center px-4 gap-4"
                            >
                                <Skeleton className="h-4 w-1/6" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-20 ml-auto" />
                                <Skeleton className="h-8 w-16 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
