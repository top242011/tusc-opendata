export default function ProjectDetailLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-24 mb-6" />

            <div className="h-10 bg-slate-200 rounded w-3/4 mb-4" />
            <div className="h-6 bg-slate-100 rounded w-1/2 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg border h-64" />
                    <div className="bg-white p-6 rounded-lg border h-96" />
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border h-40" />
                    <div className="bg-white p-6 rounded-lg border h-60" />
                </div>
            </div>
        </div>
    );
}
