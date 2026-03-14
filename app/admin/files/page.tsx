import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, FileArchive, Image, HardDrive, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default async function FilesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: files } = await supabase
        .from('project_files')
        .select('*, projects(id, project_name)')
        .order('uploaded_at', { ascending: false });

    const allFiles = files || [];

    // Stats
    const totalFiles = allFiles.length;
    const byType = allFiles.reduce((acc: Record<string, number>, f: any) => {
        const t = (f.file_type || 'other').toLowerCase();
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});
    const projectsWithFiles = new Set(allFiles.map((f: any) => f.project_id)).size;

    const getFileIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t === 'pdf') return <FileText className="w-4 h-4 text-[rgb(var(--ios-red))]" />;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(t)) return <Image className="w-4 h-4 text-[rgb(var(--ios-accent))]" />;
        if (['zip', 'rar', '7z'].includes(t)) return <FileArchive className="w-4 h-4 text-[rgb(var(--ios-orange))]" />;
        return <FileText className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />;
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">จัดการไฟล์</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    ไฟล์แนบทั้งหมดในระบบ จัดเก็บใน Supabase Storage
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={<HardDrive className="w-5 h-5" />} label="ไฟล์ทั้งหมด" value={totalFiles} />
                <StatCard icon={<FileText className="w-5 h-5" />} label="PDF" value={byType['pdf'] || 0} />
                <StatCard icon={<Image className="w-5 h-5" />} label="รูปภาพ" value={(byType['jpg'] || 0) + (byType['jpeg'] || 0) + (byType['png'] || 0)} />
                <StatCard icon={<FileText className="w-5 h-5" />} label="โครงการที่มีไฟล์" value={projectsWithFiles} />
            </div>

            {/* Files Table */}
            <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[rgb(var(--ios-separator))]/30 text-xs uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">
                                <th className="px-4 py-3 font-semibold">ชื่อไฟล์</th>
                                <th className="px-4 py-3 font-semibold">โครงการ</th>
                                <th className="px-4 py-3 font-semibold">ประเภท</th>
                                <th className="px-4 py-3 font-semibold">วันที่อัปโหลด</th>
                                <th className="px-4 py-3 font-semibold text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--ios-separator))]/20">
                            {allFiles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-[rgb(var(--ios-text-tertiary))]">
                                        ยังไม่มีไฟล์ในระบบ
                                    </td>
                                </tr>
                            ) : (
                                allFiles.map((file: any) => (
                                    <tr key={file.id} className="hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {getFileIcon(file.file_type)}
                                                <a
                                                    href={file.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[rgb(var(--ios-accent))] hover:underline font-medium truncate max-w-[200px]"
                                                    title={file.file_name}
                                                >
                                                    {file.file_name}
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[rgb(var(--ios-text-secondary))]">
                                            <span className="truncate max-w-[200px] block" title={file.projects?.project_name}>
                                                {file.projects?.project_name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="uppercase text-xs font-semibold text-[rgb(var(--ios-text-tertiary))]">
                                                {file.file_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[rgb(var(--ios-text-secondary))]">
                                            {format(new Date(file.uploaded_at), 'd MMM yyyy HH:mm', { locale: th })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {file.projects?.id && (
                                                <Link
                                                    href={`/admin/project/${file.projects.id}`}
                                                    className="inline-flex items-center gap-1 text-xs text-[rgb(var(--ios-accent))] hover:underline"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                    แก้ไขโครงการ
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {allFiles.length > 0 && (
                    <div className="px-4 py-3 border-t border-[rgb(var(--ios-separator))]/30 text-xs text-[rgb(var(--ios-text-tertiary))]">
                        แสดง {allFiles.length} ไฟล์ — ลบหรืออัปโหลดไฟล์ได้จากหน้าแก้ไขโครงการ (แท็บไฟล์แนบ)
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-4">
            <div className="flex items-center gap-2 text-[rgb(var(--ios-text-tertiary))] mb-1">
                {icon}
                <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">{value}</p>
        </div>
    );
}
