'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

// Components
import { ProjectForm } from '@/components/project-form'; // Reusing for Tab 1 (will need slight adaptation or wrapper)
import ProjectDetailForm from '@/components/admin/project-detail-form';
import FileManager from '@/components/admin/file-manager';

export default function AdminProjectEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'files'>('basic');
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

    if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">ไม่พบข้อมูลโครงการ</div>;

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">แก้ไขโครงการ</h1>
                        <p className="text-slate-500 text-sm">{project.project_name}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'basic'
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}
                >
                    ข้อมูลหลัก
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'details'
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}
                >
                    รายละเอียดโครงการ
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'files'
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}
                >
                    จัดการเอกสาร
                </button>
            </div>

            {/* Content Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                {activeTab === 'basic' && (
                    // Using existing form but injected with data. 
                    // IMPORTANT: ProjectForm logic currently expects to be in a Modal and handles its own state/submit via props.
                    // I might need to adjust ProjectForm to allow "Edit Mode" without a Modal container or just wrap it.
                    // For now, I'll pass a dummy onClose.
                    <ProjectForm
                        initialData={project}
                        onSuccess={() => {
                            // Refresh logic
                            router.refresh();
                        }}
                        onCancel={() => { }} // No-op
                    />
                )}

                {activeTab === 'details' && (
                    <ProjectDetailForm project={project} />
                )}

                {activeTab === 'files' && (
                    <FileManager projectId={project.id} />
                )}
            </div>
        </div>
    );
}
