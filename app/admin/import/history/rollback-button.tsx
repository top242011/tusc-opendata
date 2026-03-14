'use client';

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { rollbackImportBatch } from '@/lib/import-batch-actions';
import { useRouter } from 'next/navigation';

interface Props {
    batchId: string;
    projectCount: number;
}

export function RollbackButton({ batchId, projectCount }: Props) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRollback = async () => {
        setLoading(true);
        try {
            const result = await rollbackImportBatch(batchId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'ย้อนกลับไม่สำเร็จ');
            }
        } catch {
            alert('เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
            setConfirming(false);
        }
    };

    if (confirming) {
        return (
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-[rgb(var(--ios-red))]">ลบ {projectCount} โครงการ?</span>
                <button
                    onClick={handleRollback}
                    disabled={loading}
                    className="px-2.5 py-1 text-xs font-medium rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-red))] text-white hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ยืนยัน'}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="px-2.5 py-1 text-xs font-medium rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 text-[rgb(var(--ios-text-tertiary))]"
                >
                    ยกเลิก
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-red))] hover:bg-[rgb(var(--ios-red))]/5 transition-colors flex-shrink-0"
        >
            <RotateCcw className="w-3.5 h-3.5" />
            ย้อนกลับ
        </button>
    );
}
