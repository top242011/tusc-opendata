export interface HelpItem {
    title: string;
    content: string;
}

export const CONTEXTUAL_HELP: Record<string, HelpItem[]> = {
    '/admin': [
        { title: 'แดชบอร์ดคืออะไร?', content: 'หน้าภาพรวมของระบบ แสดงสถิติโครงการ งบประมาณ และกิจกรรมล่าสุดทั้งหมด' },
        { title: 'เริ่มใช้งานอย่างไร?', content: 'ใช้ปุ่ม "การดำเนินการด่วน" เพื่อนำเข้าข้อมูล จัดการโครงการ หรือดูเรื่องร้องเรียน' },
    ],
    '/admin/projects': [
        { title: 'ค้นหาโครงการ', content: 'พิมพ์ชื่อโครงการ องค์กร หรือชื่อผู้รับผิดชอบในช่องค้นหา แล้วใช้ตัวกรองเพื่อจำกัดผลลัพธ์' },
        { title: 'แก้ไขโครงการ', content: 'คลิกไอคอนดินสอเพื่อเข้าสู่หน้าแก้ไข ซึ่งมี 3 แท็บ: ข้อมูลพื้นฐาน, รายละเอียด, ไฟล์แนบ' },
    ],
    '/admin/organizations': [
        { title: 'องค์กรคืออะไร?', content: 'องค์กรคือ ชมรม สภา คณะกรรมการ หรือหน่วยงานที่ยื่นขอจัดโครงการ ระบบใช้เพื่อจัดกลุ่มโครงการ' },
        { title: 'ลบองค์กรไม่ได้?', content: 'ไม่สามารถลบองค์กรที่มีโครงการอ้างอิงอยู่ได้ ต้องลบหรือย้ายโครงการก่อน' },
    ],
    '/admin/import': [
        { title: 'วิธีนำเข้าข้อมูล', content: '1) ดาวน์โหลด template 2) กรอกข้อมูลตาม format 3) อัปโหลดไฟล์ 4) ตรวจสอบ preview 5) ยืนยัน' },
        { title: 'ข้อมูลผิดแก้ได้ไหม?', content: 'ได้! ในขั้นตอนตรวจสอบ คลิกที่แถวเพื่อแก้ไข inline ก่อนนำเข้าจริง หรือใช้ Undo ภายใน 24 ชม.' },
        { title: 'ไฟล์ใหญ่มากนำเข้าได้ไหม?', content: 'ระบบรองรับสูงสุด 500 แถวต่อครั้ง (ตั้งค่าได้) ขนาดไฟล์ไม่เกิน 10 MB' },
    ],
    '/admin/complaints': [
        { title: 'เรื่องร้องเรียนมาจากไหน?', content: 'ผู้ใช้สาธารณะสามารถแจ้งข้อมูลผิดปกติได้จากหน้ารายละเอียดโครงการ' },
        { title: 'ต้องทำอะไรกับเรื่องร้องเรียน?', content: 'ตรวจสอบข้อมูลตามที่แจ้ง แก้ไขถ้าจำเป็น แล้วเปลี่ยนสถานะเป็น "ดำเนินการแล้ว"' },
    ],
    '/admin/budget-categories': [
        { title: 'หมวดงบประมาณใช้ทำอะไร?', content: 'กำหนดรายการหมวดงบ อัตราสูงสุด และเงื่อนไข สำหรับใช้อ้างอิงในรายละเอียดงบประมาณโครงการ' },
    ],
    '/admin/settings': [
        { title: 'ปีงบประมาณ', content: 'ปีงบประมาณ (พ.ศ.) ที่ใช้เป็นค่าเริ่มต้นเมื่อสร้างโครงการหรือนำเข้าข้อมูลใหม่' },
    ],
};

export function getHelpForPage(pathname: string): HelpItem[] {
    // Exact match first, then prefix match
    if (CONTEXTUAL_HELP[pathname]) return CONTEXTUAL_HELP[pathname];

    const keys = Object.keys(CONTEXTUAL_HELP).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        if (pathname.startsWith(key)) return CONTEXTUAL_HELP[key];
    }

    return [];
}
