'use client';

import { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Save, RotateCcw, Link as LinkIcon, Trash2, FileSpreadsheet, File as FileIcon, AlertTriangle } from 'lucide-react';
import { analyzeFileForImport, saveImportedProject, ImportPreviewItem } from '@/lib/bulk-import-actions';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatTHB } from '@/lib/utils';

export default function ImportWorkbench() {
    const [files, setFiles] = useState<File[]>([]); // All raw files available in session
    const [items, setItems] = useState<ImportPreviewItem[]>([]); // The "Staging Table"


    // Status Logic
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    // --- 1. Universal Dropzone Logic ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputFiles = e.target.files;
        if (!inputFiles || inputFiles.length === 0) return;

        setIsAnalyzing(true);
        setLogs(prev => [...prev, `กำลังเตรียมไฟล์ ${inputFiles.length} ไฟล์...`]);

        try {
            const processedFiles: File[] = [];

            for (let i = 0; i < inputFiles.length; i++) {
                const file = inputFiles[i];
                if (file.name.endsWith('.zip')) {
                    const zip = new JSZip();
                    const contents = await zip.loadAsync(file);
                    for (const path in contents.files) {
                        const entry = contents.files[path];
                        if (!entry.dir && (entry.name.endsWith('.pdf') || entry.name.endsWith('.xlsx') || entry.name.endsWith('.xls'))) {
                            const blob = await entry.async('blob');
                            const ext = entry.name.split('.').pop();
                            processedFiles.push(new File([blob], entry.name, { type: ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                        }
                    }
                } else {
                    processedFiles.push(file);
                }
            }

            // Append to session files
            setFiles(prev => [...prev, ...processedFiles]);

            // Analyze ONLY the new files? Or re-analyze all? 
            // Better to analyze new ones and append to items.
            await analyzeNewFiles(processedFiles);

        } catch (error) {
            console.error(error);
            setLogs(prev => [...prev, `ข้อผิดพลาด: การอัปโหลดล้มเหลว`]);
            setIsAnalyzing(false);
        }

        // Reset input
        e.target.value = '';
    };

    const analyzeNewFiles = async (newFiles: File[]) => {
        const newResults: ImportPreviewItem[] = [];
        let completed = 0;

        for (const file of newFiles) {
            setProgress(Math.round((completed / newFiles.length) * 100));
            setLogs(prev => [`กำลังวิเคราะห์: ${file.name}...`, ...prev.slice(0, 4)]); // Keep last 5 logs

            const formData = new FormData();
            formData.append('file', file);

            try {
                const result = await analyzeFileForImport(formData);
                if (result.success && result.data) {
                    newResults.push(...result.data);
                } else {
                    setLogs(prev => [`❌ ล้มเหลว: ${file.name}`, ...prev]);
                }
            } catch (err) {
                console.error(err);
            }
            completed++;
        }

        // Merge with existing items
        setItems(prev => {
            const merged = [...prev, ...newResults];
            return performAutoLinking(merged); // Run auto-linker on the WHOLE set
        });

        setIsAnalyzing(false);
        setProgress(0);
        setLogs(prev => [`✅ เพิ่ม ${newResults.length} รายการลงในพื้นที่งาน`, ...prev]);
    };

    // --- 2. Auto-Linker (Flexible Order) ---
    const performAutoLinking = (allItems: ImportPreviewItem[]): ImportPreviewItem[] => {
        // Reset and clone items
        const itemsCopy: ImportPreviewItem[] = allItems.map(i => ({
            ...i,
            // Preserve UPDATE status if it was already identified as DB Link, otherwise NEW
            // We NO LONGER use 'MISSING_INFO' for Excel items as they are now considered valid standalone sources
            status: i.existingProjectId ? 'UPDATE' : 'NEW',
            reason: i.existingProjectId ? i.reason : undefined, // Keep reason if it was "Matches DB..."
            budgetMismatch: undefined,
            data: { ...i.data }
        }));

        const excelItems = itemsCopy.filter(i => i.source === 'EXCEL');
        const pdfItems = itemsCopy.filter(i => i.source === 'PDF');

        const norm = (s: string) => s?.toLowerCase().replace(/\s+/g, '').replace(/[\-_\.]/g, '') || '';

        // Match Logic
        pdfItems.forEach(pdf => {
            const pdfName = norm(pdf.data.project_name || '');
            const match = excelItems.find(ex => {
                const exName = norm(ex.data.project_name || '');
                return (exName.includes(pdfName) || pdfName.includes(exName)) && pdfName.length > 4;
            });

            if (match) {
                // Mutual Link
                match.status = 'LINKED';
                pdf.status = 'CONFLICT'; // Mark PDF as subsumed

                // Merge Data
                match.data = {
                    ...match.data,
                    ...pdf.data,
                    budget_approved: match.data.budget_approved,
                    budget_average: match.data.budget_average,
                    notes: match.data.notes || pdf.data.notes
                };
                match.fileName = `${match.fileName} + ${pdf.fileName}`;

                // Budget Check
                const budgetPdf = pdf.data.budget_requested || 0;
                const budgetExc = match.data.budget_requested || 0;

                if (budgetPdf > 0 && budgetExc > 0 && Math.abs(budgetPdf - budgetExc) > 100) {
                    match.budgetMismatch = { pdf: budgetPdf, excel: budgetExc };
                    match.reason = "⚠️ ยอดเงินไม่ตรงกัน (ยึด Excel เป็นหลัก)";
                } else {
                    match.reason = "✅ ตรวจสอบแล้ว";
                }

            } else {
                // PDF Standalone
                // We keep it as NEW (or UPDATE if it matched DB during analysis)
                // Just warn if it's not in the master list
                if (excelItems.length > 0 && pdf.status !== 'UPDATE') {
                    // Only warn for NEW items that are not in the master list
                    pdf.reason = '⚠️ ไม่อยู่ในรายชื่อหลัก';
                }
            }
        });

        // Review Excel Items that were NOT linked
        excelItems.forEach(ex => {
            if (ex.status !== 'LINKED') {
                // It remains NEW or UPDATE.
                // We just add a note that it has no PDF.
                // We do NOT block it.
                if (!ex.reason) { // Don't overwrite "Matches DB" reason
                    ex.reason = '⚠️ ไม่พบไฟล์ PDF (จะนำเข้าเฉพาะข้อมูล)';
                }
            }
        });

        return [...excelItems, ...pdfItems.filter(p => p.status !== 'CONFLICT')];
    };

    // --- 3. Import Action (Persistent Master) ---
    const handleImportAll = async () => {
        setIsImporting(true);

        // Import LINKED, UPDATE, and NEW items
        const itemsToImport = items.filter(i =>
            i.status === 'LINKED' ||
            i.status === 'UPDATE' ||
            i.status === 'NEW'
        );
        // actually we might want to import 'NEW' excel items even if no PDF? 
        // User said: "CSV is Master". If CSV has item but no PDF, do interpret as "Missing Info". 
        // Usually we don't import Missing Info items until PDF arrives? 
        // Or do we import them as "Drafts"?
        // Let's stick to importing EVERYTHING that is valid Project. 
        // But for "Missing Info", maybe we skip? 
        // "If no project in this file, it means rejected". 
        // So we should only import what we have.
        // Let's import LINKED items definitely.
        // What about MISSING_INFO? If we import them, they are just skeletons.
        // Let's import ALL for now, but usually user wants "Complete" projects.
        // Re-reading: "Upload CSV... AI checks... Fill data".
        // Let's import everything that is in the workbench (except UNLISTED PDFs usually, but here we can import them as ghosts if we want, but logic says Rejected).
        // Let's import matching items.

        let completed = 0;
        const total = itemsToImport.length;

        if (total === 0) {
            setLogs(prev => [`⚠️ ไม่มีรายการที่เชื่อมโยง/พร้อมนำเข้า`]);
            setIsImporting(false);
            return;
        }

        for (const item of itemsToImport) {
            setLogs(prev => [`กำลังบันทึก: ${item.data.project_name}...`, ...prev.slice(0, 4)]);

            let fileToUpload: File | undefined = undefined;
            // Find matched PDF file
            // Logic: item.fileName might be "Excel + PDF". 
            // We need to find the PDF file in 'files' state.
            // We can look for files that are NOT excel.
            const pdfPartOfName = item.fileName.split(' + ')[1];
            if (pdfPartOfName) {
                fileToUpload = files.find(f => f.name === pdfPartOfName);
            }

            const formData = new FormData();
            if (fileToUpload) formData.append('file', fileToUpload);

            await saveImportedProject(item, fileToUpload ? formData : null);
            completed++;
            setProgress(Math.round((completed / total) * 100));
        }

        setIsImporting(false);
        setLogs(prev => [`✅ นำเข้าโครงการสำเร็จ ${completed} โครงการ!`, ...prev]);

        // --- PERSISTENCE LOGIC ---
        // 1. Remove used PDFs
        // 2. Revert Excel Master Items to original state (WAITING for next batch)
        setItems(prev => {
            return prev.map(item => {
                if (item.source === 'EXCEL') {
                    // Revert
                    return {
                        ...item,
                        status: 'MISSING_INFO',
                        reason: '⚠️ รอไฟล์ชุดถัดไป...',
                        budgetMismatch: undefined,
                        fileName: item.fileName.split(' + ')[0], // Remove PDF name
                        data: { ...item.originalData } // Restore original clean data
                    } as ImportPreviewItem;
                }
                return null; // Remove PDF items
            }).filter(Boolean) as ImportPreviewItem[];
        });

        // Remove uploaded PDF files from session?
        // Maybe keep them? No, better clear to save memory.
        setFiles(prev => prev.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')));
    };

    const handleClearMaster = () => {
        setItems(prev => prev.filter(i => i.source !== 'EXCEL'));
        setFiles(prev => prev.filter(f => !f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')));
    };

    const handleDelete = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const hasMaster = items.some(i => i.source === 'EXCEL');

    // Counts
    const pdfCount = items.filter(i => i.source === 'PDF' || i.status === 'LINKED').length;
    const masterCount = items.filter(i => i.source === 'EXCEL' || i.status === 'LINKED').length;


    return (
        <div className="space-y-6">
            {/* Split Zones */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* 1. Proposals Zone (PRIMARY) */}
                <Card className={cn("lg:col-span-2 border-2 border-dashed transition-all relative",
                    "border-blue-300 bg-blue-50/50 cursor-pointer hover:bg-blue-50")}>
                    <div className="absolute inset-0">
                        <input
                            type="file"
                            accept=".zip,.pdf"
                            multiple
                            className="w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={isAnalyzing}
                        />
                    </div>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center pointer-events-none">
                        <Upload className="w-10 h-10 mb-3 text-blue-600" />
                        <h3 className="text-lg font-bold text-blue-900">1. อัปโหลดข้อเสนอโครงการ</h3>
                        <p className="text-sm mt-1 text-blue-600/80">
                            ลากและวาง <b>PDF</b> หรือ <b>ZIP</b> ที่นี่<br />
                            เริ่มนำเข้าจากไฟล์โครงการได้ทันที
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Master List Zone (SECONDARY) */}
                <Card className={cn("lg:col-span-1 border-2 border-dashed transition-all relative overflow-hidden",
                    hasMaster ? "border-green-200 bg-green-50" : "border-slate-300 hover:border-green-500 hover:bg-slate-50")}>
                    {hasMaster ? (
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center h-full">
                            <div className="bg-green-100 p-3 rounded-full mb-3">
                                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-bold text-green-900">ตัวช่วยตรวจสอบพร้อม</h3>
                            <p className="text-green-700/80 text-xs mt-1 mb-4">
                                ใช้ตรวจสอบความถูกต้อง<br />
                                ของงบประมาณและชื่อโครงการ
                            </p>
                            <button onClick={handleClearMaster} className="text-xs text-red-500 hover:text-red-700 underline z-10 relative">
                                ลบรายชื่อหลัก
                            </button>
                        </CardContent>
                    ) : (
                        <>
                            <div className="absolute inset-0">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                    disabled={isAnalyzing}
                                />
                            </div>
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center pointer-events-none">
                                <FileSpreadsheet className="w-8 h-8 text-slate-400 mb-2" />
                                <h3 className="font-semibold text-slate-700">2. ตรวจสอบข้อมูล (Optional)</h3>
                                <p className="text-slate-500 text-xs mt-1">
                                    อัปโหลดไฟล์ Excel รวม<br />เพื่อเติมข้อมูลและตรวจสอบ
                                </p>
                            </CardContent>
                        </>
                    )}
                </Card>

                {/* 3. Status - Takes up 1 col */}
                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>สถานะการทำงาน</CardTitle>
                        <CardDescription>
                            รอการนำเข้า {items.length} รายการ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(isAnalyzing || isImporting) ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-slate-500">
                                    <span>{isImporting ? 'กำลังนำเข้า...' : 'AI กำลังวิเคราะห์...'}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="text-xs text-slate-400 font-mono truncate">
                                    {logs[0]}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={handleImportAll}
                                    disabled={items.length === 0}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    นำเข้า {items.length} รายการ
                                </button>
                                <button
                                    onClick={() => setItems([])}
                                    disabled={items.length === 0}
                                    className="w-full py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                                >
                                    ล้างพื้นที่งาน
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Workbench Table / List */}
            <Card>
                <CardHeader>
                    <CardTitle>พื้นที่เตรียมข้อมูล</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        {/* Desktop Table */}
                        <table className="hidden md:table w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3 w-10">ประเภท</th>
                                    <th className="px-4 py-3">รายละเอียดโครงการ</th>
                                    <th className="px-4 py-3">ความสมบูรณ์</th>
                                    <th className="px-4 py-3 text-right">งบประมาณ</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            พื้นที่งานว่างเปล่า ลากไฟล์มาวางด้านบนเพื่อเริ่ม
                                        </td>
                                    </tr>
                                )}
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 group">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1 items-center">
                                                {item.source === 'EXCEL' && <FileSpreadsheet className="w-5 h-5 text-green-600" />}
                                                {item.source === 'PDF' && <FileText className="w-5 h-5 text-red-500" />}
                                                {item.status === 'LINKED' && <div className="absolute ml-4 mt-2 bg-purple-100 rounded-full p-0.5 border border-white"><LinkIcon className="w-3 h-3 text-purple-600" /></div>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-900">{item.data.project_name || 'Untitled'}</div>
                                            <div className="text-xs text-slate-500">{item.data.organization}</div>
                                            <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">{item.fileName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1 items-start">
                                                {item.status === 'NEW' && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 w-fit">ใหม่</Badge>}
                                                {item.status === 'UPDATE' && <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 w-fit">อัปเดต</Badge>}
                                                {item.status === 'LINKED' && <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 w-fit">เชื่อมโยงแล้ว</Badge>}
                                                {item.status === 'UNLISTED' && <Badge variant="destructive" className="w-fit">นอกรายชื่อ (ปฏิเสธ?)</Badge>}
                                                {item.status === 'MISSING_INFO' && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 w-fit">รอ PDF</Badge>}

                                                {item.reason && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded max-w-[200px]">
                                                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate" title={item.reason}>{item.reason}</span>
                                                    </div>
                                                )}

                                                {item.budgetMismatch && (
                                                    <div className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        ต่าง: {formatTHB(Math.abs(item.budgetMismatch.excel - item.budgetMismatch.pdf))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-mono font-medium">{formatTHB(item.data.budget_requested || 0)}</div>
                                            {item.data.budget_approved ? (
                                                <div className="text-xs text-green-600">อนุมัติ: {formatTHB(item.data.budget_approved)}</div>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y">
                            {items.length === 0 && (
                                <div className="py-12 text-center text-slate-400 px-4">
                                    พื้นที่งานว่างเปล่า ลากไฟล์มาวางด้านบนเพื่อเริ่ม
                                </div>
                            )}
                            {items.map((item) => (
                                <div key={item.id} className="p-4 flex flex-col gap-3 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                {item.source === 'EXCEL' && <FileSpreadsheet className="w-5 h-5 text-green-600" />}
                                                {item.source === 'PDF' && <FileText className="w-5 h-5 text-red-500" />}
                                                {item.status === 'LINKED' && <div className="absolute ml-4 mt-2 bg-purple-100 rounded-full p-0.5 border border-white"><LinkIcon className="w-3 h-3 text-purple-600" /></div>}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 line-clamp-2 text-sm">{item.data.project_name || 'Untitled'}</div>
                                                <div className="text-xs text-slate-500">{item.data.organization}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-300 hover:text-red-500"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {item.status === 'NEW' && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 w-fit">ใหม่</Badge>}
                                        {item.status === 'UPDATE' && <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 w-fit">อัปเดต</Badge>}
                                        {item.status === 'LINKED' && <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 w-fit">เชื่อมโยงแล้ว</Badge>}
                                        {item.status === 'UNLISTED' && <Badge variant="destructive" className="w-fit">นอกรายชื่อ</Badge>}
                                        {item.status === 'MISSING_INFO' && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 w-fit">รอ PDF</Badge>}
                                    </div>

                                    {(item.reason || item.budgetMismatch) && (
                                        <div className="bg-slate-50 p-2 rounded text-xs text-amber-700 flex flex-col gap-1">
                                            {item.reason && <div className="flex gap-1"><AlertTriangle className="w-3 h-3" /> {item.reason}</div>}
                                            {item.budgetMismatch && <div className="text-red-600 font-medium">ต่าง: {formatTHB(Math.abs(item.budgetMismatch.excel - item.budgetMismatch.pdf))}</div>}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-end mt-1 border-t pt-2 border-slate-100">
                                        <div className="text-[10px] text-slate-400 max-w-[150px] truncate">{item.fileName}</div>
                                        <div className="text-right">
                                            <div className="font-mono font-medium text-sm">{formatTHB(item.data.budget_requested || 0)}</div>
                                            {item.data.budget_approved ? (
                                                <div className="text-[10px] text-green-600">อนุมัติ: {formatTHB(item.data.budget_approved)}</div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

