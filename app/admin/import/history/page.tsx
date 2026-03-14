import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle2, XCircle, RotateCcw, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { RollbackButton } from './rollback-button';

export default async function ImportHistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: batches } = await supabase
        .from('import_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    const items = batches || [];

    const statusLabels: Record<string, { label: string; color: string }> = {
        completed: { label: 'สำเร็จ', color: 'green' },
        failed: { label: 'ล้มเหลว', color: 'red' },
        rolled_back: { label: 'ย้อนกลับแล้ว', color: 'gray' },
        importing: { label: 'กำลังนำเข้า', color: 'blue' },
        pending: { label: 'รอดำเนินการ', color: 'yellow' },
    };

    const canRollback = (batch: any) => {
        if (batch.status !== 'completed') return false;
        const age = Date.now() - new Date(batch.created_at).getTime();
        return age < 24 * 60 * 60 * 1000; // 24 hours
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">ประวัติการนำเข้า</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    ดูประวัติการนำเข้าข้อมูลทั้งหมด สามารถย้อนกลับได้ภายใน 24 ชั่วโมง
                </p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-16">
                    <FileSpreadsheet className="w-12 h-12 text-[rgb(var(--ios-text-tertiary))] mx-auto mb-3" />
                    <p className="text-sm text-[rgb(var(--ios-text-tertiary))]">ยังไม่มีประวัติการนำเข้า</p>
                    <Link
                        href="/admin/import"
                        className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 ios-press"
                    >
                        นำเข้าข้อมูล
                    </Link>
                </div>
            ) : (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 divide-y divide-[rgb(var(--ios-separator))]/30">
                    {items.map((batch: any) => {
                        const info = statusLabels[batch.status] || statusLabels.pending;
                        const colorMap: Record<string, string> = {
                            green: 'bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))]',
                            red: 'bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))]',
                            gray: 'bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))]',
                            blue: 'bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))]',
                            yellow: 'bg-[rgb(var(--ios-orange))]/10 text-[rgb(var(--ios-orange))]',
                        };

                        return (
                            <div key={batch.id} className="px-4 py-3 flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-medium text-[rgb(var(--ios-text-primary))] truncate">
                                            {batch.file_name}
                                        </p>
                                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${colorMap[info.color]}`}>
                                            {info.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                                        {batch.user_email} &middot; พ.ศ. {batch.fiscal_year} &middot; {batch.campus}
                                        {' '}&middot; นำเข้า {batch.imported_rows}/{batch.total_rows} รายการ
                                    </p>
                                    <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {new Date(batch.created_at).toLocaleString('th-TH')}
                                    </p>
                                </div>

                                {canRollback(batch) && (
                                    <RollbackButton batchId={batch.id} projectCount={batch.project_ids?.length || 0} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
