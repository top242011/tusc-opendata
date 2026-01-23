"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, FileSpreadsheet, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';

interface DocumentUploaderProps {
    onFileUploaded: (storagePath: string, fileName: string) => void;
    isAnalyzing: boolean;
}

export default function DocumentUploader({ onFileUploaded, isAnalyzing }: DocumentUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
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
            validateAndUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndUpload(e.target.files[0]);
        }
    };

    const validateAndUpload = async (file: File) => {
        if (
            file.type === "application/pdf" ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        ) {
            await uploadToStorage(file);
        } else {
            alert("รองรับเฉพาะไฟล์ PDF หรือ Excel (.xlsx) เท่านั้น");
        }
    };

    const uploadToStorage = async (file: File) => {
        setIsUploading(true);
        setUploadProgress('กำลังอัปโหลดไฟล์...');

        try {
            const supabase = createClient();

            // Generate unique file path
            const fileExt = file.name.split('.').pop();
            const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const storagePath = `${uniqueId}.${fileExt}`;

            // Upload to temp-documents bucket
            const { error: uploadError } = await supabase.storage
                .from('temp-documents')
                .upload(storagePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                setUploadProgress(null);
                alert('ไม่สามารถอัปโหลดไฟล์ได้: ' + uploadError.message);
                return;
            }

            setUploadProgress('อัปโหลดสำเร็จ กำลังวิเคราะห์...');

            // Call parent with storage path
            onFileUploaded(storagePath, file.name);

        } catch (err) {
            console.error('Upload error:', err);
            setUploadProgress(null);
            alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
        } finally {
            setIsUploading(false);
        }
    };

    const isBusy = isUploading || isAnalyzing;

    return (
        <form
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all cursor-pointer bg-slate-50",
                dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400",
                isBusy ? "opacity-50 pointer-events-none" : ""
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

            {isBusy ? (
                <div className="flex flex-col items-center gap-3 text-slate-500 animate-pulse">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="font-medium">{uploadProgress || 'กำลังวิเคราะห์เอกสาร...'}</p>
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
