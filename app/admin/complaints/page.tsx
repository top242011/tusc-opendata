import { createClient } from "@/utils/supabase/server";
import { AdminNavbar } from "@/components/admin-navbar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AdminComplaintsTable } from "@/components/admin-complaints-table";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
        <main id="main-content" className="min-h-screen bg-slate-50 pb-20">
            <AdminNavbar userEmail={user.email} />

            <div className="container mx-auto max-w-6xl px-4 pt-6">
                <Breadcrumbs items={[
                    { label: 'หน้าแรก', href: '/admin' },
                    { label: 'เรื่องร้องเรียน' },
                ]} />
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>ไม่สามารถโหลดข้อร้องเรียนได้ กรุณาลองใหม่อีกครั้ง</AlertDescription>
                    </Alert>
                )}

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">จัดการข้อร้องเรียน / แจ้งแก้ไขข้อมูล</h1>
                    <p className="text-slate-500">ตรวจสอบและจัดการข้อมูลที่มีผู้แจ้งเข้ามาจากหน้ารายละเอียดโครงการ</p>
                </div>

                <AdminComplaintsTable complaints={complaints || []} />
            </div>
        </main>
    );
}
