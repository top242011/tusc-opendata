// Import Template Column Definitions
// กำหนด schema มาตรฐานสำหรับ template การนำเข้าข้อมูล

export interface TemplateColumn {
    key: string;
    label: string;
    required: boolean;
    type: 'text' | 'number';
    description: string;
    example: string;
}

export const IMPORT_TEMPLATE_COLUMNS: TemplateColumn[] = [
    {
        key: 'organization',
        label: 'ชื่อองค์กร/ชมรม',
        required: true,
        type: 'text',
        description: 'ชื่อเต็มขององค์กรหรือชมรม',
        example: 'ชมรมรักษ์สิ่งแวดล้อม',
    },
    {
        key: 'project_name',
        label: 'ชื่อโครงการ',
        required: true,
        type: 'text',
        description: 'ชื่อโครงการที่ขอสนับสนุนงบ',
        example: 'โครงการปลูกป่าชายเลน ประจำปี 2568',
    },
    {
        key: 'budget_requested',
        label: 'งบที่เสนอขอ (บาท)',
        required: true,
        type: 'number',
        description: 'จำนวนเงินที่เสนอขอ (ตัวเลข ไม่ต้องใส่เครื่องหมายจุลภาค)',
        example: '50000',
    },
    {
        key: 'budget_approved',
        label: 'งบที่อนุมัติ (บาท)',
        required: true,
        type: 'number',
        description: 'จำนวนเงินที่ได้รับอนุมัติ (ใส่ 0 หากไม่อนุมัติ)',
        example: '45000',
    },
    {
        key: 'budget_average',
        label: 'งบเฉลี่ย (บาท)',
        required: false,
        type: 'number',
        description: 'งบเฉลี่ย (ไม่บังคับ)',
        example: '47500',
    },
    {
        key: 'notes',
        label: 'หมายเหตุ',
        required: false,
        type: 'text',
        description: 'หมายเหตุเพิ่มเติม (ไม่บังคับ)',
        example: 'อนุมัติตามเสนอ',
    },
];

// Thai aliases for fuzzy header matching
export const HEADER_ALIASES: Record<string, string[]> = {
    organization: [
        'ชื่อองค์กร', 'องค์กร', 'ชมรม', 'หน่วยงาน', 'ชื่อชมรม',
        'ชื่อองค์กร/ชมรม', 'org', 'organization', 'club',
    ],
    project_name: [
        'ชื่อโครงการ', 'โครงการ', 'ชื่อกิจกรรม', 'กิจกรรม',
        'project', 'project_name', 'name',
    ],
    budget_requested: [
        'งบที่เสนอขอ', 'งบเสนอขอ', 'เสนอขอ', 'งบประมาณที่เสนอ',
        'งบขอ', 'budget_requested', 'requested', 'งบที่เสนอขอ (บาท)',
    ],
    budget_approved: [
        'งบที่อนุมัติ', 'งบอนุมัติ', 'อนุมัติ', 'งบประมาณที่อนุมัติ',
        'budget_approved', 'approved', 'งบที่อนุมัติ (บาท)',
    ],
    budget_average: [
        'งบเฉลี่ย', 'เฉลี่ย', 'งบเฉลี่ย (บาท)',
        'budget_average', 'average',
    ],
    notes: [
        'หมายเหตุ', 'notes', 'note', 'remark', 'remarks', 'เหตุผล',
    ],
};
