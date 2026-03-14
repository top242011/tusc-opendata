import { createClient } from "@/utils/supabase/server";
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
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">จัดการข้อร้องเรียน</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    ตรวจสอบและจัดการข้อมูลที่มีผู้แจ้งเข้ามาจากหน้ารายละเอียดโครงการ
                </p>
            </div>

            <AdminComplaintsTable complaints={complaints || []} />
        </div>
    );
}
