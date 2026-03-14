'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

// Components
import { ProjectForm } from '@/components/project-form'; // Reusing for Tab 1 (will need slight adaptation or wrapper)
import ProjectDetailForm from '@/components/admin/project-detail-form';
import FileManager from '@/components/admin/file-manager';
import { Toast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProjectEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'files'>('basic');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const supabase = createClient();

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;

            console.log('Fetching project with ID:', id);

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching project:', JSON.stringify(error, null, 2));
                // Do not redirect immediately during debug
                // router.push('/admin'); 
                setLoading(false);
                return;
            }

            if (data) {
                setProject(data as Project);
            }
            setLoading(false);
        };

        fetchProject();
    }, [id, supabase]);

    if (loading) return (
        <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full rounded-lg" />
        </div>
    );

    if (!project) return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <p className="text-red-700 font-medium">ไม่พบข้อมูลโครงการ</p>
                <Link href="/admin" className="inline-block px-4 py-2 bg-[rgb(var(--ios-accent))] text-white rounded-[var(--ios-radius-md)] hover:opacity-90 text-sm">
                    กลับไปหน้าจัดการ
                </Link>
            </div>
        </div>
    );

    return (
        <main id="main-content" className="container mx-auto py-8 px-4 max-w-5xl">
            <Breadcrumbs items={[
                { label: 'หน้าแรก', href: '/admin' },
                { label: 'รายละเอียดโครงการ' },
            ]} />
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-[rgb(var(--ios-fill-tertiary))] rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-[rgb(var(--ios-text-secondary))]" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">แก้ไขโครงการ</h1>
                        <p className="text-[rgb(var(--ios-text-secondary))] text-sm">{project.project_name}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[rgb(var(--ios-separator))]/50 mb-6">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'basic'
                            ? "border-[rgb(var(--ios-accent))] text-[rgb(var(--ios-accent))]"
                            : "border-transparent text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-text-primary))] hover:border-[rgb(var(--ios-separator))]"
                    )}
                >
                    ข้อมูลหลัก
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'details'
                            ? "border-[rgb(var(--ios-accent))] text-[rgb(var(--ios-accent))]"
                            : "border-transparent text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-text-primary))] hover:border-[rgb(var(--ios-separator))]"
                    )}
                >
                    รายละเอียดโครงการ
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'files'
                            ? "border-[rgb(var(--ios-accent))] text-[rgb(var(--ios-accent))]"
                            : "border-transparent text-[rgb(var(--ios-text-secondary))] hover:text-[rgb(var(--ios-text-primary))] hover:border-[rgb(var(--ios-separator))]"
                    )}
                >
                    จัดการเอกสาร
                </button>
            </div>

            {/* Content Actions */}
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-sm)] border border-[rgb(var(--ios-separator))]/50 p-6">
                {activeTab === 'basic' && (
                    // Using existing form but injected with data. 
                    // IMPORTANT: ProjectForm logic currently expects to be in a Modal and handles its own state/submit via props.
                    // I might need to adjust ProjectForm to allow "Edit Mode" without a Modal container or just wrap it.
                    // For now, I'll pass a dummy onClose.
                    <ProjectForm
                        initialData={project}
                        onSuccess={() => {
                            setToastMessage("บันทึกแก้ไขโครงการสำเร็จ (ข้อมูลจะแสดงผลบนหน้าเว็บในอีก 5-10 นาที)");
                            setShowToast(true);
                            // Delay redirect to let user see the toast
                            setTimeout(() => {
                                router.refresh();
                                router.push('/admin');
                            }, 1500);
                        }}
                        onCancel={() => router.push('/admin')} // Redirect to admin list
                    />
                )}

                {activeTab === 'details' && (
                    <ProjectDetailForm project={project} />
                )}

                {activeTab === 'files' && (
                    <FileManager projectId={project.id} />
                )}
            </div>

            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </main>
    );
}
