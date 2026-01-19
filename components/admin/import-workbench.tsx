'use client';

import { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Save, RotateCcw, Link as LinkIcon, Trash2, FileSpreadsheet, AlertTriangle, ArrowRight, ArrowLeft, MapPin, Calendar, HelpCircle, X } from 'lucide-react';
import { analyzeFileForImport, saveImportedProject, ImportPreviewItem } from '@/lib/bulk-import-actions';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { formatTHB } from '@/lib/utils';
import { Campus } from '@/lib/types';


// --- Configuration ---
const CAMPUS_OPTIONS: { value: Campus; label: string; icon: string }[] = [
    { value: 'central', label: 'ส่วนกลาง', icon: '🏛️' },
    { value: 'rangsit', label: 'รังสิต', icon: '🌳' },
    { value: 'thaprachan', label: 'ท่าพระจันทร์', icon: '⛵' },
    { value: 'lampang', label: 'ลำปาง', icon: '🏔️' },
];

export default function ImportWorkbench() {
    // --- State: Wizard Navigation ---
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

    // --- State: Context (Step 1) ---
    const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<number | null>(null);
    const currentYear = new Date().getFullYear() + 543;
    const FISCAL_YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i);

    // --- State: Data ---
    // We categorize items by their "Logical Source" (Context) rather than file type
    // PROJECT_DOC = From Step 2 (Proposals)
    // BUDGET_DOC = From Step 3 (Official Budget)
    interface ExtendedImportItem extends ImportPreviewItem {
        importContext: 'PROJECT_DOC' | 'BUDGET_DOC';
    }

    const [items, setItems] = useState<ExtendedImportItem[]>([]);
    const [rawFiles, setRawFiles] = useState<File[]>([]); // Keep references to actual files for upload

    // --- State: Processing ---
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [analyzingContext, setAnalyzingContext] = useState<'PROJECT_DOC' | 'BUDGET_DOC' | null>(null);

    // --- Helper: File Processing ---
    const processFiles = async (inputFiles: FileList | null, context: 'PROJECT_DOC' | 'BUDGET_DOC') => {
        if (!inputFiles || inputFiles.length === 0) return;

        setIsAnalyzing(true);
        setAnalyzingContext(context);
        setLogs(prev => [`⏳ กำลังเตรียมไฟล์ (${context === 'PROJECT_DOC' ? 'โครงการ' : 'งบประมาณ'})...`]);

        try {
            // 1. Unzip / Flat List
            const processedFiles: File[] = [];
            for (let i = 0; i < inputFiles.length; i++) {
                const file = inputFiles[i];
                if (file.name.endsWith('.zip')) {
                    const zip = new JSZip();
                    const contents = await zip.loadAsync(file);
                    for (const path in contents.files) {
                        const entry = contents.files[path];
                        if (!entry.dir && (entry.name.match(/\.(pdf|xlsx|xls|csv)$/i))) {
                            const blob = await entry.async('blob');
                            const ext = entry.name.split('.').pop();
                            // Simple type guess
                            let type = 'application/octet-stream';
                            if (ext === 'pdf') type = 'application/pdf';
                            if (ext === 'csv') type = 'text/csv';
                            if (ext?.startsWith('xls')) type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

                            processedFiles.push(new File([blob], entry.name, { type }));
                        }
                    }
                } else {
                    processedFiles.push(file);
                }
            }

            // Store raw files
            setRawFiles(prev => [...prev, ...processedFiles]);

            // 2. Analyze
            await analyzeNewFiles(processedFiles, context);

        } catch (error) {
            console.error(error);
            setLogs(prev => [`❌ ข้อผิดพลาด: ${error}`]);
        } finally {
            setIsAnalyzing(false);
            setAnalyzingContext(null);
        }
    };

    const analyzeNewFiles = async (newFiles: File[], context: 'PROJECT_DOC' | 'BUDGET_DOC') => {
        let completed = 0;
        const total = newFiles.length;

        for (const file of newFiles) {
            setProgress(Math.round((completed / total) * 100));
            setLogs(prev => [`📄 วิเคราะห์: ${file.name}`, ...prev.slice(0, 4)]);

            const formData = new FormData();
            formData.append('file', file);
            if (selectedCampus) formData.append('campus', selectedCampus);
            if (selectedFiscalYear) formData.append('fiscal_year', selectedFiscalYear.toString());

            try {
                const result = await analyzeFileForImport(formData);
                if (result.success && result.data) {
                    const newItems = result.data.map(item => ({
                        ...item,
                        importContext: context,
                        // If it came from Budget Step, we treat it as MASTER/OFFICIAL data
                        // If it came from Project Step, we treat it as PROPOSAL data
                        status: 'NEW' as const // Reset status, we will link later
                    } as ExtendedImportItem));

                    setItems(prev => [...prev, ...newItems]);
                }
            } catch (err) {
                console.error(err);
            }
            completed++;
        }
        setLogs(prev => [`✅ วิเคราะห์เสร็จสิ้น ${completed} ไฟล์`, ...prev]);
        setProgress(0);
    };

    // --- Logic: Auto-Linking (Step 4) ---
    // This runs on-the-fly when rendering Step 4 or can be triggered
    // We will derive the "Linked View" from the `items` state.
    const linkedItems = useMemo(() => {
        // Clone items
        let allItems = items.map(i => ({ ...i }));

        // Separating sources
        const budgetDocs = allItems.filter(i => i.importContext === 'BUDGET_DOC');
        const projectDocs = allItems.filter(i => i.importContext === 'PROJECT_DOC');

        // Logic A: If we have Budget Docs, they are the "Base" (Anchor).
        // Logic B: If we only have Project Docs, they are the Base.

        // We want to return a list of "Final Projects to Import".
        // Each Final Project might be formed by (Budget Item + Project Item) or just one of them.

        const finalProjects: ExtendedImportItem[] = [];
        const usedProjectDocs = new Set<string>();

        // 1. Start with Budget Docs (Official List)
        budgetDocs.forEach(bItem => {
            // Find match in Project Docs
            const normalize = (s: string) => s?.toLowerCase().replace(/\s+/g, '').replace(/[\-_\.]/g, '') || '';
            const bName = normalize(bItem.data.project_name || '');

            const match = projectDocs.find(pItem => {
                if (usedProjectDocs.has(pItem.id)) return false;
                const pName = normalize(pItem.data.project_name || '');
                return (pName.includes(bName) || bName.includes(pName)) && pName.length > 5;
            });

            if (match) {
                // LINKED
                usedProjectDocs.add(match.id);
                finalProjects.push({
                    ...bItem,
                    id: bItem.id, // Use Budget ID as primary
                    status: 'LINKED', // It matched!
                    fileName: `${bItem.fileName} + ${match.fileName}`,
                    data: {
                        ...bItem.data, // Budget data is primary for numbers
                        ...match.data, // Enrich with PDF details
                        budget_approved: bItem.data.budget_approved, // Official
                        // If PDF has details, keep them
                    },
                    reason: '✅ จับคู่กับเอกสารโครงการแล้ว'
                });
            } else {
                // Budget Doc without Proposal
                // Still valid to import as "Project with Budget but no text details"
                finalProjects.push({
                    ...bItem,
                    status: bItem.existingProjectId ? 'UPDATE' : 'NEW', // Or MISSING_INFO if we want to enforce PDF
                    reason: bItem.existingProjectId ? 'อัปเดตข้อมูลเดิม' : '⚠️ ไม่มีไฟล์เอกสารโครงการ (มีแต่งบ)'
                });
            }
        });

        // 2. Process remaining Project Docs (Standalones)
        projectDocs.forEach(pItem => {
            if (!usedProjectDocs.has(pItem.id)) {
                finalProjects.push({
                    ...pItem,
                    status: pItem.existingProjectId ? 'UPDATE' : 'NEW',
                    reason: pItem.existingProjectId ? 'อัปเดตข้อมูลเดิม' : 'เอกสารโครงการใหม่ (ไม่มีไฟล์งบอ้างอิง)'
                });
            }
        });

        // 3. Mark Existing DB Matches (already done in analyzeAction generally, but let's re-verify)
        // (Skipped for brevity, assuming analyzeAction did its job finding existingProjectId)

        return finalProjects;
    }, [items]);

    // --- Actions ---
    const handleReset = () => {
        if (confirm("ต้องการล้างข้อมูลทั้งหมดและเริ่มใหม่หรือไม่?")) {
            setItems([]);
            setRawFiles([]);
            setStep(1);
            setLogs([]);
        }
    };

    const handleSaveAll = async () => {
        setIsImporting(true);
        const projects = linkedItems; // Use the derived linked list
        let completed = 0;

        for (const item of projects) {
            setLogs(prev => [`💾 กำลังบันทึก: ${item.data.project_name}...`, ...prev.slice(0, 4)]);

            // Logic to find the file to upload
            // If it's a Combined Item (Budget+Projet), the fileName string is "Budget.xlsx + Proposal.pdf"
            // We need to find the Proposal.pdf in `rawFiles` to upload it.
            // If it's pure PDF, we upload it.
            // If it's pure Excel, usually no file upload unless we want to attach Excel.

            // Naive finder:
            let targetFile: File | undefined;
            // Try to find a file in rawFiles that matches the item's current fileName or component parts
            // This is a bit weak if names are complex.
            // Better: Store file references in items? No, items are plain objects.
            // Search reference:
            targetFile = rawFiles.find(f => item.fileName.includes(f.name));

            const formData = new FormData();
            if (targetFile) formData.append('file', targetFile);

            await saveImportedProject(item, targetFile ? formData : null);
            completed++;
            setProgress(Math.round((completed / projects.length) * 100));
        }

        setIsImporting(false);
        setLogs(prev => [`🎉 นำเข้าสำเร็จ ${completed} โครงการ!`, ...prev]);
        setStep(5); // Finish
    };


    // --- Render Steps ---

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Wizard Progress */}
            <div className="flex justify-between relative mb-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full" />
                <div className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }} />
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={cn(
                        "flex flex-col items-center gap-2 bg-slate-50 p-2 rounded-lg transition-colors border-2",
                        step >= s ? "border-green-500 text-green-700 bg-green-50" : "border-slate-200 text-slate-400"
                    )}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                            step >= s ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
                        )}>
                            {s}
                        </div>
                        <span className="text-xs font-medium hidden md:block">
                            {s === 1 && "ระบุปี/ศูนย์"}
                            {s === 2 && "ไฟล์โครงการ"}
                            {s === 3 && "ไฟล์งบ"}
                            {s === 4 && "ตรวจสอบ"}
                            {s === 5 && "เสร็จสิ้น"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <Card className="min-h-[400px] flex flex-col shadow-lg border-t-4 border-t-blue-600">
                <CardHeader>
                    {step === 1 && <CardTitle>เริ่มกระบวนการนำเข้า</CardTitle>}
                    {step === 2 && <CardTitle>อัปโหลดเอกสารโครงการ (Project Proposals)</CardTitle>}
                    {step === 3 && <CardTitle>อัปโหลดใบคุมงบประมาณ (Budget Approvals)</CardTitle>}
                    {step === 4 && <CardTitle>ตรวจสอบและยืนยันข้อมูล ({linkedItems.length} รายการ)</CardTitle>}
                    {step === 5 && <CardTitle>นำเข้าข้อมูลเสร็จสมบูรณ์</CardTitle>}
                </CardHeader>

                <CardContent className="flex-1">
                    {/* STEP 1: Context */}
                    {step === 1 && (
                        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
                            <div className="grid gap-4">
                                <label className="text-sm font-medium text-slate-700">1. เลือกปีงบประมาณ</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {FISCAL_YEAR_OPTIONS.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => setSelectedFiscalYear(year)}
                                            className={cn(
                                                "py-3 rounded border text-sm font-medium transition-all",
                                                selectedFiscalYear === year
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                    : "bg-white border-slate-200 hover:border-blue-300 text-slate-700"
                                            )}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <label className="text-sm font-medium text-slate-700">2. เลือกศูนย์/วิทยาเขต</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {CAMPUS_OPTIONS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setSelectedCampus(c.value)}
                                            className={cn(
                                                "py-4 px-3 rounded border text-left flex items-center gap-3 transition-all",
                                                selectedCampus === c.value
                                                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                                                    : "bg-white border-slate-200 hover:border-blue-300"
                                            )}
                                        >
                                            <span className="text-2xl">{c.icon}</span>
                                            <div>
                                                <div className="font-semibold text-slate-900">{c.label}</div>
                                                <div className="text-xs text-slate-500">มธ. {c.label}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Project Files */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-10 text-center relative hover:bg-blue-50 transition-colors">
                                <input
                                    type="file" multiple accept=".pdf,.zip"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => processFiles(e.target.files, 'PROJECT_DOC')}
                                    disabled={isAnalyzing}
                                />
                                <div className="flex justify-center mb-4">
                                    {isAnalyzing && analyzingContext === 'PROJECT_DOC' ? (
                                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                    ) : (
                                        <FileText className="w-12 h-12 text-blue-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ PDF มาวางที่นี่</h3>
                                <p className="text-slate-500 mt-2">รองรับไฟล์ข้อเสนอโครงการ (รายโครงการ) หรือไฟล์ ZIP</p>
                            </div>

                            {/* File List for Step 2 */}
                            {items.filter(i => i.importContext === 'PROJECT_DOC').length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-700">ไฟล์ที่อัปโหลดแล้ว ({items.filter(i => i.importContext === 'PROJECT_DOC').length})</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded">
                                        {items.filter(i => i.importContext === 'PROJECT_DOC').map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border text-xs">
                                                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span className="truncate flex-1">{item.fileName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Budget Files */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-green-200 bg-green-50/30 rounded-xl p-10 text-center relative hover:bg-green-50 transition-colors">
                                <input
                                    type="file" multiple accept=".xlsx,.xls,.csv,.pdf"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => processFiles(e.target.files, 'BUDGET_DOC')}
                                    disabled={isAnalyzing}
                                />
                                <div className="flex justify-center mb-4">
                                    {isAnalyzing && analyzingContext === 'BUDGET_DOC' ? (
                                        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                                    ) : (
                                        <FileSpreadsheet className="w-12 h-12 text-green-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">อัปโหลดไฟล์อนุมัติงบประมาณ (ถ้ามี)</h3>
                                <p className="text-slate-500 mt-2">Excel, CSV หรือ PDF ที่ระบุยอดเงินอนุมัติจริง</p>
                                <p className="text-xs text-slate-400 mt-1">(หากไม่มี สามารถข้ามขั้นตอนนี้ได้)</p>
                            </div>

                            {/* File List for Step 3 */}
                            {items.filter(i => i.importContext === 'BUDGET_DOC').length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-700">ไฟล์งบที่อัปโหลดแล้ว ({items.filter(i => i.importContext === 'BUDGET_DOC').length})</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded">
                                        {items.filter(i => i.importContext === 'BUDGET_DOC').map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border text-xs">
                                                <FileSpreadsheet className="w-4 h-4 text-green-500 shrink-0" />
                                                <span className="truncate flex-1">{item.fileName}</span>
                                                <span className="text-slate-400">{formatTHB(item.data.budget_approved || 0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: Review (Linked) */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="flex gap-4 mb-4 text-sm text-slate-600 bg-slate-100 p-3 rounded-lg">
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-100 border border-purple-500 rounded-full"></div> จับคู่แล้ว</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded-full"></div> อัปเดตเดิม</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-500 rounded-full"></div> โครงการใหม่</div>
                            </div>

                            <div className="overflow-auto max-h-[500px] border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">สถานะ</th>
                                            <th className="px-4 py-3">โครงการ</th>
                                            <th className="px-4 py-3 text-right">งบที่ขอ</th>
                                            <th className="px-4 py-3 text-right">งบอนุมัติ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {linkedItems.map((item, i) => (
                                            <tr key={i} className={cn(
                                                "hover:bg-slate-50",
                                                item.status === 'LINKED' ? "bg-purple-50/30" : ""
                                            )}>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col items-start gap-1">
                                                        {item.status === 'LINKED' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Linked</Badge>}
                                                        {item.status === 'UPDATE' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Update</Badge>}
                                                        {item.status === 'NEW' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">New</Badge>}
                                                        <span className="text-[10px] text-slate-400">{item.reason}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-slate-900">{item.data.project_name}</div>
                                                    <div className="text-xs text-slate-500">{item.data.organization}</div>
                                                    <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">{item.fileName}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono">
                                                    {formatTHB(item.data.budget_requested || 0)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-green-700 font-bold">
                                                    {formatTHB(item.data.budget_approved || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Success */}
                    {step === 5 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">นำเข้าข้อมูลสำเร็จ!</h2>
                            <p className="text-slate-600">
                                ระบบได้บันทึกข้อมูลโคงการเข้าระบบเรียบร้อยแล้ว<br />
                                รวมทั้งหมด {linkedItems.length} รายการ
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    เริ่มรายการใหม่
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-slate-50 border-t flex justify-between py-4">
                    {step > 1 && step < 5 && (
                        <button
                            onClick={() => setStep(prev => (prev - 1) as any)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
                            disabled={isAnalyzing || isImporting}
                        >
                            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                        </button>
                    )}
                    {step === 1 && (
                        <div className="ml-auto">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedCampus || !selectedFiscalYear}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                            >
                                ถัดไป <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="ml-auto flex gap-3">
                            {items.length === 0 && (
                                <span className="text-xs self-center text-slate-400">ยังไม่มีไฟล์? (ข้ามได้)</span>
                            )}
                            <button
                                onClick={() => setStep(3)}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                            >
                                ถัดไป (ไฟล์งบ) <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="ml-auto">
                            <button
                                onClick={() => setStep(4)}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                            >
                                ตรวจสอบการจับคู่ <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="ml-auto">
                            <button
                                onClick={handleSaveAll}
                                disabled={isImporting || linkedItems.length === 0}
                                className="flex items-center gap-2 px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-bold text-lg"
                            >
                                {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                ยืนยันและนำเข้า
                            </button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            {/* Logs Overlay */}
            {logs.length > 0 && step < 5 && (
                <div className="fixed bottom-4 right-4 bg-slate-900/90 text-white p-4 rounded-lg shadow-xl max-w-sm text-xs font-mono max-h-32 overflow-y-auto pointer-events-none z-50">
                    {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                </div>
            )}
        </div>
    );
}
