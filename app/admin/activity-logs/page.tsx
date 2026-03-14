import { createClient } from "@/utils/supabase/server";
import { ActivityLogsTable } from "@/components/admin/activity-logs-table";
import { redirect } from "next/navigation";

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
        .limit(100);

    if (error) {
        console.error("Error fetching activity logs:", error);
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">ประวัติการใช้งานระบบ</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    ตรวจสอบประวัติการเพิ่ม แก้ไข และลบข้อมูลของผู้ดูแลระบบ
                </p>
            </div>

            <ActivityLogsTable logs={logs || []} />
        </div>
    );
}
