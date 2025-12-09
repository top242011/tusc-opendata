import { ShieldCheck } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20 px-4">
            <div className="container mx-auto max-w-6xl flex flex-col items-center text-center space-y-6">
                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20">
                    <ShieldCheck className="w-12 h-12 text-blue-200" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    ระบบตรวจสอบงบประมาณสภานักศึกษา
                </h1>

                <p className="text-xl md:text-2xl text-blue-100 max-w-3xl font-light">
                    เปิดเผย โปร่งใส ตรวจสอบได้ — เพื่อประโยชน์สูงสุดของนักศึกษา
                </p>

                <div className="pt-4 flex gap-4">
                    <div className="flex flex-col items-center bg-white/5 px-6 py-3 rounded-lg border border-white/10">
                        <span className="text-sm text-blue-200">ปีงบประมาณล่าสุด</span>
                        <span className="text-2xl font-bold">2568</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
