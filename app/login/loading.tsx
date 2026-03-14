import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo / title */}
                <div className="text-center space-y-2">
                    <Skeleton className="h-10 w-10 rounded-[var(--ios-radius-md)] mx-auto" />
                    <Skeleton className="h-7 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </div>

                {/* Login card */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-8 space-y-5">
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-11 w-full rounded-[var(--ios-radius-md)]" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-11 w-full rounded-[var(--ios-radius-md)]" />
                    </div>
                    <Skeleton className="h-11 w-full rounded-[var(--ios-radius-lg)]" />
                </div>
            </div>
        </main>
    );
}
