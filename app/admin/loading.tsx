export default function AdminLoading() {
    return (
        <div className="space-y-6 pt-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 bg-slate-200 rounded w-1/4" />
                <div className="h-10 bg-slate-200 rounded w-32" />
            </div>

            <div className="h-32 bg-slate-100 rounded-lg" />

            <div className="space-y-4">
                <div className="h-12 bg-slate-200 rounded w-full" />
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-white border border-slate-100 rounded flex items-center p-4">
                            <div className="h-4 bg-slate-100 rounded w-1/6 mr-4" />
                            <div className="h-4 bg-slate-100 rounded w-1/3 mr-auto" />
                            <div className="h-4 bg-slate-100 rounded w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
