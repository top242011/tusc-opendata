import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminProjectTable } from "@/components/admin-project-table";
import Link from 'next/link';
import { Project } from "@/lib/types";
import {
    Upload,
    FolderOpen,
    FileWarning,
    TrendingUp,
    DollarSign,
    AlertCircle,
    Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function AdminDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch dashboard data in parallel
    const [projectsResult, complaintsResult, logsResult] = await Promise.all([
        supabase
            .from('projects')
            .select('*, project_files(count)')
            .order('created_at', { ascending: false }),
        supabase
            .from('complaints')
            .select('id')
            .eq('status', 'pending'),
        supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    const error = projectsResult.error;
    const projects = (projectsResult.data || []).map((p: any) => ({
        ...p,
        has_files: p.project_files && p.project_files[0] && p.project_files[0].count > 0,
    })) as Project[];

    const pendingComplaints = complaintsResult.data?.length || 0;
    const recentLogs = logsResult.data || [];

    // Compute stats
    const totalProjects = projects.length;
    const totalBudgetRequested = projects.reduce((sum, p) => sum + (p.budget_requested || 0), 0);
    const totalBudgetApproved = projects.reduce((sum, p) => sum + (p.budget_approved || 0), 0);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">แดชบอร์ด</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    ภาพรวมระบบจัดการข้อมูล TU Open Data
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง</AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={FolderOpen}
                    label="โครงการทั้งหมด"
                    value={totalProjects.toString()}
                    color="blue"
                />
                <StatCard
                    icon={DollarSign}
                    label="งบเสนอขอรวม"
                    value={`${formatCurrency(totalBudgetRequested)} ฿`}
                    color="green"
                />
                <StatCard
                    icon={TrendingUp}
                    label="งบอนุมัติรวม"
                    value={`${formatCurrency(totalBudgetApproved)} ฿`}
                    color="purple"
                />
                <StatCard
                    icon={AlertCircle}
                    label="ร้องเรียนรอดำเนินการ"
                    value={pendingComplaints.toString()}
                    color={pendingComplaints > 0 ? 'red' : 'gray'}
                />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))] mb-3">
                    การดำเนินการด่วน
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <QuickAction
                        href="/admin/import"
                        icon={Upload}
                        label="นำเข้าข้อมูล"
                        description="อัปโหลด Excel/CSV หรือ PDF"
                        color="blue"
                    />
                    <QuickAction
                        href="/admin/projects"
                        icon={FolderOpen}
                        label="จัดการโครงการ"
                        description="ดู แก้ไข ลบ โครงการ"
                        color="green"
                    />
                    <QuickAction
                        href="/admin/complaints"
                        icon={FileWarning}
                        label="เรื่องร้องเรียน"
                        description={pendingComplaints > 0 ? `${pendingComplaints} เรื่องรอดำเนินการ` : 'ไม่มีเรื่องรอ'}
                        color={pendingComplaints > 0 ? 'red' : 'gray'}
                    />
                </div>
            </div>

            {/* Recent Activity */}
            {recentLogs.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))]">
                            กิจกรรมล่าสุด
                        </h2>
                        <Link
                            href="/admin/activity-logs"
                            className="text-sm text-[rgb(var(--ios-accent))] hover:underline"
                        >
                            ดูทั้งหมด
                        </Link>
                    </div>
                    <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 divide-y divide-[rgb(var(--ios-separator))]/30">
                        {recentLogs.map((log: any) => (
                            <div key={log.id} className="px-4 py-3 flex items-center gap-3">
                                <Clock className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))] flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-[rgb(var(--ios-text-primary))] truncate">
                                        <span className="font-medium">{log.action}</span>
                                        {' — '}
                                        <span className="text-[rgb(var(--ios-text-secondary))]">{log.entity_name || log.entity_type}</span>
                                    </p>
                                    <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                                        {log.user_email} &middot; {new Date(log.created_at).toLocaleString('th-TH')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Banner */}
            <div className="mb-6 bg-[rgb(var(--ios-accent))]/5 border border-[rgb(var(--ios-accent))]/20 rounded-[var(--ios-radius)] p-4">
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                    <strong className="text-[rgb(var(--ios-accent))]">หมายเหตุ:</strong>{' '}
                    ข้อมูลบนหน้าสาธารณะจะอัปเดตภายใน 5-10 นาทีหลังจากทำการเปลี่ยนแปลง
                </p>
            </div>

            {/* Project Table (last 20) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))]">
                        โครงการล่าสุด
                    </h2>
                    <Link
                        href="/admin/projects"
                        className="text-sm text-[rgb(var(--ios-accent))] hover:underline"
                    >
                        ดูทั้งหมด ({totalProjects})
                    </Link>
                </div>
                <AdminProjectTable projects={projects.slice(0, 20)} />
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
}) {
    const colorMap: Record<string, string> = {
        blue: 'text-[rgb(var(--ios-accent))] bg-[rgb(var(--ios-accent))]/10',
        green: 'text-[rgb(var(--ios-green))] bg-[rgb(var(--ios-green))]/10',
        purple: 'text-[rgb(var(--ios-purple))] bg-[rgb(var(--ios-purple))]/10',
        red: 'text-[rgb(var(--ios-red))] bg-[rgb(var(--ios-red))]/10',
        gray: 'text-[rgb(var(--ios-text-tertiary))] bg-[rgb(var(--ios-fill-tertiary))]',
    };

    return (
        <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-4">
            <div className={`w-9 h-9 rounded-[var(--ios-radius-sm)] flex items-center justify-center mb-3 ${colorMap[color] || colorMap.gray}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mb-1">{label}</p>
            <p className="text-lg font-bold text-[rgb(var(--ios-text-primary))]">{value}</p>
        </div>
    );
}

function QuickAction({
    href,
    icon: Icon,
    label,
    description,
    color,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    description: string;
    color: string;
}) {
    const colorMap: Record<string, string> = {
        blue: 'text-[rgb(var(--ios-accent))]',
        green: 'text-[rgb(var(--ios-green))]',
        red: 'text-[rgb(var(--ios-red))]',
        gray: 'text-[rgb(var(--ios-text-tertiary))]',
    };

    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-4 bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors ios-press"
        >
            <Icon className={`w-6 h-6 flex-shrink-0 ${colorMap[color] || colorMap.gray}`} />
            <div>
                <p className="text-sm font-semibold text-[rgb(var(--ios-text-primary))]">{label}</p>
                <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">{description}</p>
            </div>
        </Link>
    );
}
