'use client';

import { useState, useCallback } from 'react';
import {
    CheckCircle2, XCircle, Loader2, ArrowLeft, RotateCcw,
    FileSpreadsheet, Building2, AlertTriangle, ExternalLink,
} from 'lucide-react';
import type { WizardState } from './ImportWizard';
import Link from 'next/link';

interface Props {
    state: WizardState;
    dispatch: React.Dispatch<any>;
    onReset: () => void;
}

export function ImportStepConfirm({ state, dispatch, onReset }: Props) {
    const { validationResult, importProgress, fiscalYear, campus } = state;
    const [batchId, setBatchId] = useState<string | null>(null);

    if (!validationResult) return null;

    const validRows = validationResult.rows.filter(r => r._isValid);
    const { status, current, total, errorMessages } = importProgress;

    const startImport = useCallback(async () => {
        dispatch({
            type: 'SET_IMPORT_PROGRESS',
            progress: { status: 'importing', current: 0, total: validRows.length, errorMessages: [] },
        });

        try {
            const res = await fetch('/api/import-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rows: validRows,
                    fiscalYear,
                    campus,
                    fileName: state.file?.name || 'unknown',
                }),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                dispatch({
                    type: 'SET_IMPORT_PROGRESS',
                    progress: {
                        status: 'error',
                        errorMessages: [result.error || 'เกิดข้อผิดพลาดในการนำเข้า'],
                    },
                });
                return;
            }

            setBatchId(result.batchId);

            dispatch({
                type: 'SET_IMPORT_PROGRESS',
                progress: {
                    status: 'done',
                    current: result.imported,
                    total: validRows.length,
                    errorMessages: result.errors || [],
                },
            });

            // Store imported project IDs
            if (result.projectIds) {
                for (const id of result.projectIds) {
                    dispatch({ type: 'ADD_IMPORTED_ID', id });
                }
            }
        } catch (err: any) {
            dispatch({
                type: 'SET_IMPORT_PROGRESS',
                progress: {
                    status: 'error',
                    errorMessages: [err.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'],
                },
            });
        }
    }, [validRows, fiscalYear, campus, state.file, dispatch]);

    // Pre-import confirmation view
    if (status === 'idle') {
        return (
            <div className="space-y-6">
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-5">
                    <h3 className="text-base font-semibold text-[rgb(var(--ios-text-primary))] mb-4">
                        สรุปการนำเข้า
                    </h3>
                    <div className="space-y-3">
                        <SummaryRow icon={FileSpreadsheet} label="ไฟล์" value={state.file?.name || '—'} />
                        <SummaryRow icon={Building2} label="ปีงบประมาณ" value={`พ.ศ. ${fiscalYear}`} />
                        <SummaryRow icon={Building2} label="ศูนย์การศึกษา" value={campus} />
                        <div className="border-t border-[rgb(var(--ios-separator))]/30 pt-3 mt-3">
                            <SummaryRow
                                icon={CheckCircle2}
                                label="จำนวนที่จะนำเข้า"
                                value={`${validRows.length} รายการ`}
                                valueColor="green"
                            />
                            {validationResult.summary.errorRows > 0 && (
                                <SummaryRow
                                    icon={XCircle}
                                    label="ข้ามเนื่องจากข้อผิดพลาด"
                                    value={`${validationResult.summary.errorRows} รายการ`}
                                    valueColor="red"
                                />
                            )}
                        </div>

                        {validationResult.summary.newOrganizations.length > 0 && (
                            <div className="border-t border-[rgb(var(--ios-separator))]/30 pt-3 mt-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-[rgb(var(--ios-orange))] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                                            จะสร้างองค์กรใหม่ {validationResult.summary.newOrganizations.length} องค์กร
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {validationResult.summary.newOrganizations.map(org => (
                                                <span key={org} className="px-2 py-0.5 text-xs rounded-full bg-[rgb(var(--ios-orange))]/10 text-[rgb(var(--ios-orange))]">
                                                    {org}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => dispatch({ type: 'GO_TO_STEP', step: 2 })}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        กลับไปตรวจสอบ
                    </button>
                    <button
                        onClick={startImport}
                        className="px-6 py-2.5 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 transition-opacity ios-press"
                    >
                        ยืนยันนำเข้า {validRows.length} รายการ
                    </button>
                </div>
            </div>
        );
    }

    // Importing view
    if (status === 'importing') {
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        return (
            <div className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="w-10 h-10 text-[rgb(var(--ios-accent))] animate-spin" />
                <p className="text-sm font-medium text-[rgb(var(--ios-text-primary))]">
                    กำลังนำเข้าข้อมูล...
                </p>
                <div className="w-64">
                    <div className="h-2 rounded-full bg-[rgb(var(--ios-fill-tertiary))] overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[rgb(var(--ios-accent))] transition-all duration-300"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <p className="text-xs text-[rgb(var(--ios-text-tertiary))] text-center mt-1.5">
                        {current}/{total} ({percent}%)
                    </p>
                </div>
            </div>
        );
    }

    // Done view
    if (status === 'done') {
        return (
            <div className="space-y-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-[rgb(var(--ios-green))]/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-[rgb(var(--ios-green))]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))]">
                        นำเข้าสำเร็จ!
                    </h3>
                    <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                        นำเข้าข้อมูลแล้ว {current} จาก {total} รายการ
                    </p>
                </div>

                {errorMessages.length > 0 && (
                    <div className="p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-red))]/5 border border-[rgb(var(--ios-red))]/20 space-y-1">
                        <p className="text-sm font-medium text-[rgb(var(--ios-red))]">
                            บางรายการนำเข้าไม่สำเร็จ:
                        </p>
                        {errorMessages.map((msg, i) => (
                            <p key={i} className="text-xs text-[rgb(var(--ios-red))]">{msg}</p>
                        ))}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/admin/projects"
                        className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 ios-press"
                    >
                        <ExternalLink className="w-4 h-4" />
                        ดูโครงการ
                    </Link>
                    {batchId && (
                        <Link
                            href="/admin/import/history"
                            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                        >
                            ดูประวัติการนำเข้า
                        </Link>
                    )}
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                    >
                        <RotateCcw className="w-4 h-4" />
                        นำเข้าเพิ่ม
                    </button>
                </div>
            </div>
        );
    }

    // Error view
    return (
        <div className="space-y-6">
            <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[rgb(var(--ios-red))]/10 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-[rgb(var(--ios-red))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))]">
                    เกิดข้อผิดพลาด
                </h3>
                <div className="mt-2 space-y-1">
                    {errorMessages.map((msg, i) => (
                        <p key={i} className="text-sm text-[rgb(var(--ios-red))]">{msg}</p>
                    ))}
                </div>
            </div>
            <div className="flex justify-center gap-3">
                <button
                    onClick={() => dispatch({ type: 'SET_IMPORT_PROGRESS', progress: { status: 'idle', errorMessages: [] } })}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                >
                    <RotateCcw className="w-4 h-4" />
                    ลองใหม่
                </button>
                <button
                    onClick={onReset}
                    className="px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                >
                    เริ่มต้นใหม่
                </button>
            </div>
        </div>
    );
}

function SummaryRow({ icon: Icon, label, value, valueColor }: {
    icon: React.ElementType; label: string; value: string; valueColor?: string;
}) {
    const colorMap: Record<string, string> = {
        green: 'text-[rgb(var(--ios-green))]',
        red: 'text-[rgb(var(--ios-red))]',
    };
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--ios-text-secondary))]">
                <Icon className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />
                {label}
            </div>
            <span className={`text-sm font-medium ${valueColor ? colorMap[valueColor] : 'text-[rgb(var(--ios-text-primary))]'}`}>
                {value}
            </span>
        </div>
    );
}
