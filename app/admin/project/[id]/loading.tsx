import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl animate-pulse">
            {/* Header: back button + title + subtitle */}
            <div className="mb-6 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
            </div>

            {/* Tab bar: 3 tabs */}
            <div className="flex border-b border-slate-200 mb-6 gap-1">
                {["ข้อมูลหลัก", "รายละเอียดโครงการ", "จัดการเอกสาร"].map((_, i) => (
                    <Skeleton key={i} className="h-11 w-36 rounded-t-md" />
                ))}
            </div>

            {/* Single content card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-5">
                <Skeleton className="h-5 w-40 mb-2" />
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ))}
                <div className="flex gap-3 pt-4">
                    <Skeleton className="h-10 w-28 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
