import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CsvUploader } from "@/components/csv-uploader";
import { AdminProjectTable } from "@/components/admin-project-table";
import Link from 'next/link';
import { Project } from "@/lib/types";
import { QuickFixAction } from "@/components/admin/quick-fix-action";

export default async function AdminPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*, project_files(count)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching projects:", error);
    }

    const projects = (projectsData || []).map((p: any) => ({
        ...p,
        has_files: p.project_files && p.project_files[0] && p.project_files[0].count > 0
    })) as Project[];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <nav className="bg-white border-b px-4 py-4 flex justify-between items-center mb-8">
                <div className="font-bold text-lg text-blue-900">ระบบจัดการข้อมูล</div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{user.email}</span>
                    <form action={async () => {
                        "use server";
                        const supabase = await createClient();
                        await supabase.auth.signOut();
                        redirect('/login');
                    }}>
                        <button className="text-sm text-red-600 hover:text-red-700 font-medium">ออกจากระบบ</button>
                    </form>
                </div>
            </nav>

            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-4">การดำเนินการ</h1>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/admin/import" className="block p-6 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:underline">ศูนย์นำเข้าข้อมูลรวม &rarr;</h3>
                                    <p className="text-blue-100">อัปโหลดไฟล์สรุป Excel หรือข้อเสนอโครงการ PDF ระบบ AI จะเชื่อมโยงและตรวจสอบข้อมูลให้อัตโนมัติ</p>
                                </div>
                            </div>
                        </Link>

                        <QuickFixAction projects={projects} />
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-bold mb-2">จัดการข้อมูล</h1>
                    <AdminProjectTable projects={projects} />
                </div>
            </div>
        </div>
    );
}
