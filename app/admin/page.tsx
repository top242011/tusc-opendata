import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CsvUploader } from "@/components/csv-uploader";
import { AdminProjectTable } from "@/components/admin-project-table";
import Link from 'next/link';
import { Project } from "@/lib/types";
import { AdminNavbar } from "@/components/admin-navbar";
import { Upload } from "lucide-react";
import { AdminQuickStart } from "@/components/admin/admin-quick-start";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
            <AdminNavbar userEmail={user?.email} />

            <div className="container mx-auto max-w-6xl px-4">
                {/* Usage Guide */}
                <AdminQuickStart />

                <Alert className="mb-6 bg-blue-50/50 border-blue-200 text-blue-900">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 font-semibold">บันทึกช่วยจำเรื่องการอัปเดตข้อมูล</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        เพื่อประสิทธิภาพสูงสุด ระบบจะใช้เวลาประมาณ 5-10 นาทีในการอัปเดตข้อมูลบนหน้าสาธารณะหลังจากที่คุณทำการเปลี่ยนแปลงเสร็จสิ้น
                    </AlertDescription>
                </Alert>

                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">การดำเนินการ</h1>

                        <Link href="/admin/import" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transform duration-200">
                            <Upload className="w-5 h-5" />
                            <span className="font-semibold">เริ่มกระบวนการนำเข้าข้อมูล &rarr;</span>
                        </Link>
                    </div>

                    <p className="text-slate-500 mb-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm">
                        💡 <strong>Tip:</strong> ท่านสามารถเริ่มกระบวนการนำเข้าได้ทันที ระบบจะพาเข้าสู่ขั้นตอนการระบุข้อมูล อัปโหลดไฟล์ และตรวจสอบความถูกต้องทีละขั้นตอนอย่างละเอียด
                    </p>
                </div>

                <div>
                    <h1 className="text-2xl font-bold mb-4">จัดการข้อมูลโครงการ</h1>
                    <AdminProjectTable projects={projects} />
                </div>
            </div>
        </div>
    );
}
