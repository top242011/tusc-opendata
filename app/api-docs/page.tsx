import Link from 'next/link';
import { PublicNavbar } from '@/components/public-navbar';
import { Code2, Database, Download, Table2, Key, FileText, ArrowRight, Terminal, Info } from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://<your-project>.supabase.co';

export default function ApiDocsPage() {
    const schemaFields = [
        { name: 'id', type: 'integer', desc: 'รหัสโครงการ (Primary Key)' },
        { name: 'project_name', type: 'text', desc: 'ชื่อโครงการ' },
        { name: 'organization', type: 'text', desc: 'ชื่อหน่วยงาน / คณะ' },
        { name: 'fiscal_year', type: 'integer', desc: 'ปีงบประมาณ (พ.ศ.)' },
        { name: 'budget_requested', type: 'numeric', desc: 'งบประมาณที่ขอ (บาท)' },
        { name: 'budget_approved', type: 'numeric', desc: 'งบประมาณที่อนุมัติ (บาท)' },
        { name: 'status', type: 'text', desc: '"อนุมัติ" | "ตัดงบ" | "ไม่อนุมัติ" | "รอพิจารณา"' },
        { name: 'campus', type: 'text', desc: '"rangsit" | "thaprachan" | "lampang" | "central"' },
        { name: 'responsible_person', type: 'text', desc: 'ชื่อผู้รับผิดชอบโครงการ' },
        { name: 'activity_type', type: 'text', desc: 'ประเภทกิจกรรม' },
        { name: 'objectives', type: 'text[]', desc: 'วัตถุประสงค์ของโครงการ (array)' },
        { name: 'sdg_goals', type: 'text[]', desc: 'เป้าหมาย SDG ที่เกี่ยวข้อง (array)' },
        { name: 'is_published', type: 'boolean', desc: 'เผยแพร่แล้วหรือยัง' },
        { name: 'created_at', type: 'timestamptz', desc: 'วันที่สร้างระเบียน' },
    ];

    const restExamples = [
        {
            title: 'ดึงโครงการทั้งหมด',
            lang: 'bash',
            code: `curl "${SUPABASE_URL}/rest/v1/projects?is_published=eq.true&select=*" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Content-Type: application/json"`,
        },
        {
            title: 'กรองตามปีงบประมาณ',
            lang: 'bash',
            code: `curl "${SUPABASE_URL}/rest/v1/projects?fiscal_year=eq.2567&select=id,project_name,budget_approved,status" \\
  -H "apikey: YOUR_ANON_KEY"`,
        },
        {
            title: 'กรองตามหน่วยงาน + เรียงตามงบ',
            lang: 'bash',
            code: `curl "${SUPABASE_URL}/rest/v1/projects?organization=eq.คณะแพทยศาสตร์&order=budget_approved.desc&select=*" \\
  -H "apikey: YOUR_ANON_KEY"`,
        },
        {
            title: 'ใช้งานด้วย JavaScript (Supabase Client)',
            lang: 'js',
            code: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, ANON_KEY)

const { data, error } = await supabase
  .from('projects')
  .select('id, project_name, organization, budget_requested, budget_approved, status')
  .eq('is_published', true)
  .eq('fiscal_year', 2567)
  .order('budget_approved', { ascending: false })`,
        },
    ];

    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] antialiased pb-20">
            <PublicNavbar />

            {/* Hero */}
            <section className="bg-[rgb(var(--ios-bg-secondary))] border-b border-[rgb(var(--ios-separator))]/40 py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] text-sm font-semibold mb-6">
                        <Code2 className="w-4 h-4" />
                        Open Data API
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-4">
                        API สำหรับนักพัฒนา
                    </h1>
                    <p className="text-[rgb(var(--ios-text-secondary))] text-base leading-relaxed max-w-2xl">
                        เข้าถึงข้อมูลงบประมาณโครงการผ่าน Supabase REST API โดยตรง
                        รองรับการกรอง เรียงลำดับ และดึงเฉพาะ field ที่ต้องการ
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

                {/* Notice */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[var(--ios-radius-lg)]">
                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                            ข้อมูล API Key
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                            ขณะนี้ข้อมูลสาธารณะใช้งานได้โดยใช้ <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">ANON KEY</code> ของโปรเจกต์
                            ซึ่งเปิดเผยได้ตามธรรมชาติของ Supabase Public Key
                            หากต้องการ key เพื่อการใช้งานหรือมีข้อสงสัย ติดต่อได้ผ่าน Feedback
                        </p>
                    </div>
                </div>

                {/* Base URL */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Terminal className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        <h2 className="text-xl font-bold">Base URL</h2>
                    </div>
                    <div className="bg-slate-900 rounded-[var(--ios-radius-lg)] p-5 font-mono text-sm overflow-x-auto">
                        <div className="flex items-center gap-1.5 mb-3 border-b border-slate-800 pb-3">
                            <div className="size-3 rounded-full bg-red-500"></div>
                            <div className="size-3 rounded-full bg-yellow-500"></div>
                            <div className="size-3 rounded-full bg-green-500"></div>
                            <span className="ml-2 text-slate-500 text-xs tracking-widest font-sans">REST</span>
                        </div>
                        <p className="text-slate-400">
                            <span className="text-slate-500"># Endpoint</span>
                        </p>
                        <p className="text-emerald-400 mt-1">{SUPABASE_URL}/rest/v1/</p>
                        <p className="text-slate-400 mt-3">
                            <span className="text-slate-500"># Headers ที่ต้องใส่ทุก Request</span>
                        </p>
                        <p className="text-sky-300 mt-1">apikey: YOUR_ANON_KEY</p>
                        <p className="text-sky-300">Content-Type: application/json</p>
                    </div>
                </section>

                {/* Code Examples */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Code2 className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        <h2 className="text-xl font-bold">ตัวอย่างการใช้งาน</h2>
                    </div>
                    <div className="space-y-6">
                        {restExamples.map((ex, i) => (
                            <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
                                <div className="px-5 py-3 border-b border-[rgb(var(--ios-separator))]/50 flex items-center justify-between">
                                    <span className="text-sm font-semibold">{ex.title}</span>
                                    <span className="text-xs font-mono px-2 py-0.5 bg-[rgb(var(--ios-fill-tertiary))] rounded text-[rgb(var(--ios-text-tertiary))]">
                                        {ex.lang}
                                    </span>
                                </div>
                                <pre className="p-5 text-sm overflow-x-auto bg-slate-950 text-emerald-300 font-mono leading-relaxed">
                                    <code>{ex.code}</code>
                                </pre>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Schema */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Table2 className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        <h2 className="text-xl font-bold">Schema: ตาราง <code className="font-mono text-[rgb(var(--ios-accent))] text-lg">projects</code></h2>
                    </div>
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-[rgb(var(--ios-fill-tertiary))] border-b border-[rgb(var(--ios-separator))]/50">
                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Field</th>
                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">คำอธิบาย</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgb(var(--ios-separator))]/30">
                                    {schemaFields.map(f => (
                                        <tr key={f.name} className="hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <code className="font-mono text-[rgb(var(--ios-accent))] text-xs">
                                                    {f.name}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-[rgb(var(--ios-fill-tertiary))] px-2 py-0.5 rounded">
                                                    {f.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[rgb(var(--ios-text-secondary))] text-xs">
                                                {f.desc}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-3 px-1">
                        * ดู schema เพิ่มเติมได้ใน <code className="font-mono">project_files</code> (เอกสารแนบ)
                    </p>
                </section>

                {/* Query Parameters */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        <h2 className="text-xl font-bold">Query Parameters ที่ใช้บ่อย</h2>
                    </div>
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-[rgb(var(--ios-fill-tertiary))] border-b border-[rgb(var(--ios-separator))]/50">
                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Parameter</th>
                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">ตัวอย่าง</th>
                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">ความหมาย</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgb(var(--ios-separator))]/30 font-mono text-xs">
                                    {[
                                        ['select', 'select=id,project_name,status', 'เลือก field ที่ต้องการ'],
                                        ['eq', 'fiscal_year=eq.2567', 'กรองค่าที่เท่ากัน'],
                                        ['gte / lte', 'budget_approved=gte.100000', 'มากกว่า / น้อยกว่า'],
                                        ['order', 'order=budget_approved.desc', 'เรียงลำดับ'],
                                        ['limit', 'limit=20', 'จำกัดจำนวนผลลัพธ์'],
                                        ['offset', 'offset=40', 'ข้ามผลลัพธ์ N รายการแรก (pagination)'],
                                        ['like', 'project_name=like.*วิจัย*', 'ค้นหาแบบ fuzzy'],
                                    ].map(([param, example, desc]) => (
                                        <tr key={param} className="hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <code className="text-[rgb(var(--ios-accent))]">{param}</code>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                <code>{example}</code>
                                            </td>
                                            <td className="px-4 py-3 text-[rgb(var(--ios-text-secondary))] font-sans">
                                                {desc}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Direct download */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Download className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        <h2 className="text-xl font-bold">ดาวน์โหลดข้อมูล CSV</h2>
                    </div>
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)]">
                        <p className="text-[rgb(var(--ios-text-secondary))] text-sm leading-relaxed mb-4">
                            ไม่อยากเรียก API? สามารถดาวน์โหลดข้อมูลทั้งหมดเป็นไฟล์ CSV ได้โดยตรงจากหน้า Dashboard
                            โดยกดปุ่ม <strong>"ส่งออกข้อมูล"</strong> ที่มุมขวาบน
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--ios-accent))] text-white font-bold rounded-[var(--ios-radius-md)] hover:opacity-90 transition-opacity text-sm"
                        >
                            <Download className="w-4 h-4" />
                            ไปที่ Dashboard <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

                {/* Resources */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        <h2 className="text-xl font-bold">แหล่งข้อมูลเพิ่มเติม</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                title: 'Supabase REST API Docs',
                                desc: 'เอกสาร Supabase ฉบับทางการ สำหรับ filtering, sorting, และ pagination',
                                href: 'https://supabase.com/docs/guides/api',
                            },
                            {
                                title: 'PostgREST Reference',
                                desc: 'ไวยากรณ์ query operators ที่ Supabase REST API ใช้',
                                href: 'https://postgrest.org/en/stable/references/api/tables_views.html',
                            },
                            {
                                title: 'Supabase JavaScript Client',
                                desc: 'Library อย่างเป็นทางการสำหรับใช้งาน Supabase ใน JavaScript/TypeScript',
                                href: 'https://supabase.com/docs/reference/javascript/introduction',
                            },
                        ].map(r => (
                            <a
                                key={r.title}
                                href={r.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 shadow-[var(--ios-shadow-sm)] hover:border-[rgb(var(--ios-accent))]/50 hover:shadow-[var(--ios-shadow-md)] transition-all group"
                            >
                                <p className="font-semibold text-sm group-hover:text-[rgb(var(--ios-accent))] transition-colors mb-2">
                                    {r.title} ↗
                                </p>
                                <p className="text-[rgb(var(--ios-text-secondary))] text-xs leading-relaxed">
                                    {r.desc}
                                </p>
                            </a>
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
}
