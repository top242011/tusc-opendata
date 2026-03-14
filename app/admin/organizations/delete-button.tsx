'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteOrganization } from '@/lib/organization-actions';

interface Props {
    id: number;
    name: string;
    hasProjects: boolean;
}

export function OrganizationDeleteButton({ id, name, hasProjects }: Props) {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    if (hasProjects) {
        return (
            <button
                disabled
                title="ไม่สามารถลบได้ เนื่องจากมีโครงการอ้างอิงอยู่"
                className="px-2 py-1 text-xs rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-text-tertiary))] cursor-not-allowed"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        );
    }

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteOrganization(id);
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
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
            <div className="flex items-center gap-1">
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-2 py-1 text-xs font-medium rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-red))] text-white hover:opacity-90 disabled:opacity-40"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ลบ'}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="px-2 py-1 text-xs rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                >
                    ยกเลิก
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="px-2 py-1 text-xs rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-red))] hover:bg-[rgb(var(--ios-red))]/5"
        >
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}
