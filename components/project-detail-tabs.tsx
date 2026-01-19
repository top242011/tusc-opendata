"use client";

import { Project, ProjectFile } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertCircle, XCircle, FileArchive, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface TabProps {
    project: Project;
}

export function GeneralInfoTab({ project }: TabProps) {
    return (
        <div className="space-y-8">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">ผู้รับผิดชอบโครงการ</h3>
                    <p className="text-slate-600">{project.responsible_person || '-'}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">อาจารย์ที่ปรึกษา</h3>
                    <p className="text-slate-600">{project.advisor || '-'}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">ประเภทกิจกรรม</h3>
                    <p className="text-slate-600">{project.activity_type || '-'}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">เป้าหมาย / ตัวชี้วัด</h3>
                    <p className="text-slate-600 whitespace-pre-line">{project.targets || '-'}</p>
                </div>
            </div>

            {/* Rationale */}
            <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 pb-1">หลักการและเหตุผล</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                    {project.rationale || 'ไม่มีข้อมูล'}
                </div>
            </div>

            {/* Objectives */}
            <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 pb-1">วัตถุประสงค์</h3>
                {project.objectives && project.objectives.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                        {project.objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-400 italic">ไม่มีข้อมูล</p>
                )}
            </div>

            {/* SDGs */}
            <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 pb-1">เป้าหมายการพัฒนาที่ยั่งยืน (SDGs)</h3>
                {project.sdg_goals && project.sdg_goals.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {project.sdg_goals.map((sdg, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {sdg}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 italic">ไม่มีข้อมูล</p>
                )}
            </div>

            {/* Notes */}
            {project.notes && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-sm text-yellow-800">
                    <strong>หมายเหตุ:</strong> {project.notes}
                </div>
            )}
        </div>
    );
}

export function BudgetTab({ project }: TabProps) {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">งบที่เสนอขอ</p>
                    <p className="text-lg font-mono font-medium text-slate-700 mt-1">{formatTHB(project.budget_requested)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">งบที่ได้รับอนุมัติ</p>
                    <p className={`text-2xl font-mono font-bold mt-1 ${project.budget_approved > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                        {formatTHB(project.budget_approved)}
                    </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">ผลการพิจารณา</p>
                    <div className="mt-2">
                        {project.budget_approved === project.budget_requested ? (
                            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> เต็มจำนวน
                            </span>
                        ) : project.budget_approved > 0 ? (
                            <span className="text-orange-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" /> ปรับลด {((project.budget_requested - project.budget_approved) / project.budget_requested * 100).toFixed(1)}%
                            </span>
                        ) : (
                            <span className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> ไม่อนุมัติ
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Budget Breakdown Table */}
            {project.budget_breakdown && Array.isArray(project.budget_breakdown) && project.budget_breakdown.length > 0 ? (
                <div className="overflow-hidden border rounded-lg">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-medium text-slate-700 text-sm">
                        รายละเอียดรายการ
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
                                <tr>
                                    <th className="px-6 py-3 whitespace-nowrap">รายการ</th>
                                    <th className="px-6 py-3 text-right whitespace-nowrap">จำนวน</th>
                                    <th className="px-6 py-3 text-center whitespace-nowrap">หน่วย</th>
                                    <th className="px-6 py-3 text-right whitespace-nowrap">ราคาต่อหน่วย</th>
                                    <th className="px-6 py-3 text-right whitespace-nowrap">รวมเป็นเงิน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {project.budget_breakdown.map((item: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-medium text-slate-700">{item.item}</td>
                                        <td className="px-6 py-3 text-right">{item.amount}</td>
                                        <td className="px-6 py-3 text-center">{item.unit}</td>
                                        <td className="px-6 py-3 text-right">{formatTHB(item.cost_per_unit || 0)}</td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-900">{formatTHB(item.total || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 border rounded-lg border-dashed text-slate-500">
                    ไม่มีรายละเอียดงบประมาณ
                </div>
            )}
        </div>
    );
}

export function FilesTab({ files }: { files: ProjectFile[] }) {
    return (
        <div className="space-y-4">
            {files.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border rounded-lg border-dashed bg-slate-50 flex flex-col items-center gap-3">
                    <FileText className="w-10 h-10 text-slate-300" />
                    <div>
                        <p className="font-medium text-slate-900">ไม่มีเอกสารแนบ</p>
                        <p className="text-sm">โครงการนี้ยังไม่มีเอกสารที่เปิดเผยในขณะนี้</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {files.map((file) => (
                        <div key={file.id} className="p-4 flex items-center justify-between bg-white border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {['zip', 'rar'].includes(file.file_type) ? <FileArchive className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{file.file_name}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        อัปโหลดเมื่อ {format(new Date(file.uploaded_at), 'd MMM yyyy', { locale: th })} • {file.file_type.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors shrink-0"
                            >
                                <Paperclip className="w-4 h-4" />
                                <span className="hidden sm:inline">ดาวน์โหลด</span>
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
