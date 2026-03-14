export default function PublicProjectLoading() {
    return (
        <div className="container mx-auto px-4 py-8 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-2/3 mx-auto mb-4" />
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto mb-12" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="h-64 bg-slate-100 rounded-xl" />
                    <div className="h-40 bg-slate-100 rounded-xl" />
                </div>
                <div className="space-y-6">
                    <div className="h-40 bg-slate-100 rounded-xl" />
                    <div className="h-80 bg-slate-100 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
