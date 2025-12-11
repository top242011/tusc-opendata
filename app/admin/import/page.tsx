import ImportWorkbench from '@/components/admin/import-workbench';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminImportPage() {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <Link href="/admin" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">ศูนย์ข้อมูลรวม</h1>
                    <p className="text-slate-500 mt-2">
                        จัดการการนำเข้าข้อมูลโครงการ อัปโหลดไฟล์สรุป Excel และเอกสาร PDF ที่นี่
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <ImportWorkbench />
                </div>
            </div>
        </div>
    );
}
