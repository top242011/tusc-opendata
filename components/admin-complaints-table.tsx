"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ExternalLink, FileText, Image as ImageIcon, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";

interface Complaint {
    id: number;
    project_id: number;
    type: 'correction' | 'complaint';
    description: string;
    contact_info: string;
    file_paths: string[];
    status: 'pending' | 'acknowledged' | 'resolved' | 'ignored';
    created_at: string;
    projects: {
        project_name: string;
    };
}

interface AdminComplaintsTableProps {
    complaints: Complaint[];
}

export function AdminComplaintsTable({ complaints: initialComplaints }: AdminComplaintsTableProps) {
    const [complaints, setComplaints] = useState(initialComplaints);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const supabase = createClient();

    const handleStatusChange = async (id: number, newStatus: string) => {
        const { error } = await supabase
            .from('complaints')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
        } else {
            alert("Failed to update status");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">รอดำเนินการ</Badge>;
            case 'acknowledged': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">รับเรื่องแล้ว</Badge>;
            case 'resolved': return <Badge variant="success">แก้ไขแล้ว</Badge>;
            case 'ignored': return <Badge variant="secondary">เพิกเฉย</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap">วันที่แจ้ง</th>
                                <th className="px-4 py-3 whitespace-nowrap">ประเภท</th>
                                <th className="px-4 py-3">โครงการ</th>
                                <th className="px-4 py-3">รายละเอียด</th>
                                <th className="px-4 py-3 whitespace-nowrap">หลักฐาน</th>
                                <th className="px-4 py-3 whitespace-nowrap">สถานะ</th>
                                <th className="px-4 py-3 whitespace-nowrap text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {complaints.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                        ไม่มีรายการแจ้งปัญหา
                                    </td>
                                </tr>
                            ) : (
                                complaints.map((complaint) => (
                                    <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                            {format(new Date(complaint.created_at), 'd MMM yy HH:mm', { locale: th })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {complaint.type === 'correction' ? (
                                                <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                                                    <FileText className="w-3 h-3" /> แก้ไขข้อมูล
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                                    <MessageSquare className="w-3 h-3" /> ร้องเรียน
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate" title={complaint.projects?.project_name}>
                                            <Link href={`/project/${complaint.project_id}`} target="_blank" className="hover:underline hover:text-blue-600">
                                                {complaint.projects?.project_name || 'Unknown Project'}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 max-w-[300px] truncate cursor-pointer" onClick={() => setSelectedComplaint(complaint)}>
                                            {complaint.description}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {complaint.file_paths && complaint.file_paths.length > 0 ? (
                                                <Badge variant="secondary" className="gap-1">
                                                    <ImageIcon className="w-3 h-3" /> {complaint.file_paths.length}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getStatusBadge(complaint.status)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <select
                                                value={complaint.status}
                                                onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                                                className="text-xs border rounded px-2 py-1 bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="pending">รอดำเนินการ</option>
                                                <option value="acknowledged">รับเรื่องแล้ว</option>
                                                <option value="resolved">แก้ไขแล้ว</option>
                                                <option value="ignored">เพิกเฉย</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedComplaint && (
                <Modal
                    isOpen={!!selectedComplaint}
                    onClose={() => setSelectedComplaint(null)}
                    title={selectedComplaint.type === 'correction' ? 'รายละเอียดการแจ้งแก้ไขข้อมูล' : 'รายละเอียดข้อร้องเรียน'}
                    className="w-[95%] max-w-2xl"
                >
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-semibold text-slate-900 mb-1">โครงการ</h3>
                            <Link href={`/project/${selectedComplaint.project_id}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                {selectedComplaint.projects?.project_name} <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2">รายละเอียด</h3>
                            <div className="p-4 bg-white border rounded-lg text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {selectedComplaint.description}
                            </div>
                        </div>

                        {selectedComplaint.contact_info && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-2">ข้อมูลติดต่อกลับ</h3>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 font-mono text-sm">
                                    {selectedComplaint.contact_info}
                                </div>
                            </div>
                        )}

                        {selectedComplaint.file_paths && selectedComplaint.file_paths.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3">หลักฐาน / ไฟล์แนบ ({selectedComplaint.file_paths.length})</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {selectedComplaint.file_paths.map((path, i) => {
                                        const isImage = path.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                        const publicUrl = supabase.storage.from('project_files').getPublicUrl(path).data.publicUrl;

                                        return (
                                            <a
                                                key={i}
                                                href={publicUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group block relative aspect-video bg-slate-100 rounded-lg overflow-hidden border hover:border-blue-500 transition-colors"
                                            >
                                                {isImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={publicUrl} alt="evidence" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                                        <FileText className="w-8 h-8 mb-2" />
                                                        <span className="text-xs truncate max-w-[90%] px-2">{path.split('/').pop()}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <ExternalLink className="w-6 h-6 text-white drop-shadow-md" />
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}
