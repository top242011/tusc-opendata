"use client";

import { useState, useMemo } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, X, Search, FileUp, ArrowRight, Save, Loader2, Plus, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Modal } from "@/components/ui/modal";
import { Project } from "@/lib/types";
import { cn } from "@/utils/cn";
import { analyzeFileForImport, saveImportedProject, ImportPreviewItem } from '@/lib/bulk-import-actions';
import { Badge } from "@/components/ui/badge";
import { formatTHB } from "@/lib/utils";
import Link from 'next/link';
import { ProjectForm } from "@/components/project-form";

interface QuickFixActionProps {
    projects: Project[];
}

export function QuickFixAction({ projects }: QuickFixActionProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="block p-6 bg-pink-600 rounded-lg shadow-lg hover:bg-pink-700 transition group text-left w-full h-full"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:underline">ตรวจสอบและแก้ไขข้อมูลด่วน &rarr;</h3>
                        <p className="text-pink-100">ตรวจสอบโครงการที่ขาดเอกสาร PDF และอัปโหลดไฟล์เพื่อจับคู่อัตโนมัติ</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                </div>
            </button>

            <QuickFixModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                projects={projects}
            />
        </>
    );
}

function QuickFixModal({ isOpen, onClose, projects }: { isOpen: boolean; onClose: () => void; projects: Project[] }) {
    // Determine missing file projects
    const missingProjects = useMemo(() => projects.filter(p => !p.has_files), [projects]);

    // Steps: 0=Upload, 1=Review/Match, 2=Result
    const [step, setStep] = useState(0);
    const [analyzing, setAnalyzing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [items, setItems] = useState<ImportPreviewItem[]>([]);

    // State for creating new project
    const [creationItem, setCreationItem] = useState<ImportPreviewItem | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputFiles = e.target.files;
        if (!inputFiles || inputFiles.length === 0) return;

        setAnalyzing(true);
        const newFiles = Array.from(inputFiles);
        setUploadedFiles(prev => [...prev, ...newFiles]);

        try {
            const newItems: ImportPreviewItem[] = [];
            let completed = 0;

            for (const file of newFiles) {
                const formData = new FormData();
                formData.append('file', file);
                const result = await analyzeFileForImport(formData);

                if (result.success && result.data) {
                    // Pre-match logic
                    const analyzedItems = result.data.map(item => {
                        // Attempt to match with MISSING projects specifically
                        // result.data might already have existingProjectId from general DB match
                        // But let's refine it.

                        let matchedProject: Project | undefined;

                        // 1. If analysis found a general DB match
                        if (item.existingProjectId) {
                            matchedProject = projects.find(p => p.id === item.existingProjectId);
                        }

                        // 2. If no general match, try fuzzy matching against missing list specifically (stronger bias)
                        if (!matchedProject) {
                            const normalizedName = item.data.project_name?.replace(/\s+/g, '').toLowerCase() || '';
                            matchedProject = missingProjects.find(p => {
                                const pName = p.project_name.replace(/\s+/g, '').toLowerCase();
                                return pName.includes(normalizedName) || normalizedName.includes(pName);
                            });
                        }

                        if (matchedProject) {
                            return {
                                ...item,
                                status: 'UPDATE', // We are updating an existing project
                                existingProjectId: matchedProject.id,
                                reason: matchedProject.has_files ? '⚠️ เลือกโครงการที่มีไฟล์อยู่แล้ว' : '✅ จับคู่กับโครงการที่รอเอกสาร',
                                // Keep the analyzed data but we will likely only use file + metadata
                            } as ImportPreviewItem;
                        } else {
                            return item; // Status NEW
                        }
                    });
                    newItems.push(...analyzedItems);
                }
                completed++;
            }
            setItems(prev => [...prev, ...newItems]);
            setStep(1); // Go to review
        } catch (error) {
            console.error(error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleManualLink = (itemId: string, projectId: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const project = projects.find(p => p.id === parseInt(projectId));
                if (project) {
                    return {
                        ...item,
                        status: 'UPDATE',
                        existingProjectId: project.id,
                        reason: '🔗 จับคู่ด้วยตนเอง',
                        // Ensure we use the project name from DB for clarity or keep PDF name? 
                        // Usually we map PDF TO Project.
                    };
                }
            }
            return item;
        }));
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    const handleStartCreate = (item: ImportPreviewItem) => {
        setCreationItem(item);
    };

    const handleCreateSuccess = (newProject?: Project) => {
        if (!creationItem || !newProject) return;

        // Link the item to the new project
        setItems(prev => prev.map(i => {
            if (i.id === creationItem.id) {
                return {
                    ...i,
                    status: 'UPDATE',
                    existingProjectId: newProject.id,
                    reason: `✨ สร้างโครงการใหม่: ${newProject.project_name}`,
                };
            }
            return i;
        }));

        // Add new project to the local "projects" list? 
        // We can't easy mutate props.projects, but for the dropdown logic it might be nice.
        // However, since it is now linked, it won't appear in the dropdown anyway (as the dropdown is for unlinked items).
        // Actually the dropdown is for missing file projects. The new project WILL be missing file until we save.
        // But our logic marks status=UPDATE, so dropdown disappears. Good.

        setCreationItem(null);
    };

    const handleSave = async () => {
        setImporting(true);
        let completed = 0;
        const total = items.length;

        for (const item of items) {
            // Find file
            const file = uploadedFiles.find(f => f.name === item.fileName);
            const formData = new FormData();
            if (file) formData.append('file', file);

            // If it's NEW and user wants to create new, we create new.
            // If it's UPDATE (Linked), we update.
            await saveImportedProject(item, file ? formData : null);
            completed++;
            setProgress(Math.round((completed / total) * 100));
        }

        setImporting(false);
        setStep(2); // Success view
        // Ideally trigger a refresh of the page projects? 
        // We can't easy refresh server component from here without router.refresh()
        window.location.reload();
    };

    const reset = () => {
        setItems([]);
        setUploadedFiles([]);
        setStep(0);
        setProgress(0);
        setCreationItem(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="ตรวจสอบและแก้ไขข้อมูลด่วน"
                className="sm:max-w-4xl max-h-[90vh]"
            >
                <div className="space-y-6">
                    {/* Progress / Steps (Simple) */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 border-b pb-4">
                        <div className={cn("px-2 py-1 rounded", step === 0 ? "bg-pink-100 text-pink-700 font-medium" : "")}>1. อัปโหลด</div>
                        <ArrowRight className="w-4 h-4" />
                        <div className={cn("px-2 py-1 rounded", step === 1 ? "bg-pink-100 text-pink-700 font-medium" : "")}>2. ตรวจสอบ & จับคู่</div>
                        <ArrowRight className="w-4 h-4" />
                        <div className={cn("px-2 py-1 rounded", step === 2 ? "bg-green-100 text-green-700 font-medium" : "")}>3. เสร็จสิ้น</div>
                    </div>

                    {step === 0 && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-800">พบโครงการที่ขาดเอกสาร {missingProjects.length} โครงการ</h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                        ระบบจะช่วยจับคู่ไฟล์ PDF ที่คุณอัปโหลด เข้ากับรายชื่อโครงการเหล่านี้โดยอัตโนมัติ
                                    </p>
                                    {missingProjects.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                            {missingProjects.map(p => (
                                                <span key={p.id} className="text-xs bg-white border border-amber-200 text-amber-800 px-2 py-1 rounded-full">
                                                    {p.project_name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors relative h-64 flex flex-col items-center justify-center cursor-pointer">
                                {analyzing ? (
                                    <div className="text-center">
                                        <Loader2 className="w-10 h-10 text-pink-600 animate-spin mx-auto mb-3" />
                                        <p className="text-slate-600 font-medium">AI กำลังวิเคราะห์เอกสาร...</p>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileUpload}
                                        />
                                        <Upload className="w-12 h-12 text-slate-400 mb-3" />
                                        <h3 className="text-lg font-semibold text-slate-700">ลากไฟล์ PDF มาวางที่นี่</h3>
                                        <p className="text-slate-500 text-sm">หรือคลิกเพื่อเลือกไฟล์</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-slate-900">รายการไฟล์ที่อัปโหลด ({items.length})</h3>
                                <button onClick={() => setStep(0)} className="text-sm text-pink-600 hover:underline">+ เพิ่มไฟล์อีก</button>
                            </div>

                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                {items.map(item => (
                                    <div key={item.id} className="border rounded-lg p-4 bg-white flex flex-col md:flex-row gap-4 md:items-center justify-between shadow-sm">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <FileText className="w-8 h-8 text-pink-500 shrink-0 bg-pink-50 p-1.5 rounded" />
                                            <div className="min-w-0">
                                                <div className="font-medium text-slate-900 truncate" title={item.fileName}>{item.fileName}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">ชื่อในไฟล์: {item.data.project_name}</div>
                                                {item.reason && <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {item.reason}</div>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {item.status === 'UPDATE' ? (
                                                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded border border-green-200">
                                                    <LinkIcon className="w-4 h-4" />
                                                    <div className="text-sm font-medium">Link OK</div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1 w-full md:w-auto">
                                                    <select
                                                        className="text-sm border-amber-300 bg-amber-50 text-amber-900 rounded p-1.5 w-64 focus:ring-1 focus:ring-amber-500"
                                                        onChange={(e) => {
                                                            if (e.target.value === 'new') {
                                                                handleStartCreate(item);
                                                                e.target.value = ""; // Reset logic
                                                            } else if (e.target.value !== '') {
                                                                handleManualLink(item.id, e.target.value);
                                                            }
                                                        }}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>⚠️ ไม่พบคู่: เลือกรายการ...</option>
                                                        <optgroup label="โครงการที่ขาดเอกสาร">
                                                            {missingProjects.map(p => (
                                                                <option key={p.id} value={p.id}>{p.project_name} ({p.organization})</option>
                                                            ))}
                                                        </optgroup>
                                                        <optgroup label="ตัวเลือกอื่น">
                                                            <option value="new">+ เพิ่มข้อมูลโครงการใหม่</option>
                                                        </optgroup>
                                                    </select>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                title="ลบรายการนี้"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button onClick={reset} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">ยกเลิกทั้งหมด</button>
                                <button
                                    onClick={handleSave}
                                    disabled={importing || items.length === 0}
                                    className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    บันทึกข้อมูล ({items.length})
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">บันทึกข้อมูลสำเร็จ!</h3>
                            <p className="text-slate-600 mb-6">เริ่มการรีเฟรชหน้าจะทำงานในไม่กี่วินาที...</p>
                            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded">ปิดหน้าต่าง</button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Nested Modal for Project Creation */}
            {creationItem && (
                <Modal
                    isOpen={!!creationItem}
                    onClose={() => setCreationItem(null)}
                    title="เพิ่มโครงการใหม่"
                    className="sm:max-w-2xl"
                >
                    <ProjectForm
                        initialData={creationItem.data as any}
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setCreationItem(null)}
                    />
                </Modal>
            )}
        </>
    );
}
