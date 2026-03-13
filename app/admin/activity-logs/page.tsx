import { createClient } from "@/utils/supabase/server";
import { AdminNavbar } from "@/components/admin-navbar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ActivityLogsTable } from "@/components/admin/activity-logs-table";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function ActivityLogsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: logs, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to last 100 logs for performance

    if (error) {
        console.error("Error fetching activity logs:", error);
    }

    return (
        <main id="main-content" className="min-h-screen bg-slate-50 pb-20">
            <AdminNavbar userEmail={user.email} />

            <div className="container mx-auto max-w-6xl px-4 pt-6">
                <Breadcrumbs items={[
                    { label: 'หน้าแรก', href: '/admin' },
                    { label: 'บันทึกกิจกรรม' },
                ]} />
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>ไม่สามารถโหลดประวัติการใช้งานได้ กรุณาลองใหม่อีกครั้ง</AlertDescription>
                    </Alert>
                )}

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">ประวัติการใช้งานระบบ</h1>
                    <p className="text-slate-500">ตรวจสอบประวัติการเพิ่ม แก้ไข และลบข้อมูลของผู้ดูแลระบบ</p>
                </div>

                <ActivityLogsTable logs={logs || []} />
            </div>
        </main>
    );
}
