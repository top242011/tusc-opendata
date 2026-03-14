import { Skeleton } from "@/components/ui/skeleton";

// Rendered inside AdminLayout (navbar + sidebar already provided)
export default function ProjectDetailLoading() {
    return (
        <div className="space-y-6">
            {/* Back button + title */}
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-[rgb(var(--ios-separator))]/50 mb-6 gap-1">
                {["ข้อมูลหลัก", "รายละเอียดโครงการ", "จัดการเอกสาร"].map((label) => (
                    <Skeleton key={label} className="h-11 w-36 rounded-t-md" />
                ))}
            </div>

            {/* Content card */}
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 space-y-5">
                <Skeleton className="h-5 w-40 mb-2" />
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full rounded-[var(--ios-radius-md)]" />
                    </div>
                ))}
                <div className="flex gap-3 pt-4">
                    <Skeleton className="h-10 w-28 rounded-[var(--ios-radius-lg)]" />
                    <Skeleton className="h-10 w-24 rounded-[var(--ios-radius-lg)]" />
                </div>
            </div>
        </div>
    );
}
