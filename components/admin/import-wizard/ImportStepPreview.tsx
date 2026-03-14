'use client';

import { useState, useMemo } from 'react';
import {
    CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
    Pencil, Trash2, ArrowLeft, Search, Filter,
} from 'lucide-react';
import type { WizardState } from './ImportWizard';
import type { ImportRow } from '@/lib/types';

interface Props {
    state: WizardState;
    dispatch: React.Dispatch<any>;
}

type FilterMode = 'all' | 'errors' | 'warnings' | 'valid';

export function ImportStepPreview({ state, dispatch }: Props) {
    const { validationResult } = state;
    const [filter, setFilter] = useState<FilterMode>('all');
    const [search, setSearch] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<ImportRow>>({});
    const [page, setPage] = useState(0);
    const pageSize = 20;

    if (!validationResult) return null;
    const { rows, summary } = validationResult;

    const filteredRows = useMemo(() => {
        let result = rows;

        if (filter === 'errors') result = result.filter(r => !r._isValid);
        else if (filter === 'warnings') result = result.filter(r => r._isValid && r._warnings.length > 0);
        else if (filter === 'valid') result = result.filter(r => r._isValid && r._warnings.length === 0);

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(r =>
                r.project_name.toLowerCase().includes(q) ||
                r.organization.toLowerCase().includes(q)
            );
        }

        return result;
    }, [rows, filter, search]);

    const totalPages = Math.ceil(filteredRows.length / pageSize);
    const paged = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

    const validCount = rows.filter(r => r._isValid).length;
    const canProceed = validCount > 0;

    const startEditing = (idx: number) => {
        const globalIdx = rows.indexOf(filteredRows[page * pageSize + idx]);
        const row = rows[globalIdx];
        setEditingIndex(globalIdx);
        setEditForm({
            organization: row.organization,
            project_name: row.project_name,
            budget_requested: row.budget_requested,
            budget_approved: row.budget_approved,
            budget_average: row.budget_average,
            notes: row.notes,
        });
    };

    const saveEdit = async () => {
        if (editingIndex === null) return;
        const original = rows[editingIndex];
        const updated: ImportRow = {
            ...original,
            ...editForm,
            budget_requested: Number(editForm.budget_requested) || 0,
            budget_approved: Number(editForm.budget_approved) || 0,
            budget_average: editForm.budget_average !== undefined ? Number(editForm.budget_average) || 0 : undefined,
        };

        // Re-validate this single row
        const errors: ImportRow['_errors'] = [];
        if (!updated.project_name?.trim()) {
            errors.push({ row: updated._rowNumber, column: 'ชื่อโครงการ', value: updated.project_name, message: 'ต้องระบุชื่อโครงการ', severity: 'error' });
        }
        if (!updated.organization?.trim()) {
            errors.push({ row: updated._rowNumber, column: 'ชื่อองค์กร', value: updated.organization, message: 'ต้องระบุชื่อองค์กร', severity: 'error' });
        }
        if (updated.budget_requested < 0) {
            errors.push({ row: updated._rowNumber, column: 'งบที่เสนอขอ', value: updated.budget_requested, message: 'งบต้องไม่ติดลบ', severity: 'error' });
        }
        if (updated.budget_approved < 0) {
            errors.push({ row: updated._rowNumber, column: 'งบที่อนุมัติ', value: updated.budget_approved, message: 'งบต้องไม่ติดลบ', severity: 'error' });
        }
        updated._errors = errors;
        updated._isValid = errors.length === 0;
        updated._warnings = [];

        dispatch({ type: 'UPDATE_ROW', index: editingIndex, row: updated });
        setEditingIndex(null);
        setEditForm({});
    };

    const removeRow = (localIdx: number) => {
        const globalIdx = rows.indexOf(filteredRows[page * pageSize + localIdx]);
        dispatch({ type: 'REMOVE_ROW', index: globalIdx });
    };

    const formatNum = (n: number) => new Intl.NumberFormat('th-TH').format(n);

    return (
        <div className="space-y-4">
            {/* Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryPill
                    label="ทั้งหมด"
                    count={summary.totalRows}
                    color="gray"
                    active={filter === 'all'}
                    onClick={() => { setFilter('all'); setPage(0); }}
                />
                <SummaryPill
                    label="ผ่าน"
                    count={summary.validRows}
                    color="green"
                    active={filter === 'valid'}
                    onClick={() => { setFilter('valid'); setPage(0); }}
                />
                <SummaryPill
                    label="คำเตือน"
                    count={summary.warningRows}
                    color="yellow"
                    active={filter === 'warnings'}
                    onClick={() => { setFilter('warnings'); setPage(0); }}
                />
                <SummaryPill
                    label="ข้อผิดพลาด"
                    count={summary.errorRows}
                    color="red"
                    active={filter === 'errors'}
                    onClick={() => { setFilter('errors'); setPage(0); }}
                />
            </div>

            {/* New Organizations Notice */}
            {summary.newOrganizations.length > 0 && (
                <div className="p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-orange))]/5 border border-[rgb(var(--ios-orange))]/20">
                    <p className="text-sm text-[rgb(var(--ios-text-primary))] font-medium mb-1">
                        องค์กรใหม่ที่จะถูกสร้างอัตโนมัติ ({summary.newOrganizations.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {summary.newOrganizations.map(org => (
                            <span key={org} className="px-2 py-0.5 text-xs rounded-full bg-[rgb(var(--ios-orange))]/10 text-[rgb(var(--ios-orange))]">
                                {org}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />
                <input
                    type="text"
                    placeholder="ค้นหาโครงการหรือองค์กร..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] focus:ring-2 focus:ring-[rgb(var(--ios-accent))]/30"
                />
            </div>

            {/* Table */}
            <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[rgb(var(--ios-fill-tertiary))]">
                                <th className="px-3 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))] w-10">#</th>
                                <th className="px-3 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))]">สถานะ</th>
                                <th className="px-3 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))] min-w-[140px]">องค์กร</th>
                                <th className="px-3 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))] min-w-[200px]">โครงการ</th>
                                <th className="px-3 py-2.5 text-right font-medium text-[rgb(var(--ios-text-secondary))]">งบเสนอขอ</th>
                                <th className="px-3 py-2.5 text-right font-medium text-[rgb(var(--ios-text-secondary))]">งบอนุมัติ</th>
                                <th className="px-3 py-2.5 text-center font-medium text-[rgb(var(--ios-text-secondary))] w-20">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--ios-separator))]/30">
                            {paged.map((row, localIdx) => {
                                const hasErrors = !row._isValid;
                                const hasWarnings = row._isValid && row._warnings.length > 0;

                                return (
                                    <tr
                                        key={row._rowNumber}
                                        className={`
                                            ${hasErrors ? 'bg-[rgb(var(--ios-red))]/3' : hasWarnings ? 'bg-[rgb(var(--ios-orange))]/3' : ''}
                                            hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors
                                        `}
                                    >
                                        <td className="px-3 py-2 text-[rgb(var(--ios-text-tertiary))]">{row._rowNumber}</td>
                                        <td className="px-3 py-2">
                                            {hasErrors ? (
                                                <span className="inline-flex items-center gap-1 text-[rgb(var(--ios-red))]">
                                                    <XCircle className="w-4 h-4" />
                                                    <span className="text-xs">ผิด</span>
                                                </span>
                                            ) : hasWarnings ? (
                                                <span className="inline-flex items-center gap-1 text-[rgb(var(--ios-orange))]">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span className="text-xs">เตือน</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[rgb(var(--ios-green))]">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-xs">ผ่าน</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-[rgb(var(--ios-text-primary))]">
                                            <span className="truncate block max-w-[160px]">{row.organization || '—'}</span>
                                        </td>
                                        <td className="px-3 py-2 text-[rgb(var(--ios-text-primary))]">
                                            <span className="truncate block max-w-[240px]">{row.project_name || '—'}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-[rgb(var(--ios-text-primary))] tabular-nums">
                                            {formatNum(row.budget_requested)}
                                        </td>
                                        <td className="px-3 py-2 text-right text-[rgb(var(--ios-text-primary))] tabular-nums">
                                            {formatNum(row.budget_approved)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => startEditing(localIdx)}
                                                    className="p-1 rounded hover:bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))] hover:text-[rgb(var(--ios-accent))]"
                                                    title="แก้ไข"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeRow(localIdx)}
                                                    className="p-1 rounded hover:bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-text-tertiary))] hover:text-[rgb(var(--ios-red))]"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Error Details for visible rows */}
                {paged.some(r => r._errors.length > 0 || r._warnings.length > 0) && (
                    <div className="border-t border-[rgb(var(--ios-separator))]/30 p-3 space-y-1.5">
                        <p className="text-xs font-medium text-[rgb(var(--ios-text-tertiary))]">รายละเอียดปัญหา:</p>
                        {paged.flatMap(r => [...r._errors, ...r._warnings]).slice(0, 10).map((msg, i) => (
                            <p key={i} className={`text-xs ${msg.severity === 'error' ? 'text-[rgb(var(--ios-red))]' : 'text-[rgb(var(--ios-orange))]'}`}>
                                {msg.message}
                            </p>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-[rgb(var(--ios-separator))]/30 px-3 py-2 flex items-center justify-between">
                        <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                            แสดง {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filteredRows.length)} จาก {filteredRows.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-1 rounded hover:bg-[rgb(var(--ios-fill-tertiary))] disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-[rgb(var(--ios-text-secondary))] px-2">
                                {page + 1}/{totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="p-1 rounded hover:bg-[rgb(var(--ios-fill-tertiary))] disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setEditingIndex(null)}>
                    <div
                        className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] w-full max-w-md p-5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-base font-semibold text-[rgb(var(--ios-text-primary))] mb-4">
                            แก้ไขแถวที่ {rows[editingIndex]._rowNumber}
                        </h3>
                        <div className="space-y-3">
                            <EditField label="องค์กร" value={editForm.organization || ''} onChange={v => setEditForm(f => ({ ...f, organization: v }))} />
                            <EditField label="ชื่อโครงการ" value={editForm.project_name || ''} onChange={v => setEditForm(f => ({ ...f, project_name: v }))} />
                            <EditField label="งบเสนอขอ" value={String(editForm.budget_requested ?? '')} onChange={v => setEditForm(f => ({ ...f, budget_requested: Number(v) || 0 }))} type="number" />
                            <EditField label="งบอนุมัติ" value={String(editForm.budget_approved ?? '')} onChange={v => setEditForm(f => ({ ...f, budget_approved: Number(v) || 0 }))} type="number" />
                            <EditField label="งบเฉลี่ย" value={String(editForm.budget_average ?? '')} onChange={v => setEditForm(f => ({ ...f, budget_average: v ? Number(v) : undefined }))} type="number" />
                            <EditField label="หมายเหตุ" value={editForm.notes || ''} onChange={v => setEditForm(f => ({ ...f, notes: v }))} />
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => setEditingIndex(null)}
                                className="flex-1 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={saveEdit}
                                className="flex-1 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90"
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => dispatch({ type: 'RESET' })}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    เลือกไฟล์ใหม่
                </button>
                <button
                    onClick={() => dispatch({ type: 'GO_TO_STEP', step: 3 })}
                    disabled={!canProceed}
                    className="px-6 py-2.5 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity ios-press"
                >
                    นำเข้า {validCount} รายการ
                </button>
            </div>
        </div>
    );
}

function SummaryPill({ label, count, color, active, onClick }: {
    label: string; count: number; color: string; active: boolean; onClick: () => void;
}) {
    const colors: Record<string, string> = {
        gray: 'text-[rgb(var(--ios-text-secondary))]',
        green: 'text-[rgb(var(--ios-green))]',
        yellow: 'text-[rgb(var(--ios-orange))]',
        red: 'text-[rgb(var(--ios-red))]',
    };

    return (
        <button
            onClick={onClick}
            className={`
                flex items-center justify-between px-3 py-2 rounded-[var(--ios-radius-sm)] text-left transition-colors
                ${active
                    ? 'bg-[rgb(var(--ios-accent))]/10 ring-1 ring-[rgb(var(--ios-accent))]/30'
                    : 'bg-[rgb(var(--ios-fill-tertiary))] hover:bg-[rgb(var(--ios-fill-secondary))]'
                }
            `}
        >
            <span className="text-xs text-[rgb(var(--ios-text-secondary))]">{label}</span>
            <span className={`text-base font-bold ${colors[color]}`}>{count}</span>
        </button>
    );
}

function EditField({ label, value, onChange, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-[rgb(var(--ios-text-tertiary))] mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] focus:ring-2 focus:ring-[rgb(var(--ios-accent))]/30"
            />
        </div>
    );
}
