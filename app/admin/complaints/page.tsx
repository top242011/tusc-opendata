import { createClient } from "@/utils/supabase/server";
import { AdminNavbar } from "@/components/admin-navbar";
import { AdminComplaintsTable } from "@/components/admin-complaints-table";
import { redirect } from "next/navigation";

export default async function AdminComplaintsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: complaints, error } = await supabase
        .from('complaints')
        .select(`
            *,
            projects (
                project_name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching complaints:", error);
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <AdminNavbar userEmail={user.email} />

            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">จัดการข้อร้องเรียน / แจ้งแก้ไขข้อมูล</h1>
                    <p className="text-slate-500">ตรวจสอบและจัดการข้อมูลที่มีผู้แจ้งเข้ามาจากหน้ารายละเอียดโครงการ</p>
                </div>

                <AdminComplaintsTable complaints={complaints || []} />
            </div>
        </div>
    );
}
