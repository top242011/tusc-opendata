'use client';

import { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Save, RotateCcw, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { analyzeFileForImport, saveImportedProject, ImportPreviewItem } from '@/lib/bulk-import-actions';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTHB } from '@/lib/utils';


export default function BulkImportWizard() {
    const [step, setStep] = useState<'UPLOAD' | 'ANALYZING' | 'REVIEW' | 'IMPORTING' | 'DONE'>('UPLOAD');
    const [files, setFiles] = useState<File[]>([]);
    const [analyzedItems, setAnalyzedItems] = useState<ImportPreviewItem[]>([]);
    const [progress, setProgress] = useState(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    // Step 1: Handle Upload (Zip, PDF, Excel)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputFiles = e.target.files;
        if (!inputFiles || inputFiles.length === 0) return;

        try {
            setStep('ANALYZING');
            setLogs(prev => [...prev, `Processing ${inputFiles.length} file(s)...`]);
            const processedFiles: File[] = [];

            for (let i = 0; i < inputFiles.length; i++) {
                const file = inputFiles[i];
                if (file.name.endsWith('.zip')) {
                    setLogs(prev => [...prev, `Unzipping ${file.name}...`]);
                    const zip = new JSZip();
                    const contents = await zip.loadAsync(file);
                    for (const path in contents.files) {
                        const entry = contents.files[path];
                        if (!entry.dir && (entry.name.endsWith('.pdf') || entry.name.endsWith('.xlsx'))) {
                            const blob = await entry.async('blob');
                            processedFiles.push(new File([blob], entry.name, { type: entry.name.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                        }
                    }
                } else {
                    processedFiles.push(file);
                }
            }

            setFiles(processedFiles);
            setLogs(prev => [...prev, `Prepared ${processedFiles.length} files for AI Analysis.`]);

            // Start Analysis
            await analyzeFiles(processedFiles);

        } catch (error) {
            console.error(error);
            setLogs(prev => [...prev, `Error: Failed to process files.`]);
            setStep('UPLOAD');
        }
    };

    // Step 2: Analyze Loop
    const analyzeFiles = async (processFiles: File[]) => {
        const rawResults: ImportPreviewItem[] = [];
        let completed = 0;

        for (const file of processFiles) {
            setCurrentFileIndex(completed);
            setProgress(Math.round((completed / processFiles.length) * 100));
            setLogs(prev => [...prev, `AI Analyzing: ${file.name}...`]);

            const formData = new FormData();
            formData.append('file', file);

            try {
                // Using new analyzeFileForImport which returns data[]
                const result = await analyzeFileForImport(formData);

                if (result.success && result.data) {
                    rawResults.push(...result.data);
                    setLogs(prev => [...prev, `✅ success: ${file.name} (${result.data?.length || 0} items)`]);
                } else {
                    setLogs(prev => [...prev, `❌ failed: ${file.name} - ${result.error}`]);
                }
            } catch (err) {
                setLogs(prev => [...prev, `❌ Error: ${file.name}`]);
            }
            completed++;
        }

        // AUTO-LINKING LOGIC
        setLogs(prev => [...prev, `🤖 Running Auto-Linking & Integrity Checks...`]);
        const linkedResults = performAutoLinking(rawResults);

        setAnalyzedItems(linkedResults);
        setProgress(100);
        setStep('REVIEW');
    };

    const performAutoLinking = (items: ImportPreviewItem[]) => {
        // Logic: 
        // 1. Separate PDF items and Excel items
        // 2. Tries to match PDF (Proposal) to Excel (Master)
        // 3. Mark matches as LINKED

        const excelItems = items.filter(i => i.source === 'EXCEL');
        const pdfItems = items.filter(i => i.source === 'PDF');

        // Helper
        const norm = (s: string) => s?.toLowerCase().replace(/\s+/g, '').replace(/[\-_\.]/g, '') || '';

        pdfItems.forEach(pdf => {
            const pdfName = norm(pdf.data.project_name || '');
            // Try to find match in Excel list first (Priority)
            const match = excelItems.find(ex => {
                const exName = norm(ex.data.project_name || '');
                return exName.includes(pdfName) || pdfName.includes(exName) && pdfName.length > 5;
            });

            if (match) {
                // LINK them!
                // We merge PDF details INTO the Excel item (Master) or vice versa?
                // Let's keep the PDF item as the "Active" one but enrich it with Excel IDs or flag it?
                // Or better: Mark Excel item as "Has File" and merge data?
                // Let's decided to Keep the Excel item as the "Base" if found, because it has approved budget.

                match.status = 'LINKED';
                match.data = { ...match.data, ...pdf.data }; // Merge details from PDF to Excel item
                match.fileName = `${match.fileName} + ${pdf.fileName}`; // Track sources
                match.source = 'EXCEL'; // Treat as Consolidated

                // Integrity Check
                const budgetPdf = pdf.data.budget_requested || 0;
                const budgetExc = match.data.budget_requested || 0;
                if (Math.abs(budgetPdf - budgetExc) > 100) {
                    match.budgetMismatch = { pdf: budgetPdf, excel: budgetExc };
                    match.reason = "⚠️ Budget Mismatch";
                } else {
                    match.reason = "✅ Linked with PDF";
                }

                // Remove the PDF item from the main list (consumed)
                pdf.status = 'CONFLICT'; // Mark for deletion/hiding
            }
        });

        return items.filter(i => i.status !== 'CONFLICT');
    };

    // Step 3: Execute
    const handleConfirmImport = async () => {
        setStep('IMPORTING');
        setLogs([]);
        let completed = 0;

        for (let i = 0; i < analyzedItems.length; i++) {
            const item = analyzedItems[i];

            // If it's a Linked/PDF item, we need the PDF file to upload.
            // Loop through original files to find the matching NAME.
            // Note: If merged, item.fileName might be composite "Excel.xlsx + Project.pdf"
            // We need to be smart finding the file.

            let fileToUpload: File | undefined = undefined;
            if (item.source === 'PDF' || item.status === 'LINKED') {
                // Try to find a PDF file that was part of this item
                // Simple hack: check if any of our files is substring of item.fileName?
                fileToUpload = files.find(f => f.name.endsWith('.pdf') && item.fileName.includes(f.name));
            }

            setCurrentFileIndex(i);
            setProgress(Math.round((i / analyzedItems.length) * 100));
            setLogs(prev => [...prev, `Saving: ${item.data.project_name}...`]);

            const formData = new FormData();
            if (fileToUpload) {
                formData.append('file', fileToUpload);
            }

            const result = await saveImportedProject(item, fileToUpload ? formData : null);
            if (result.success) {
                setLogs(prev => [...prev, `✅ Saved`]);
            } else {
                setLogs(prev => [...prev, `❌ Failed`]);
            }
            completed++;
        }

        setProgress(100);
        setStep('DONE');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8 px-4">
                {['Upload', 'Analyze & Link', 'Review', 'Import', 'Done'].map((label, idx) => {
                    // Normalize step index for 5 steps
                    const steps = ['UPLOAD', 'ANALYZING', 'REVIEW', 'IMPORTING', 'DONE'];
                    const currentIdx = steps.indexOf(step);
                    return (
                        <div key={label} className={cn("flex items-center gap-2", idx <= currentIdx ? "text-blue-600 font-bold" : "text-slate-400")}>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", idx <= currentIdx ? "border-blue-600 bg-blue-50" : "border-slate-300")}>
                                {idx + 1}
                            </div>
                            <span className="hidden sm:inline">{label}</span>
                        </div>
                    );
                })}
            </div>

            {/* UPLOAD STEP */}
            {step === 'UPLOAD' && (
                <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-blue-900">Universal Dropzone</h2>
                        <p className="text-blue-600 mb-6 max-w-md">
                            Drag & Drop <b>Excel (.xlsx)</b> summaries and <b>PDF Proposals</b> here.<br />
                            We will analyze, auto-link, and check budgets for you.
                        </p>

                        <input
                            type="file"
                            accept=".zip,.pdf,.xlsx,.csv"
                            multiple
                            className="hidden"
                            id="universal-upload"
                            onChange={handleFileUpload}
                        />
                        <label
                            htmlFor="universal-upload"
                            className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition cursor-pointer shadow-lg hover:shadow-xl"
                        >
                            Select Files
                        </label>
                    </CardContent>
                </Card>
            )}

            {/* ANALYZING */}
            {(step === 'ANALYZING' || step === 'IMPORTING') && (
                <Card>
                    <CardContent className="py-12 text-center space-y-6">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                        <div>
                            <h2 className="text-xl font-bold mb-2">
                                {step === 'ANALYZING' ? 'AI is analyzing & linking your data...' : 'Importing to database...'}
                            </h2>
                            <p className="text-slate-500">Processing with Gemini 2.5 Flash Lite</p>
                        </div>

                        <div className="max-w-md mx-auto">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="text-xs text-slate-400 mt-2 text-left font-mono h-32 overflow-y-auto bg-slate-50 p-2 rounded border">
                                {logs.map((log, i) => <div key={i}>{log}</div>)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* REVIEW */}
            {step === 'REVIEW' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                        <div>
                            <h2 className="text-xl font-bold">Review Data Lake ({analyzedItems.length} items)</h2>
                            <p className="text-sm text-slate-500">Verified links and budget integrity.</p>
                        </div>
                        <button
                            onClick={handleConfirmImport}
                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Confirm Import All
                        </button>
                    </div>

                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Project / Org</th>
                                    <th className="px-4 py-3">Source & Linkage</th>
                                    <th className="px-4 py-3 text-right">Budget</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {analyzedItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex flex-col gap-1">
                                                {item.status === 'NEW' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 w-fit">✨ New</Badge>}
                                                {item.status === 'UPDATE' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 w-fit">🔄 Update</Badge>}
                                                {item.status === 'LINKED' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 w-fit">🔗 Linked</Badge>}
                                                {item.budgetMismatch && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 w-fit mt-1">⚠️ Budget Diff</Badge>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="font-semibold text-slate-800">{item.data.project_name || "Unknown Project"}</div>
                                            <div className="text-xs text-slate-500">{item.data.organization}</div>
                                            {item.budgetMismatch && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    PDF: {formatTHB(item.budgetMismatch.pdf)} vs Excel: {formatTHB(item.budgetMismatch.excel)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 align-top text-slate-500 text-xs">
                                            <div className="flex flex-col gap-1">
                                                <span title={item.fileName} className="truncate max-w-[200px]">{item.fileName}</span>
                                                {item.reason && <span className="italic">{item.reason}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top text-right font-mono">
                                            <div className="font-bold">{formatTHB(item.data.budget_requested || 0)}</div>
                                            {item.data.budget_approved ? (
                                                <div className="text-xs text-green-600">Appr: {formatTHB(item.data.budget_approved)}</div>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* DONE STEP */}
            {step === 'DONE' && (
                <Card className="bg-green-50 border-green-200 border-2">
                    <CardContent className="py-16 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-900 mb-2">Import Complete!</h2>
                        <p className="text-green-700 mb-8">Successfully processed {analyzedItems.length} projects to the AI Data Lake.</p>

                        <div className="flex justify-center gap-4">
                            <a href="/admin" className="px-6 py-2 bg-white border border-green-200 text-green-700 rounded-md hover:bg-green-50 shadow-sm">
                                Back to Dashboard
                            </a>
                            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" /> Import More
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
