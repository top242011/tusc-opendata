import Link from 'next/link';
import { ArrowLeft, Code2, Construction } from 'lucide-react';
import { PublicNavbar } from '@/components/public-navbar';

export default function OpenAPIPage() {
    return (
        <>
            <PublicNavbar />
            <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
                <div className="text-center px-4 max-w-lg">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                        <Construction className="w-10 h-10 text-amber-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 mb-4">
                        Open API
                    </h1>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                        หน้านี้กำลังอยู่ในระหว่างการพัฒนา เราจะเปิดให้ใช้งานเร็วๆ นี้
                    </p>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
                        <div className="flex items-start gap-3 text-left">
                            <Code2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-slate-600">
                                <p className="font-medium text-slate-800 mb-1">Open API สำหรับนักพัฒนา</p>
                                <p>
                                    เร็วๆ นี้ เราจะเปิดให้นักพัฒนาสามารถดึงข้อมูลงบประมาณไปใช้งานได้ผ่าน REST API
                                    เพื่อสร้างแอปพลิเคชันที่ช่วยเสริมความโปร่งใสให้กับชุมชนนักศึกษา
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>
                </div>
            </div>
        </>
    );
}
