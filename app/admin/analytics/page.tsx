import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAnalyticsData } from "@/lib/analytics-queries";
import { AnalyticsCharts, ExportButton } from "@/components/admin/analytics-charts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{ year?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const params = await searchParams;
    const selectedYear = params.year ? parseInt(params.year) : undefined;

    let data;
    let error: string | null = null;

    try {
        data = await getAnalyticsData(selectedYear);
    } catch (e) {
        error = 'ไม่สามารถโหลดข้อมูลวิเคราะห์ได้';
        data = null;
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">วิเคราะห์ข้อมูล</h1>
                    <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                        แนวโน้ม ผลงานองค์กร การจัดสรรงบ และตรวจจับความผิดปกติ
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {data && <ExportButton data={data} />}
                </div>
            </div>

            {/* Fiscal Year Filter */}
            {data && data.fiscalYears.length > 0 && (
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    <span className="text-sm text-[rgb(var(--ios-text-secondary))] whitespace-nowrap">ปีงบประมาณ:</span>
                    <Link
                        href="/admin/analytics"
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ios-press ${
                            !selectedYear
                                ? 'bg-[rgb(var(--ios-accent))] text-white'
                                : 'bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]/80'
                        }`}
                    >
                        ทั้งหมด
                    </Link>
                    {data.fiscalYears.map((year) => (
                        <Link
                            key={year}
                            href={`/admin/analytics?year=${year}`}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ios-press ${
                                selectedYear === year
                                    ? 'bg-[rgb(var(--ios-accent))] text-white'
                                    : 'bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]/80'
                            }`}
                        >
                            {year}
                        </Link>
                    ))}
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {data && (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <SummaryCard
                            label="โครงการทั้งหมด"
                            value={data.projects.length.toString()}
                        />
                        <SummaryCard
                            label="องค์กร"
                            value={data.orgPerformance.length.toString()}
                        />
                        <SummaryCard
                            label="ความผิดปกติ"
                            value={data.anomalies.length.toString()}
                            alert={data.anomalies.filter(a => a.severity === 'critical').length > 0}
                        />
                        <SummaryCard
                            label="ร้องเรียนรอดำเนินการ"
                            value={(data.complaintSummary.find(c => c.status === 'pending')?.count || 0).toString()}
                        />
                    </div>

                    <AnalyticsCharts data={data} selectedYear={selectedYear} />
                </>
            )}
        </div>
    );
}

function SummaryCard({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
    return (
        <div className={`bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border p-4 ${
            alert
                ? 'border-[rgb(var(--ios-red))]/30 bg-[rgb(var(--ios-red))]/5'
                : 'border-[rgb(var(--ios-separator))]/50'
        }`}>
            <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mb-1">{label}</p>
            <p className={`text-xl font-bold ${alert ? 'text-[rgb(var(--ios-red))]' : 'text-[rgb(var(--ios-text-primary))]'}`}>
                {value}
            </p>
        </div>
    );
}
