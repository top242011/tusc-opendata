import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminProjectTable } from "@/components/admin-project-table";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data, error } = await supabase
        .from('projects')
        .select('*, project_files(count)')
        .order('created_at', { ascending: false });

    const projects = (data || []).map((p: any) => ({
        ...p,
        has_files: p.project_files && p.project_files[0] && p.project_files[0].count > 0,
    })) as Project[];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">โครงการทั้งหมด</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    จัดการข้อมูลโครงการ ค้นหา กรอง และแก้ไขรายละเอียด
                </p>
            </div>

            <AdminProjectTable projects={projects} />
        </div>
    );
}
