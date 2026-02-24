import Link from 'next/link';
import { PublicNavbar } from '@/components/public-navbar';
import {
    BarChart3, Database, Shield, Users,
    BookOpen, FileSearch, Globe, Heart,
    ArrowRight, CheckCircle2, Code2,
} from 'lucide-react';

export default function AboutPage() {
    const features = [
        {
            icon: Database,
            title: 'ข้อมูลเปิด (Open Data)',
            desc: 'เข้าถึงข้อมูลงบประมาณโครงการกิจกรรมนักศึกษาทุกโครงการ ไม่มีค่าใช้จ่าย ไม่ต้องสมัครสมาชิก',
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
        },
        {
            icon: Shield,
            title: 'โปร่งใส ตรวจสอบได้',
            desc: 'ข้อมูลทุกชิ้นมาจากแหล่งข้อมูลทางการของมหาวิทยาลัย สามารถตรวจสอบและอ้างอิงได้',
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
        },
        {
            icon: BarChart3,
            title: 'วิเคราะห์ข้อมูลได้ทันที',
            desc: 'Dashboard แบบ Real-time แสดงแนวโน้มงบประมาณ อัตราการอนุมัติ และสัดส่วนตามหน่วยงาน',
            color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400',
        },
        {
            icon: Users,
            title: 'เพื่อชุมชนธรรมศาสตร์',
            desc: 'สร้างขึ้นโดยนักศึกษา เพื่อนักศึกษา ประชาสังคม นักวิจัย และทุกคนที่สนใจความโปร่งใส',
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
        },
    ];

    const dataTypes = [
        {
            label: 'โครงการกิจกรรมนักศึกษา',
            desc: 'รายชื่อและรายละเอียดโครงการที่เสนอขอในแต่ละปีงบประมาณ',
        },
        {
            label: 'งบประมาณที่ขอ vs อนุมัติ',
            desc: 'เปรียบเทียบงบที่เสนอขอกับงบที่ได้รับอนุมัติจริงพร้อมอัตราการอนุมัติ',
        },
        {
            label: 'จำแนกตามหน่วยงาน/คณะ',
            desc: 'ข้อมูลสรุปแยกตามองค์กรนักศึกษาและวิทยาเขต (รังสิต / ท่าพระจันทร์ / ลำปาง / ส่วนกลาง)',
        },
        {
            label: 'สถานะการอนุมัติ',
            desc: 'อนุมัติเต็มจำนวน ตัดงบบางส่วน หรือไม่อนุมัติ พร้อมเหตุผลประกอบ',
        },
        {
            label: 'เอกสารประกอบโครงการ',
            desc: 'ไฟล์แนบและเอกสารที่เกี่ยวข้องกับแต่ละโครงการที่ได้รับการเผยแพร่',
        },
    ];

    const useCases = [
        'นักศึกษาที่อยากรู้ว่าโครงการประเภทไหนได้รับการอนุมัติ',
        'องค์กรนักศึกษาที่ต้องการเปรียบเทียบงบกับหน่วยงานอื่น',
        'นักวิจัยและอาจารย์ที่ศึกษาการจัดสรรงบประมาณในมหาวิทยาลัย',
        'ประชาชนและสื่อมวลชนที่ต้องการข้อมูลเพื่อความโปร่งใส',
        'นักพัฒนาที่ต้องการ Open Data สร้างแอปพลิเคชันใหม่',
    ];

    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] antialiased">
            <PublicNavbar />

            {/* Hero */}
            <section className="bg-[rgb(var(--ios-bg-secondary))] border-b border-[rgb(var(--ios-separator))]/40 py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] text-sm font-semibold mb-6">
                        <Globe className="w-4 h-4" />
                        TU Open Data Initiative
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                        ความโปร่งใส<br />
                        <span className="text-[rgb(var(--ios-accent))]">เริ่มต้นที่ข้อมูล</span>
                    </h1>
                    <p className="text-[rgb(var(--ios-text-secondary))] text-lg leading-relaxed max-w-2xl mx-auto">
                        TU Open Data คือแพลตฟอร์มเปิดเผยข้อมูลงบประมาณโครงการกิจกรรมนักศึกษา
                        มหาวิทยาลัยธรรมศาสตร์ เพื่อให้ทุกคนสามารถเข้าถึง ตรวจสอบ
                        และนำไปใช้งานได้อย่างอิสระ
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--ios-accent))] text-white font-bold rounded-[var(--ios-radius-md)] hover:opacity-90 transition-opacity shadow-sm"
                        >
                            ดูข้อมูลโครงการ <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/organizations"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-[rgb(var(--ios-separator))] bg-white dark:bg-slate-800 font-semibold rounded-[var(--ios-radius-md)] hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors"
                        >
                            ดูตามหน่วยงาน
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-5xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold text-center mb-2">ทำไมถึงต้องมี TU Open Data</h2>
                <p className="text-[rgb(var(--ios-text-secondary))] text-center text-sm mb-10">
                    เพราะข้อมูลงบประมาณเป็นสมบัติของทุกคนในมหาวิทยาลัย
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {features.map(f => (
                        <div
                            key={f.title}
                            className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)]"
                        >
                            <div className={`inline-flex p-3 rounded-[var(--ios-radius-md)] mb-4 ${f.color}`}>
                                <f.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                            <p className="text-[rgb(var(--ios-text-secondary))] text-sm leading-relaxed">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Data Available */}
            <section className="bg-[rgb(var(--ios-bg-secondary))] border-y border-[rgb(var(--ios-separator))]/40 py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">
                            ข้อมูลที่เปิดเผย
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-8">ข้อมูลที่ให้บริการ</h2>
                    <div className="space-y-3">
                        {dataTypes.map((d, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 p-4 bg-[rgb(var(--ios-bg-grouped))] rounded-[var(--ios-radius-md)] border border-[rgb(var(--ios-separator))]/40"
                            >
                                <div className="w-6 h-6 rounded-full bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{d.label}</p>
                                    <p className="text-[rgb(var(--ios-text-secondary))] text-sm mt-0.5">
                                        {d.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who uses it */}
            <section className="max-w-3xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold mb-2">ใครใช้ประโยชน์จาก TU Open Data ได้บ้าง</h2>
                <p className="text-[rgb(var(--ios-text-secondary))] text-sm mb-8">
                    ออกแบบมาเพื่อให้ทุกคนใช้ได้ ไม่ว่าจะมีความรู้ด้านเทคนิคหรือไม่
                </p>
                <div className="space-y-3">
                    {useCases.map((u, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[rgb(var(--ios-green))] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-[rgb(var(--ios-text-secondary))]">{u}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Data Source */}
            <section className="bg-[rgb(var(--ios-bg-secondary))] border-y border-[rgb(var(--ios-separator))]/40 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[rgb(var(--ios-bg-grouped))] rounded-[var(--ios-radius-xl)] border border-[rgb(var(--ios-separator))]/50 p-8 shadow-[var(--ios-shadow-sm)]">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[rgb(var(--ios-fill-tertiary))] rounded-[var(--ios-radius-md)] text-[rgb(var(--ios-text-secondary))] flex-shrink-0">
                                <FileSearch className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">แหล่งที่มาของข้อมูล</h3>
                                <p className="text-[rgb(var(--ios-text-secondary))] text-sm leading-relaxed mb-4">
                                    ข้อมูลทั้งหมดได้รับการจัดเก็บและตรวจสอบโดยกองแผนงาน มหาวิทยาลัยธรรมศาสตร์
                                    ก่อนนำมาเผยแพร่บนแพลตฟอร์มนี้ในรูปแบบ Open Data
                                    อัปเดตข้อมูลทุกปีงบประมาณ
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs font-semibold px-3 py-1.5 bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] rounded-full">
                                        กองแผนงาน มธ.
                                    </span>
                                    <span className="text-xs font-semibold px-3 py-1.5 bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] rounded-full">
                                        อัปเดตทุกปีงบประมาณ
                                    </span>
                                    <span className="text-xs font-semibold px-3 py-1.5 bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] rounded-full">
                                        Creative Commons CC BY
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <Heart className="w-8 h-8 text-[rgb(var(--ios-red))] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">ร่วมพัฒนาและส่งข้อเสนอแนะ</h2>
                    <p className="text-[rgb(var(--ios-text-secondary))] text-sm leading-relaxed max-w-xl mx-auto mb-8">
                        โครงการนี้พัฒนาโดยนักศึกษาธรรมศาสตร์ หากพบข้อผิดพลาดในข้อมูล
                        หรืออยากเสนอแนะฟีเจอร์ใหม่ ยินดีรับ Feedback จากทุกคนผ่านปุ่ม Feedback ใน Navbar
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/api-docs"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--ios-accent))] text-white font-bold rounded-[var(--ios-radius-md)] hover:opacity-90 transition-opacity text-sm"
                        >
                            <Code2 className="w-4 h-4" />
                            API สำหรับนักพัฒนา
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[rgb(var(--ios-separator))] bg-white dark:bg-slate-800 font-semibold rounded-[var(--ios-radius-md)] hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors text-sm"
                        >
                            กลับหน้าหลัก
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
