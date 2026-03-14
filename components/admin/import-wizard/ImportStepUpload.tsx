'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, Loader2 } from 'lucide-react';
import { CAMPUS_LABELS, type Campus } from '@/lib/types';
import type { WizardState } from './ImportWizard';
import type { ParseResult } from '@/lib/template-parser';
import type { ValidationResult } from '@/lib/import-validator';

interface Props {
    state: WizardState;
    dispatch: React.Dispatch<any>;
}

export function ImportStepUpload({ state, dispatch }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        setError(null);

        // Validate file type
        const ext = file.name.toLowerCase().split('.').pop();
        if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
            setError('รองรับเฉพาะไฟล์ .xlsx, .xls หรือ .csv เท่านั้น');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('ไฟล์ใหญ่เกินไป (สูงสุด 10MB)');
            return;
        }

        dispatch({ type: 'SET_FILE', file });
        setIsProcessing(true);

        try {
            // Dynamic import to avoid bundling on server
            const { parseImportFile } = await import('@/lib/template-parser');
            const { validateImportRows } = await import('@/lib/import-validator');

            const parseResult: ParseResult = await parseImportFile(file);
            dispatch({ type: 'SET_PARSE_RESULT', result: parseResult });

            if (parseResult.rows.length === 0) {
                setError('ไม่พบข้อมูลในไฟล์ กรุณาตรวจสอบว่ามีข้อมูลอย่างน้อย 1 แถว');
                setIsProcessing(false);
                return;
            }

            if (parseResult.rows.length > 500) {
                setError(`มีข้อมูล ${parseResult.rows.length} แถว (สูงสุด 500 แถวต่อครั้ง)`);
                setIsProcessing(false);
                return;
            }

            // Fetch existing data for validation
            const res = await fetch('/api/import-validation-data');
            const { organizations, projects } = await res.json();

            const validationResult: ValidationResult = await validateImportRows(
                parseResult.rows,
                organizations,
                projects
            );

            dispatch({ type: 'SET_VALIDATION_RESULT', result: validationResult });
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
        } finally {
            setIsProcessing(false);
        }
    }, [dispatch]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => setIsDragging(false), []);

    const fiscalYears = Array.from({ length: 5 }, (_, i) => {
        const y = new Date().getFullYear() + 543;
        return y - 2 + i;
    });

    return (
        <div className="space-y-6">
            {/* Settings Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-[rgb(var(--ios-text-secondary))] mb-1.5">
                        ปีงบประมาณ
                    </label>
                    <select
                        value={state.fiscalYear}
                        onChange={(e) => dispatch({ type: 'SET_FISCAL_YEAR', year: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-sm text-[rgb(var(--ios-text-primary))] focus:ring-2 focus:ring-[rgb(var(--ios-accent))]/30 focus:border-[rgb(var(--ios-accent))]"
                    >
                        {fiscalYears.map(y => (
                            <option key={y} value={y}>พ.ศ. {y}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[rgb(var(--ios-text-secondary))] mb-1.5">
                        ศูนย์การศึกษา
                    </label>
                    <select
                        value={state.campus}
                        onChange={(e) => dispatch({ type: 'SET_CAMPUS', campus: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-sm text-[rgb(var(--ios-text-primary))] focus:ring-2 focus:ring-[rgb(var(--ios-accent))]/30 focus:border-[rgb(var(--ios-accent))]"
                    >
                        {Object.entries(CAMPUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Template Download */}
            <div className="flex items-center gap-3 p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-accent))]/5 border border-[rgb(var(--ios-accent))]/15">
                <FileSpreadsheet className="w-5 h-5 text-[rgb(var(--ios-accent))] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-[rgb(var(--ios-text-primary))]">
                        ยังไม่มีไฟล์? ดาวน์โหลด template มาตรฐานแล้วกรอกข้อมูลก่อนอัปโหลด
                    </p>
                </div>
                <a
                    href="/api/import-template"
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white text-sm font-medium hover:opacity-90 transition-opacity ios-press flex-shrink-0"
                >
                    <Download className="w-4 h-4" />
                    ดาวน์โหลด
                </a>
            </div>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative cursor-pointer rounded-[var(--ios-radius)] border-2 border-dashed
                    p-10 text-center transition-colors
                    ${isDragging
                        ? 'border-[rgb(var(--ios-accent))] bg-[rgb(var(--ios-accent))]/5'
                        : 'border-[rgb(var(--ios-separator))] hover:border-[rgb(var(--ios-accent))]/50 hover:bg-[rgb(var(--ios-fill-tertiary))]'
                    }
                    ${isProcessing ? 'pointer-events-none opacity-60' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                    }}
                />

                {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-[rgb(var(--ios-accent))] animate-spin" />
                        <p className="text-sm text-[rgb(var(--ios-text-secondary))]">กำลังอ่านและตรวจสอบไฟล์...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-[rgb(var(--ios-accent))]/10 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-[rgb(var(--ios-accent))]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[rgb(var(--ios-text-primary))]">
                                ลากไฟล์วางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                            </p>
                            <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">
                                รองรับ .xlsx, .xls, .csv (สูงสุด 500 แถว, 10MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-red))]/5 border border-[rgb(var(--ios-red))]/20">
                    <AlertCircle className="w-5 h-5 text-[rgb(var(--ios-red))] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[rgb(var(--ios-red))]">{error}</p>
                </div>
            )}
        </div>
    );
}
