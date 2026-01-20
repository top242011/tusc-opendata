"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DocumentUploaderProps {
    onFileSelected: (file: File) => void;
    isAnalyzing: boolean;
}

export default function DocumentUploader({ onFileSelected, isAnalyzing }: DocumentUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSelect(e.target.files[0]);
        }
    };

    const validateAndSelect = (file: File) => {
        if (
            file.type === "application/pdf" ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        ) {
            onFileSelected(file);
        } else {
            alert("รองรับเฉพาะไฟล์ PDF หรือ Excel (.xlsx) เท่านั้น");
        }
    };

    return (
        <form
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all cursor-pointer bg-slate-50",
                dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400",
                isAnalyzing ? "opacity-50 pointer-events-none" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.xlsx,.xls"
                onChange={handleChange}
            />

            {isAnalyzing ? (
                <div className="flex flex-col items-center gap-3 text-slate-500 animate-pulse">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="font-medium">กำลังวิเคราะห์เอกสาร...</p>
                    <p className="text-xs">กรุณารอสักครู่ ระบบกำลังตรวจสอบตามกฎระเบียบ</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                        <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium text-slate-700">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง</p>
                        <p className="text-xs mt-1 text-slate-400">รองรับไฟล์ PDF หรือ Excel (.xlsx)</p>
                    </div>
                </div>
            )}
        </form>
    );
}
