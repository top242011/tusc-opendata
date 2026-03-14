'use client';

import { ImportWizard } from '@/components/admin/import-wizard/ImportWizard';
import { HelpCircle } from 'lucide-react';

export default function AdminImportPage() {
    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">นำเข้าข้อมูลโครงการ</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    ดาวน์โหลด template, กรอกข้อมูล, แล้วอัปโหลดเพื่อนำเข้าระบบ
                </p>
            </div>

            {/* Wizard Card */}
            <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-5 sm:p-6">
                <ImportWizard />
            </div>

            {/* Help Note */}
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-fill-tertiary))]">
                <HelpCircle className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[rgb(var(--ios-text-tertiary))] space-y-1">
                    <p>ขั้นตอน: ดาวน์โหลด template &rarr; กรอกข้อมูลใน Excel &rarr; อัปโหลด &rarr; ตรวจสอบ &rarr; ยืนยันนำเข้า</p>
                    <p>รองรับไฟล์ .xlsx, .xls, .csv สูงสุด 500 แถวต่อครั้ง</p>
                </div>
            </div>
        </div>
    );
}
