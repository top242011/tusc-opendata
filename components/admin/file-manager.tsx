'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ProjectFile } from '@/lib/types';
import { Loader2, Trash2, FileText, FileArchive, Download, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface FileManagerProps {
    projectId: number;
}

export default function FileManager({ projectId }: FileManagerProps) {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const fetchFiles = async () => {
        const { data, error } = await supabase
            .from('project_files')
            .select('*')
            .eq('project_id', projectId)
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('Error fetching files:', error);
        } else {
            setFiles(data as ProjectFile[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFiles();
    }, [projectId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('project_files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project_files')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('project_files')
                .insert({
                    project_id: projectId,
                    file_name: file.name,
                    file_url: publicUrl,
                    file_type: fileExt || 'unknown',
                    category: 'general' // Default category
                });

            if (dbError) throw dbError;

            // Refresh list
            fetchFiles();
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (fileId: string, fileName: string) => {
        if (!confirm('ยืนยันการลบไฟล์นี้?')) return;

        try {
            // 1. Delete from DB
            await supabase
                .from('project_files')
                .delete()
                .eq('id', fileId);

            // 2. Delete from Storage (Optional: Implementation depends on path storage strategy)
            // Ideally we delete from storage too.
            // But strict filename matching needed.

            fetchFiles();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Lop file mai dai');
        }
    };

    const getFileIcon = (type: string) => {
        if (['zip', 'rar', '7z'].includes(type.toLowerCase())) return <FileArchive className="w-5 h-5 text-yellow-600" />;
        if (['pdf'].includes(type.toLowerCase())) return <FileText className="w-5 h-5 text-red-600" />;
        return <FileText className="w-5 h-5 text-slate-500" />;
    };

    if (loading) return <div className="text-center py-4">กำลังโหลดข้อมูลเอกสาร...</div>;

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative">
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={uploading}
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                    {uploading ? (
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    ) : (
                        <UploadCloud className="w-10 h-10 text-slate-400" />
                    )}
                    <p className="text-slate-600 font-medium">คลิกเพื่ออัปโหลดไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                    <p className="text-slate-400 text-sm">รองรับ PDF, ZIP, XLSX (Maximum 10MB)</p>
                </div>
            </div>

            {/* File List */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-medium text-slate-700">ชื่อไฟล์</th>
                            <th className="px-4 py-3 font-medium text-slate-700">ประเภท</th>
                            <th className="px-4 py-3 font-medium text-slate-700">วันที่อัปโหลด</th>
                            <th className="px-4 py-3 font-medium text-slate-700 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {files.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                    ยังไม่มีเอกสารแนบ
                                </td>
                            </tr>
                        ) : (
                            files.map((file) => (
                                <tr key={file.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-3">
                                        {getFileIcon(file.file_type)}
                                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600">
                                            {file.file_name}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 uppercase">{file.file_type}</td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {format(new Date(file.uploaded_at), 'd MMM yyyy HH:mm', { locale: th })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(file.id, file.file_name)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                            title="ลบไฟล์"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
