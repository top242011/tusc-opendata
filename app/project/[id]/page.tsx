import { createClient, createPublicClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, FileText, Download, CheckCircle, XCircle, AlertCircle, Paperclip, FileArchive } from 'lucide-react';
import { PublicNavbar } from "@/components/public-navbar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { formatTHB, getStatusLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project, ProjectFile } from '@/lib/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

import { ReportButton } from "@/components/report-button";
import { Tabs } from "@/components/ui/tabs";
import { GeneralInfoTab, BudgetTab, FilesTab } from "@/components/project-detail-tabs";
import { Wallet } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const revalidate = 600; // 10 minutes

export default async function ProjectDetailPage(props: PageProps) {
    const params = await props.params;
    const supabase = await createPublicClient();
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
        <main id="main-content" className="min-h-screen bg-[rgb(var(--ios-bg-primary))]">
            <PublicNavbar />
            <div className="py-8 px-4 animate-fade-up">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                กลับหน้าหลัก
                            </Link>
                        </Button>
                    </div>

                    <Breadcrumbs
                        items={[
                            { label: 'โครงการทั้งหมด', href: '/' },
                            { label: project.project_name }
                        ]}
                    />

                    {/* Header Card */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] px-8 py-8 shadow-[var(--ios-shadow-sm)] border border-[rgb(var(--ios-separator))]/30 rounded-[var(--ios-radius-lg)] mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText className="w-32 h-32 text-[rgb(var(--ios-text-primary))]" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="outline" className="text-[rgb(var(--ios-text-tertiary))] border-[rgb(var(--ios-separator))] bg-[rgb(var(--ios-bg-secondary))]">
                                    ปีงบประมาณ {project.fiscal_year}
                                </Badge>
                                <Badge variant={
                                    project.status === 'อนุมัติ' ? 'success' :
                                        project.status === 'ตัดงบ' ? 'warning' : 'destructive'
                                }>
                                    {getStatusLabel(project.status)}
                                </Badge>
                            </div>

                            <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] mb-2 leading-tight">
                                {project.project_name}
                            </h1>
                            <p className="text-lg text-[rgb(var(--ios-text-secondary))] font-medium">{project.organization}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-[rgb(var(--ios-separator))]/30">
                            <div>
                                <p className="text-xs text-[rgb(var(--ios-text-tertiary))] uppercase font-semibold">งบที่เสนอขอ</p>
                                <p className="text-lg font-mono font-medium text-[rgb(var(--ios-text-secondary))]">{formatTHB(project.budget_requested)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[rgb(var(--ios-text-tertiary))] uppercase font-semibold">งบที่ได้รับอนุมัติ</p>
                                <p className={`text-2xl font-mono font-bold ${project.budget_approved > 0 ? 'text-[rgb(var(--ios-accent))]' : 'text-[rgb(var(--ios-text-quaternary))]'}`}>
                                    {formatTHB(project.budget_approved)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-[rgb(var(--ios-text-tertiary))] uppercase font-semibold">ผลการพิจารณา</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {project.budget_approved === project.budget_requested ? (
                                        <span className="text-[rgb(var(--ios-green))] text-sm font-medium flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> เต็มจำนวน
                                        </span>
                                    ) : project.budget_approved > 0 ? (
                                        <span className="text-[rgb(var(--ios-orange))] text-sm font-medium flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" /> ปรับลด {((project.budget_requested - project.budget_approved) / project.budget_requested * 100).toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-[rgb(var(--ios-red))] text-sm font-medium flex items-center gap-1">
                                            <XCircle className="w-4 h-4" /> ไม่อนุมัติ
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="mb-8">
                        <Tabs
                            defaultTab="general"
                            tabs={[
                                {
                                    id: 'general',
                                    label: 'ข้อมูลทั่วไป',
                                    icon: <FileText className="w-4 h-4" />,
                                    content: <GeneralInfoTab project={project} />
                                },
                                {
                                    id: 'budget',
                                    label: 'งบประมาณ',
                                    icon: <Wallet className="w-4 h-4" />,
                                    content: <BudgetTab project={project} />
                                },
                                {
                                    id: 'files',
                                    label: 'เอกสาร',
                                    icon: <Paperclip className="w-4 h-4" />,
                                    badge: files.length,
                                    content: <FilesTab files={files} />
                                }
                            ]}
                        />
                    </div>

                    <ReportButton projectId={project.id} projectName={project.project_name} />

                </div>
            </div>
        </main>
    );
}
