'use server';

import * as XLSX from 'xlsx';
import { IMPORT_TEMPLATE_COLUMNS } from './import-templates';

export async function generateImportTemplate(): Promise<Buffer> {
    const wb = XLSX.utils.book_new();

    // Header row with Thai labels
    const headers = IMPORT_TEMPLATE_COLUMNS.map(col => col.label);
    // Machine-readable keys (hidden row for auto-detection)
    const keys = IMPORT_TEMPLATE_COLUMNS.map(col => col.key);
    // Example row
    const examples = IMPORT_TEMPLATE_COLUMNS.map(col =>
        col.type === 'number' ? Number(col.example) : col.example
    );

    const data = [headers, keys, examples];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = IMPORT_TEMPLATE_COLUMNS.map(col => ({
        wch: Math.max(col.label.length * 2, 20),
    }));

    // Hide the machine-readable keys row (row 2)
    ws['!rows'] = [
        {},
        { hidden: true },
        {},
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลโครงการ');

    // Add instructions sheet
    const instructionData = [
        ['คำแนะนำการใช้งาน Template'],
        [''],
        ['1. กรอกข้อมูลในแผ่น "ข้อมูลโครงการ" โดยเริ่มจากแถวที่ 3 (แถว 1 คือหัวคอลัมน์)'],
        ['2. ห้ามแก้ไขหัวคอลัมน์ในแถวที่ 1'],
        ['3. ลบแถวตัวอย่าง (แถวที่ 3) ก่อนอัปโหลด หรือแก้ไขเป็นข้อมูลจริง'],
        [''],
        ['คอลัมน์ที่ต้องกรอก (บังคับ):'],
        ...IMPORT_TEMPLATE_COLUMNS
            .filter(col => col.required)
            .map(col => [`  - ${col.label}: ${col.description}`]),
        [''],
        ['คอลัมน์เพิ่มเติม (ไม่บังคับ):'],
        ...IMPORT_TEMPLATE_COLUMNS
            .filter(col => !col.required)
            .map(col => [`  - ${col.label}: ${col.description}`]),
        [''],
        ['หมายเหตุ:'],
        ['- คอลัมน์ตัวเลข ไม่ต้องใส่เครื่องหมายจุลภาค (,) หรือสัญลักษณ์สกุลเงิน (฿)'],
        ['- หากไม่ได้รับอนุมัติ ให้ใส่งบที่อนุมัติเป็น 0'],
        ['- สามารถนำเข้าได้สูงสุด 500 แถวต่อครั้ง'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionData);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'คำแนะนำ');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return Buffer.from(buf);
}
