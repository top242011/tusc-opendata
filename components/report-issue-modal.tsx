"use client";

import { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Upload, X, FileText, CheckCircle } from "lucide-react";

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
    projectName: string;
}

export function ReportIssueModal({ isOpen, onClose, projectId, projectName }: ReportIssueModalProps) {
    const [type, setType] = useState<'correction' | 'complaint'>('correction'); // Default to correction
    const [description, setDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const supabase = createClient();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const uploadedImagePaths: string[] = [];
            const uploadedAttachmentPaths: string[] = [];

            // Upload Images
            for (const file of images) {
                const filePath = `complaints/${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('project_files') // Reusing project_files bucket, just organized folders
                    .upload(filePath, file);

                if (uploadError) throw uploadError;
                uploadedImagePaths.push(filePath);
            }

            // Upload Attachments
            for (const file of attachments) {
                const filePath = `complaints/${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('project_files')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;
                uploadedAttachmentPaths.push(filePath);
            }

            // Insert Complaint Data
            const { error: insertError } = await supabase
                .from('complaints')
                .insert({
                    project_id: projectId,
                    type,
                    description,
                    contact_info: contactInfo,
                    file_paths: [...uploadedImagePaths, ...uploadedAttachmentPaths], // Initial structure simplifies to just paths
                    status: 'pending'
                });

            if (insertError) throw insertError;

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
                // Reset form
                setDescription('');
                setContactInfo('');
                setImages([]);
                setAttachments([]);
                setType('correction');
            }, 2000);

        } catch (error) {
            console.error("Error submitting report:", error);
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="รับเรื่องเรียบร้อยแล้ว">
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <p className="text-center text-lg font-medium">ขอบคุณสำหรับการแจ้งข้อมูล<br />เราจะดำเนินการตรวจสอบโดยเร็วที่สุด</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`แจ้งปัญหา/แก้ไขข้อมูล: ${projectName}`}
            className="w-[95%] max-w-lg sm:max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Type Selection */}
                <div className="space-y-3">
                    <Label>หัวข้อการแจ้ง</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            onClick={() => setType('correction')}
                            className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${type === 'correction' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}
                        >
                            <p className="font-semibold text-slate-900">ขอแก้ไขข้อมูล</p>
                            <p className="text-xs text-slate-500 mt-1">ข้อมูลในระบบผิดพลาด</p>
                        </div>
                        <div
                            onClick={() => setType('complaint')}
                            className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${type === 'complaint' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'hover:bg-slate-50'}`}
                        >
                            <p className="font-semibold text-slate-900">ร้องเรียนโครงการ</p>
                            <p className="text-xs text-slate-500 mt-1">พบปัญหาการดำเนินงาน</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">รายละเอียด <span className="text-red-500">*</span></Label>
                    <Textarea
                        id="description"
                        placeholder="กรุณาระบุรายละเอียดให้ชัดเจน..."
                        rows={4}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* File Uploads */}
                <div className="space-y-2">
                    <Label>รูปภาพประกอบ (ถ้ามี)</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                            <Upload className="w-6 h-6" />
                            <span className="text-sm">คลิกเพื่ออัปโหลดรูปภาพ</span>
                        </div>
                    </div>
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {images.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs">
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button type="button" onClick={() => removeImage(i)} className="text-slate-400 hover:text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>เอกสารแนบอื่นๆ (ถ้ามี)</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                        <input
                            type="file"
                            multiple
                            onChange={handleAttachmentChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                            <FileText className="w-6 h-6" />
                            <span className="text-sm">คลิกเพื่ออัปโหลดเอกสาร</span>
                        </div>
                    </div>
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {attachments.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs">
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button type="button" onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                    <Label htmlFor="contact">ข้อมูลติดต่อกลับ (ไม่บังคับ)</Label>
                    <Input
                        id="contact"
                        placeholder="เบอร์โทรศัพท์, อีเมล หรือ Line ID"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">เพื่อให้เจ้าหน้าที่สอบถามข้อมูลเพิ่มเติมกรณีจำเป็น</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                กำลังส่งข้อมูล...
                            </>
                        ) : (
                            'ยืนยันการส่งข้อมูล'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
