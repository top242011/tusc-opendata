import Link from 'next/link';
import { PublicNavbar } from '@/components/public-navbar';
import { Code2, Database, Download, Table2, Key, FileText, ArrowRight, Terminal, Info, Zap, BarChart3, Building2, FolderOpen } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';
import { Code2, Database, Download, Table2, Key, FileText, ArrowRight, Terminal, Info } from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://<your-project>.supabase.co';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.com';

function CodeBlock({ title, lang, code }: { title: string; lang: string; code: string }) {
    return (
        <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
            <div className="px-5 py-3 border-b border-[rgb(var(--ios-separator))]/50 flex items-center justify-between">
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-[rgb(var(--ios-fill-tertiary))] rounded text-[rgb(var(--ios-text-tertiary))]">
                    {lang}
                </span>
            </div>
            <pre className="p-5 text-sm overflow-x-auto bg-slate-950 text-emerald-300 font-mono leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function EndpointCard({
    method,
    path,
    description,
    params,
    exampleResponse,
}: {
    method: string;
    path: string;
    description: string;
    params?: { name: string; type: string; desc: string }[];
    exampleResponse: string;
}) {
    return (
        <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
            <div className="px-5 py-4 border-b border-[rgb(var(--ios-separator))]/50">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        {method}
                    </span>
                    <code className="font-mono text-sm text-[rgb(var(--ios-accent))]">{path}</code>
                </div>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">{description}</p>
            </div>
            {params && params.length > 0 && (
                <div className="px-5 py-3 border-b border-[rgb(var(--ios-separator))]/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-2">Query Parameters</p>
                    <div className="space-y-1.5">
                        {params.map((p) => (
                            <div key={p.name} className="flex items-start gap-2 text-xs">
                                <code className="font-mono text-[rgb(var(--ios-accent))] bg-[rgb(var(--ios-fill-tertiary))] px-1.5 py-0.5 rounded flex-shrink-0">
                                    {p.name}
                                </code>
                                <span className="text-[rgb(var(--ios-text-tertiary))] font-mono flex-shrink-0">{p.type}</span>
                                <span className="text-[rgb(var(--ios-text-secondary))]">{p.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-2">Example Response</p>
                <pre className="p-4 text-xs overflow-x-auto bg-slate-950 text-emerald-300 font-mono leading-relaxed rounded-[var(--ios-radius-md)]">
                    <code>{exampleResponse}</code>
                </pre>
            </div>
        </div>
    );
}

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

    const v1Endpoints = [
        {
            method: 'GET',
            path: '/api/v1/projects',
            description: 'ดึงรายการโครงการทั้งหมดที่เผยแพร่แล้ว รองรับ pagination, ค้นหา, และกรองข้อมูล',
            params: [
                { name: 'fiscal_year', type: 'integer', desc: 'กรองตามปีงบประมาณ เช่น 2567' },
                { name: 'campus', type: 'string', desc: 'กรองตามวิทยาเขต: rangsit, thaprachan, lampang, central' },
                { name: 'organization', type: 'string', desc: 'ค้นหาตามชื่อหน่วยงาน (fuzzy match)' },
                { name: 'status', type: 'string', desc: 'กรองตามสถานะ: อนุมัติ, ตัดงบ, ไม่อนุมัติ, รอพิจารณา' },
                { name: 'q', type: 'string', desc: 'ค้นหาคำใน ชื่อโครงการ, หน่วยงาน, ผู้รับผิดชอบ' },
                { name: 'limit', type: 'integer', desc: 'จำนวนผลลัพธ์ต่อหน้า (ค่าเริ่มต้น: 50, สูงสุด: 500)' },
                { name: 'offset', type: 'integer', desc: 'ข้ามผลลัพธ์ N รายการแรก สำหรับ pagination' },
            ],
            exampleResponse: `{
  "data": [
    {
      "id": 42,
      "project_name": "โครงการพัฒนาระบบสารสนเทศ",
      "organization": "คณะวิศวกรรมศาสตร์",
      "fiscal_year": 2567,
      "budget_requested": 150000,
      "budget_approved": 120000,
      "status": "อนุมัติ",
      "campus": "rangsit",
      ...
    }
  ],
  "meta": {
    "total": 245,
    "limit": 50,
    "offset": 0,
    "fiscal_year": 2567
  }
}`,
        },
        {
            method: 'GET',
            path: '/api/v1/projects/:id',
            description: 'ดึงข้อมูลโครงการเดี่ยวพร้อมไฟล์แนบ',
            params: [],
            exampleResponse: `{
  "data": {
    "id": 42,
    "project_name": "โครงการพัฒนาระบบสารสนเทศ",
    "organization": "คณะวิศวกรรมศาสตร์",
    "fiscal_year": 2567,
    "budget_requested": 150000,
    "budget_approved": 120000,
    "status": "อนุมัติ",
    "campus": "rangsit",
    ...
    "files": [
      {
        "id": 1,
        "file_name": "proposal.pdf",
        "file_url": "https://...",
        "file_type": "application/pdf",
        "uploaded_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}`,
        },
        {
            method: 'GET',
            path: '/api/v1/stats',
            description: 'สถิติรวมของโครงการ แยกตามวิทยาเขต สถานะ และหน่วยงาน Top 10',
            params: [
                { name: 'fiscal_year', type: 'integer', desc: 'กรองตามปีงบประมาณ เช่น 2567' },
            ],
            exampleResponse: `{
  "data": {
    "total_projects": 245,
    "total_requested": 52000000,
    "total_approved": 38500000,
    "approval_rate": 74.04,
    "by_campus": [
      { "campus": "rangsit", "total_projects": 120, "total_requested": 28000000, "total_approved": 21000000 }
    ],
    "by_status": [
      { "status": "อนุมัติ", "count": 180 },
      { "status": "ตัดงบ", "count": 30 }
    ],
    "top_organizations": [
      { "organization": "คณะแพทยศาสตร์", "total_projects": 25, "total_requested": 8000000, "total_approved": 6500000 }
    ]
  },
  "meta": { "fiscal_year": 2567 }
}`,
        },
        {
            method: 'GET',
            path: '/api/v1/organizations',
            description: 'รายการหน่วยงานพร้อมสถิติงบประมาณ',
            params: [
                { name: 'campus', type: 'string', desc: 'กรองตามวิทยาเขต' },
            ],
            exampleResponse: `{
  "data": [
    {
      "name": "คณะแพทยศาสตร์",
      "total_projects": 25,
      "total_requested": 8000000,
      "total_approved": 6500000,
      "approval_rate": 81.25
    }
  ],
  "meta": { "total": 42, "campus": null }
}`,
        },
    ];

    const v1CurlExamples = [
        {
            title: 'ดึงโครงการพร้อมกรองปีงบประมาณ',
            lang: 'bash',
            code: `curl "${BASE_URL}/api/v1/projects?fiscal_year=2567&limit=20"`,
        },
        {
            title: 'ค้นหาโครงการด้วยคำค้น',
            lang: 'bash',
            code: `curl "${BASE_URL}/api/v1/projects?q=วิจัย&campus=rangsit"`,
        },
        {
            title: 'ดึงโครงการเดี่ยวพร้อมไฟล์แนบ',
            lang: 'bash',
            code: `curl "${BASE_URL}/api/v1/projects/42"`,
        },
        {
            title: 'ดูสถิติรวม',
            lang: 'bash',
            code: `curl "${BASE_URL}/api/v1/stats?fiscal_year=2567"`,
        },
        {
            title: 'ใช้งานด้วย JavaScript (fetch)',
            lang: 'js',
            code: `// ดึงรายการโครงการ
const res = await fetch('${BASE_URL}/api/v1/projects?fiscal_year=2567&limit=20');
const { data, meta } = await res.json();

console.log(\`Total: \${meta.total} projects\`);
data.forEach(p => console.log(p.project_name, p.budget_approved));

// ดึงสถิติ
const statsRes = await fetch('${BASE_URL}/api/v1/stats?fiscal_year=2567');
const { data: stats } = await statsRes.json();
console.log(\`Approval rate: \${stats.approval_rate}%\`);`,
        },
    ];

    return (
        <main id="main-content" className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] antialiased pb-20">
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
                        เข้าถึงข้อมูลงบประมาณโครงการผ่าน REST API ใช้ได้ทันทีไม่ต้องใช้ API Key
                        หรือเชื่อมต่อ Supabase REST API โดยตรงสำหรับการ query ขั้นสูง
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

                {/* ==================== V1 REST API ==================== */}
                <div className="space-y-12">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Public REST API v1</h2>
                            <p className="text-sm text-[rgb(var(--ios-text-secondary))]">ใช้ได้ทันที ไม่ต้องใช้ API Key</p>
                        </div>
                    </div>

                    {/* V1 Notice */}
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--ios-radius-lg)]">
                        <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                                ง่ายกว่า Supabase REST API
                            </p>
                            <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                Public API v1 ไม่ต้องใช้ API Key เรียกใช้ได้ทันทีด้วย <code className="font-mono bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded">fetch()</code> หรือ <code className="font-mono bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded">curl</code> ตรง ๆ
                                รองรับ CORS สำหรับเรียกจาก browser และมี cache 5 นาที
                            </p>
                        </div>
                    </div>

                    {/* V1 Base URL */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                            <h3 className="text-xl font-bold">Base URL</h3>
                        </div>
                        <div className="bg-slate-900 rounded-[var(--ios-radius-lg)] p-5 font-mono text-sm overflow-x-auto">
                            <div className="flex items-center gap-1.5 mb-3 border-b border-slate-800 pb-3">
                                <div className="size-3 rounded-full bg-red-500"></div>
                                <div className="size-3 rounded-full bg-yellow-500"></div>
                                <div className="size-3 rounded-full bg-green-500"></div>
                                <span className="ml-2 text-slate-500 text-xs tracking-widest font-sans">REST API v1</span>
                            </div>
                            <p className="text-slate-400">
                                <span className="text-slate-500"># Endpoint (ไม่ต้องใช้ API Key)</span>
                            </p>
                            <p className="text-emerald-400 mt-1">{BASE_URL}/api/v1/</p>
                            <p className="text-slate-400 mt-3">
                                <span className="text-slate-500"># ตัวอย่าง</span>
                            </p>
                            <p className="text-sky-300 mt-1">GET /api/v1/projects?fiscal_year=2567&amp;limit=20</p>
                            <p className="text-sky-300">GET /api/v1/projects/42</p>
                            <p className="text-sky-300">GET /api/v1/stats?fiscal_year=2567</p>
                            <p className="text-sky-300">GET /api/v1/organizations?campus=rangsit</p>
                        </div>
                    </section>

                    {/* V1 Endpoints */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <FolderOpen className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                            <h3 className="text-xl font-bold">Endpoints</h3>
                        </div>
                        <div className="space-y-6">
                            {v1Endpoints.map((ep, i) => (
                                <EndpointCard key={i} {...ep} />
                            ))}
                        </div>
                    </section>

                    {/* V1 Code Examples */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Code2 className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                            <h3 className="text-xl font-bold">ตัวอย่างการใช้งาน</h3>
                        </div>
                        <div className="space-y-6">
                            {v1CurlExamples.map((ex, i) => (
                                <CodeBlock key={i} {...ex} />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Divider */}
                <div className="border-t border-[rgb(var(--ios-separator))]/50 pt-4">
                    <p className="text-center text-sm text-[rgb(var(--ios-text-tertiary))]">
                        ต้องการ query ขั้นสูง? ใช้ Supabase REST API โดยตรง
                    </p>
                </div>

                {/* ==================== Supabase REST API ==================== */}
                <div className="space-y-12">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30">
                            <Database className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Supabase REST API</h2>
                            <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Query ขั้นสูง ต้องใช้ Anon Key</p>
                        </div>
                    </div>

                    {/* Supabase Notice */}
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

                    {/* Supabase Base URL */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                            <h3 className="text-xl font-bold">Base URL</h3>
                        </div>
                        <div className="bg-slate-900 rounded-[var(--ios-radius-lg)] p-5 font-mono text-sm overflow-x-auto">
                            <div className="flex items-center gap-1.5 mb-3 border-b border-slate-800 pb-3">
                                <div className="size-3 rounded-full bg-red-500"></div>
                                <div className="size-3 rounded-full bg-yellow-500"></div>
                                <div className="size-3 rounded-full bg-green-500"></div>
                                <span className="ml-2 text-slate-500 text-xs tracking-widest font-sans">Supabase REST</span>
                    <div className="space-y-6">
                        {restExamples.map((ex, i) => (
                            <div key={i} className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
                                <div className="px-5 py-3 border-b border-[rgb(var(--ios-separator))]/50 flex items-center justify-between">
                                    <span className="text-sm font-semibold">{ex.title}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono px-2 py-0.5 bg-[rgb(var(--ios-fill-tertiary))] rounded text-[rgb(var(--ios-text-tertiary))]">
                                            {ex.lang}
                                        </span>
                                        <CopyButton text={ex.code} />
                                    </div>
                                </div>
                                <pre className="p-5 text-sm overflow-x-auto bg-slate-950 text-emerald-300 font-mono leading-relaxed">
                                    <code>{ex.code}</code>
                                </pre>
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

                    {/* Supabase Code Examples */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Code2 className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                            <h3 className="text-xl font-bold">ตัวอย่างการใช้งาน</h3>
                        </div>
                        <div className="space-y-6">
                            {restExamples.map((ex, i) => (
                                <CodeBlock key={i} {...ex} />
                            ))}
                        </div>
                    </section>

                    {/* Query Parameters */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Key className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                            <h3 className="text-xl font-bold">Query Parameters ที่ใช้บ่อย</h3>
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
                </div>

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

                {/* Direct download */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Download className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        <h2 className="text-xl font-bold">ดาวน์โหลดข้อมูล CSV</h2>
                    </div>
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)]">
                        <p className="text-[rgb(var(--ios-text-secondary))] text-sm leading-relaxed mb-4">
                            ไม่อยากเรียก API? สามารถดาวน์โหลดข้อมูลทั้งหมดเป็นไฟล์ CSV ได้โดยตรงจากหน้า Dashboard
                            โดยกดปุ่ม <strong>&quot;ส่งออกข้อมูล&quot;</strong> ที่มุมขวาบน
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
