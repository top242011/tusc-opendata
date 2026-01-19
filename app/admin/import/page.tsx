'use client';

import { useState } from 'react';
import ImportWorkbench from '@/components/admin/import-workbench';
import AdminTutorial from '@/components/admin/admin-tutorial';
import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function AdminImportPage() {
    const [showTutorial, setShowTutorial] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Tutorial Modal */}
            <AdminTutorial forceShow={showTutorial} onClose={() => setShowTutorial(false)} />

            <div className="container mx-auto py-10 px-4">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Link href="/admin" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            กลับหน้าหลัก
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">นำเข้าข้อมูลโครงการ</h1>
                        <p className="text-slate-500 mt-2">
                            อัปโหลดไฟล์สรุป Excel หรือเลือกไฟล์ PDF เพื่อให้ระบบ AI ช่วยวิเคราะห์และจับคู่ข้อมูลอัตโนมัติ
                        </p>
                    </div>

                    {/* Help Button */}
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium self-start md:self-auto"
                    >
                        <HelpCircle className="w-5 h-5" />
                        วิธีใช้งาน
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <ImportWorkbench />
                </div>
            </div>
        </div>
    );
}
