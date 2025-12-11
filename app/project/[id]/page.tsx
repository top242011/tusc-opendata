import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, FileText, Download, CheckCircle, XCircle, AlertCircle, Paperclip, FileArchive } from 'lucide-react';
import { formatTHB, getStatusLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Project, ProjectFile } from '@/lib/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

import { ReportButton } from "@/components/report-button";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage(props: PageProps) {
    const params = await props.params;
    const supabase = await createClient();
    const { id } = params;

    const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

    if (projectError || !projectData) {
        notFound();
    }

    const { data: filesData } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', id)
        .order('uploaded_at', { ascending: false });

    const project = projectData as Project;
    const files = (filesData || []) as ProjectFile[];

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    กลับหน้าหลัก
                </Link>

                {/* Header Card */}
                <div className="bg-white px-8 py-8 shadow-sm border rounded-lg mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileText className="w-32 h-32 text-slate-900" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className="text-slate-500 border-slate-300">
                                ปีงบประมาณ {project.fiscal_year}
                            </Badge>
                            <Badge variant={
                                project.status === 'อนุมัติ' ? 'success' :
                                    project.status === 'ตัดงบ' ? 'warning' : 'destructive'
                            }>
                                {getStatusLabel(project.status)}
                            </Badge>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
                            {project.project_name}
                        </h1>
                        <p className="text-lg text-slate-600 font-medium">{project.organization}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">งบที่เสนอขอ</p>
                            <p className="text-lg font-mono font-medium text-slate-700">{formatTHB(project.budget_requested)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">งบที่ได้รับอนุมัติ</p>
                            <p className={`text-2xl font-mono font-bold ${project.budget_approved > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                {formatTHB(project.budget_approved)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">ผลการพิจารณา</p>
                            <div className="flex items-center gap-2 mt-1">
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
                </div>

                {/* Detail Sections (Official Document Style) */}
                <div className="bg-white shadow-sm border rounded-lg overflow-hidden mb-6">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        รายละเอียดโครงการ
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
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
                </div>

                {/* Budget Breakdown Table */}
                {project.budget_breakdown && Array.isArray(project.budget_breakdown) && project.budget_breakdown.length > 0 && (
                    <div className="bg-white shadow-sm border rounded-lg overflow-hidden mb-6">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-medium text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            รายละเอียดงบประมาณ
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">รายการ</th>
                                        <th className="px-6 py-3 text-right">จำนวน</th>
                                        <th className="px-6 py-3 text-center">หน่วย</th>
                                        <th className="px-6 py-3 text-right">ราคาต่อหน่วย</th>
                                        <th className="px-6 py-3 text-right">รวมเป็นเงิน</th>
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
                )}

                {/* Attachments Section */}
                <div className="bg-white shadow-sm border rounded-lg overflow-hidden mb-8">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-medium text-slate-700 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        เอกสารแนบ ({files.length})
                    </div>
                    <div className="divide-y divide-slate-100">
                        {files.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">ไม่มีเอกสารแนบ</div>
                        ) : (
                            files.map((file) => (
                                <div key={file.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors border border-slate-200">
                                            {['zip', 'rar'].includes(file.file_type) ? <FileArchive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{file.file_name}</p>
                                            <p className="text-xs text-slate-400">
                                                {format(new Date(file.uploaded_at), 'd MMM yyyy', { locale: th })} • {file.file_type.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={file.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        ดูไฟล์ต้นฉบับ
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <ReportButton projectId={project.id} projectName={project.project_name} />

            </div>
        </div>
    );
}


