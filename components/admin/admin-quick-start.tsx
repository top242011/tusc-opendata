"use client";

import { FileText, Calendar, Upload, Link as LinkIcon, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function AdminQuickStart() {
    const steps = [
        {
            icon: <Calendar className="w-6 h-6 text-blue-600" />,
            title: "1. ระบุข้อมูลตั้งต้น",
            desc: "เลือกปีงบประมาณและศูนย์/วิทยาเขตที่ต้องการนำเข้าข้อมูล"
        },
        {
            icon: <FileText className="w-6 h-6 text-orange-500" />,
            title: "2. อัปโหลดเอกสารโครงการ",
            desc: "ลากไฟล์ PDF โครงการทั้งหมดมาวาง (รองรับหลายไฟล์)"
        },
        {
            icon: <FileSpreadsheet className="w-6 h-6 text-green-600" />,
            title: "3. ไฟล์งบอนุมัติ (ถ้ามี)",
            desc: "อัปโหลด Excel/CSV ยอดอนุมัติจริง เพื่อจับคู่"
        },
        {
            icon: <LinkIcon className="w-6 h-6 text-purple-600" />,
            title: "4. ตรวจสอบ & จับคู่",
            desc: "ระบบ AI จะช่วยจับคู่เอกสารกับงบประมาณให้อัตโนมัติ"
        },
        {
            icon: <CheckCircle className="w-6 h-6 text-teal-600" />,
            title: "5. ยืนยันข้อมูล",
            desc: "ตรวจสอบความถูกต้องครั้งสุดท้ายและบันทึกลงระบบ"
        },
    ];

    return (
        <Card className="mb-8 overflow-hidden border-none shadow-md bg-white">
            <div className="bg-slate-50 border-b px-6 py-4">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">i</span>
                    ขั้นตอนการนำเข้าข้อมูล
                </h2>
            </div>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {steps.map((step, i) => (
                        <div key={i} className="p-6 hover:bg-slate-50 transition-colors group">
                            <div className="mb-3 p-3 bg-slate-50 rounded-lg w-fit group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                {step.icon}
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2 text-sm">{step.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
