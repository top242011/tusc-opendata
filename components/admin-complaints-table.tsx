"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ExternalLink, FileText, Image as ImageIcon, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";

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
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showToast, setShowToast] = useState(false);
    const supabase = createClient();

    const handleStatusChange = async (id: number, newStatus: string) => {
        const { error } = await supabase
            .from('complaints')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
        } else {
            setToastMessage('อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
            setToastType('error');
            setShowToast(true);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-orange))]/10 text-[rgb(var(--ios-orange))] border border-[rgb(var(--ios-orange))]/20">รอดำเนินการ</span>;
            case 'acknowledged':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] border border-[rgb(var(--ios-accent))]/20">รับเรื่องแล้ว</span>;
            case 'resolved':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))] border border-[rgb(var(--ios-green))]/20">แก้ไขแล้ว</span>;
            case 'ignored':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))] border border-[rgb(var(--ios-separator))]/50">เพิกเฉย</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))] border border-[rgb(var(--ios-separator))]/50">{status}</span>;
        }
    };

    return (
        <>
            <Toast message={toastMessage} type={toastType} isVisible={showToast} onClose={() => setShowToast(false)} />

            <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-[rgb(var(--ios-separator))]/30 text-xs uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">วันที่แจ้ง</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">ประเภท</th>
                                <th className="px-4 py-3 font-semibold">โครงการ</th>
                                <th className="px-4 py-3 font-semibold">รายละเอียด</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap text-center">หลักฐาน</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">สถานะ</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--ios-separator))]/20">
                            {complaints.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-[rgb(var(--ios-text-tertiary))]">
                                        ไม่มีรายการแจ้งปัญหา
                                    </td>
                                </tr>
                            ) : (
                                complaints.map((complaint) => (
                                    <tr key={complaint.id} className="hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-[rgb(var(--ios-text-secondary))]">
                                            {format(new Date(complaint.created_at), 'd MMM yy HH:mm', { locale: th })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {complaint.type === 'correction' ? (
                                                <span className="inline-flex items-center gap-1 text-[rgb(var(--ios-accent))] font-medium text-xs">
                                                    <FileText className="w-3 h-3" /> แก้ไขข้อมูล
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[rgb(var(--ios-red))] font-medium text-xs">
                                                    <MessageSquare className="w-3 h-3" /> ร้องเรียน
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[rgb(var(--ios-text-primary))] max-w-[200px] truncate" title={complaint.projects?.project_name}>
                                            <Link href={`/project/${complaint.project_id}`} target="_blank" className="hover:underline hover:text-[rgb(var(--ios-accent))]">
                                                {complaint.projects?.project_name || 'Unknown Project'}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-[rgb(var(--ios-text-secondary))] max-w-[300px] truncate cursor-pointer" onClick={() => setSelectedComplaint(complaint)}>
                                            {complaint.description}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {complaint.file_paths && complaint.file_paths.length > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[rgb(var(--ios-text-secondary))] bg-[rgb(var(--ios-fill-tertiary))] px-2 py-0.5 rounded-full">
                                                    <ImageIcon className="w-3 h-3" /> {complaint.file_paths.length}
                                                </span>
                                            ) : (
                                                <span className="text-[rgb(var(--ios-text-tertiary))]">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getStatusBadge(complaint.status)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <select
                                                value={complaint.status}
                                                onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                                                className="text-sm border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-sm)] px-2.5 py-1.5 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] hover:border-[rgb(var(--ios-accent))]/50 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ios-accent))]"
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
                {complaints.length > 0 && (
                    <div className="px-4 py-3 border-t border-[rgb(var(--ios-separator))]/30 text-xs text-[rgb(var(--ios-text-tertiary))]">
                        รายการทั้งหมด {complaints.length} รายการ — คลิกที่แถวเพื่อดูรายละเอียด
                    </div>
                )}
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
                        <div className="bg-[rgb(var(--ios-fill-tertiary))] p-4 rounded-[var(--ios-radius-md)] border border-[rgb(var(--ios-separator))]/50">
                            <h3 className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] mb-1">โครงการ</h3>
                            <Link href={`/project/${selectedComplaint.project_id}`} target="_blank" className="text-[rgb(var(--ios-accent))] hover:underline flex items-center gap-1 text-sm">
                                {selectedComplaint.projects?.project_name} <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] mb-2">รายละเอียด</h3>
                            <div className="p-4 bg-[rgb(var(--ios-bg-primary))] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-md)] text-[rgb(var(--ios-text-secondary))] whitespace-pre-wrap leading-relaxed text-sm">
                                {selectedComplaint.description}
                            </div>
                        </div>

                        {selectedComplaint.contact_info && (
                            <div>
                                <h3 className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] mb-2">ข้อมูลติดต่อกลับ</h3>
                                <div className="p-3 bg-[rgb(var(--ios-fill-tertiary))] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-text-secondary))] font-mono text-sm">
                                    {selectedComplaint.contact_info}
                                </div>
                            </div>
                        )}

                        {selectedComplaint.file_paths && selectedComplaint.file_paths.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] mb-3">หลักฐาน / ไฟล์แนบ ({selectedComplaint.file_paths.length})</h3>
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
                                                className="group block relative aspect-video bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-md)] overflow-hidden border border-[rgb(var(--ios-separator))]/50 hover:border-[rgb(var(--ios-accent))]/50 transition-colors"
                                            >
                                                {isImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={publicUrl} alt="evidence" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-[rgb(var(--ios-text-tertiary))]">
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

                        <div className="flex justify-end pt-4 border-t border-[rgb(var(--ios-separator))]/30">
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                className="bg-[rgb(var(--ios-accent))] text-white px-4 py-2 rounded-[var(--ios-radius-md)] hover:opacity-90 text-sm"
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
