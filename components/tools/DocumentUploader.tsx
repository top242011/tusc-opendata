"use client";

import { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';
import { Toast } from '@/components/ui/toast';

interface DocumentUploaderProps {
    onFileUploaded: (storagePath: string, fileName: string) => void;
    isAnalyzing: boolean;
}

export default function DocumentUploader({ onFileUploaded, isAnalyzing }: DocumentUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('error');
    const [showToast, setShowToast] = useState(false);
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

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    const validateAndUpload = async (file: File) => {
        setError(null);

        if (file.size > MAX_FILE_SIZE) {
            setError(`ไฟล์มีขนาด ${(file.size / 1024 / 1024).toFixed(1)} MB เกินขนาดสูงสุดที่อนุญาต (10 MB)`);
            return;
        }

        if (
            file.type === "application/pdf" ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        ) {
            await uploadToStorage(file);
        } else {
            setError("รองรับเฉพาะไฟล์ PDF หรือ Excel (.xlsx) เท่านั้น");
            setToastMessage("รองรับเฉพาะไฟล์ PDF หรือ Excel (.xlsx) เท่านั้น");
            setToastType('error');
            setShowToast(true);
        }
    };

    const uploadToStorage = async (file: File) => {
        setIsUploading(true);
        setUploadProgress('กำลังอัปโหลดไฟล์...');
        setError(null);

        try {
            const supabase = createClient();

            const fileExt = file.name.split('.').pop();
            const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const storagePath = `${uniqueId}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('temp-documents')
                .upload(storagePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                setUploadProgress(null);
                setError('ไม่สามารถอัปโหลดไฟล์ได้: ' + uploadError.message);
                setToastMessage('ไม่สามารถอัปโหลดไฟล์ได้: ' + uploadError.message);
                setToastType('error');
                setShowToast(true);
                return;
            }

            setUploadProgress('อัปโหลดสำเร็จ กำลังวิเคราะห์...');
            onFileUploaded(storagePath, file.name);

        } catch (err) {
            console.error('Upload error:', err);
            setUploadProgress(null);
            setError('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
            setToastMessage('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
            setToastType('error');
            setShowToast(true);
        } finally {
            setIsUploading(false);
        }
    };

    const isBusy = isUploading || isAnalyzing;

    return (
        <div className="space-y-3">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                    "bg-[rgb(var(--ios-fill-tertiary))]",
                    dragActive ? "border-[rgb(var(--ios-accent))] bg-[rgb(var(--ios-accent))]/5" : "border-[rgb(var(--ios-separator))] hover:border-[rgb(var(--ios-text-quaternary))]",
                    isBusy ? "opacity-50 pointer-events-none" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
                aria-label="อัปโหลดเอกสาร PDF หรือ Excel"
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls"
                    onChange={handleChange}
                    aria-label="เลือกไฟล์เอกสาร"
                />

                {isBusy ? (
                    <div className="flex flex-col items-center gap-3 text-[rgb(var(--ios-text-secondary))] animate-pulse">
                        <Loader2 className="w-10 h-10 animate-spin text-[rgb(var(--ios-accent))]" />
                        <p className="font-medium">{uploadProgress || 'กำลังวิเคราะห์เอกสาร...'}</p>
                        <p className="text-xs">กรุณารอสักครู่ ระบบกำลังตรวจสอบตามกฎระเบียบ</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-[rgb(var(--ios-text-secondary))]">
                        <div className="p-4 bg-[rgb(var(--ios-bg-secondary))] rounded-full shadow-[var(--ios-shadow-sm)]">
                            <Upload className="w-8 h-8 text-[rgb(var(--ios-accent))]" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-[rgb(var(--ios-text-primary))]">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง</p>
                            <p className="text-xs mt-1 text-[rgb(var(--ios-text-quaternary))]">รองรับไฟล์ PDF หรือ Excel (.xlsx)</p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-3 bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))] text-sm rounded-[var(--ios-radius-sm)] flex items-center gap-2" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
