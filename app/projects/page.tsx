"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PublicNavbar } from "@/components/public-navbar";
import { formatTHB } from "@/lib/utils";
import { Project } from "@/lib/types";
import { Search, SlidersHorizontal, Eye, Download, Code2 } from "lucide-react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['อนุมัติเต็มจำนวน', 'ตัดงบบางส่วน']);
    const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
    const [orgSearchTerm, setOrgSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        async function fetchProjects() {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('budget_requested', { ascending: false });

            if (data) {
                setProjects(data as Project[]);
            }
            setLoading(false);
        }
        fetchProjects();
    }, [supabase]);

    const uniqueOrgs = Array.from(new Set(projects.map(p => p.organization))).sort();
    const filteredOrgsList = uniqueOrgs.filter(org => org.toLowerCase().includes(orgSearchTerm.toLowerCase()));

    // Filtering projects
    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.organization.toLowerCase().includes(searchTerm.toLowerCase());

        let statusCategory = "ไม่อนุมัติ";
        if (p.status === "อนุมัติ" || p.budget_approved === p.budget_requested) {
            statusCategory = "อนุมัติเต็มจำนวน";
        } else if (p.budget_approved > 0) {
            statusCategory = "ตัดงบบางส่วน";
        }

        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(statusCategory);
        const matchesOrg = selectedOrgs.length === 0 || selectedOrgs.includes(p.organization);

        return matchesSearch && matchesStatus && matchesOrg;
    });

    return (
        <main className="bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] flex flex-col min-h-screen font-sans antialiased">
            <PublicNavbar />

            {/* Hero Search Section */}
            <section className="bg-[rgb(var(--ios-bg-secondary))] border-b border-[rgb(var(--ios-separator))]/40 px-4 py-12 md:px-10 shadow-[var(--ios-shadow-sm)]">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">ค้นหาข้อมูลโครงการ</h1>
                    <p className="text-[rgb(var(--ios-text-secondary))] max-w-2xl text-sm md:text-base">
                        เข้าถึง ค้นหา และวิเคราะห์ข้อมูลโครงการต่างๆ ของมหาวิทยาลัยธรรมศาสตร์ เพื่อความโปร่งใสและนำไปพัฒนาย่อยยอด
                    </p>
                    <div className="w-full max-w-2xl relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-[rgb(var(--ios-text-tertiary))]" />
                        </div>
                        <input
                            className="block w-full pl-12 pr-24 py-4 bg-white dark:bg-slate-800 border-2 border-[rgb(var(--ios-separator))]/40 rounded-[var(--ios-radius-lg)] text-[rgb(var(--ios-text-primary))] placeholder-[rgb(var(--ios-text-tertiary))] focus:outline-none focus:border-[rgb(var(--ios-accent))] focus:ring-4 focus:ring-[rgb(var(--ios-accent))]/10 transition-all font-sans"
                            placeholder="ค้นหาชื่อโครงการ (เช่น อุปกรณ์การแพทย์, วิจัย 2567)..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute inset-y-2 right-2 px-6 bg-[rgb(var(--ios-accent))] hover:opacity-90 text-white rounded-[var(--ios-radius-md)] font-medium transition-colors shadow-[var(--ios-shadow-sm)] ios-press">
                            ค้นหา
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 items-center mt-4">
                        <span className="text-sm text-[rgb(var(--ios-text-secondary))] font-medium mr-2">ค้นหายอดนิยม:</span>
                        {["จัดซื้ออุปกรณ์", "ทุนวิจัย", "ก่อสร้างอาคาร", "ความยั่งยืน (SDG)"].map((tag) => (
                            <button key={tag} className="px-3 py-1.5 rounded-full bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] text-xs font-medium hover:bg-[rgb(var(--ios-accent))]/10 hover:text-[rgb(var(--ios-accent))] transition-colors cursor-not-allowed opacity-70">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content Layout */}
            <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-10 py-8 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 bg-[rgb(var(--ios-bg-secondary))] p-5 rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] h-fit lg:sticky lg:top-24">
                    <div className="flex items-center justify-between mb-2 lg:mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5" /> ตัวกรอง
                        </h2>
                        <button onClick={() => { setSelectedStatuses([]); setSelectedOrgs([]); setSearchTerm(""); setOrgSearchTerm(""); }} className="text-[rgb(var(--ios-accent))] text-xs font-medium hover:underline">ล้างทั้งหมด</button>
                    </div>

                    <hr className="border-[rgb(var(--ios-separator))]/50 hidden lg:block" />

                    {/* Status Filter */}
                    <div className="space-y-3 hidden lg:block">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">สถานะโครงการ</h3>
                        <div className="space-y-2">
                            {['อนุมัติเต็มจำนวน', 'ตัดงบบางส่วน', 'ไม่อนุมัติ'].map((status) => (
                                <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedStatuses.includes(status)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedStatuses(prev => [...prev, status]);
                                            else setSelectedStatuses(prev => prev.filter(s => s !== status));
                                        }}
                                        className="size-4 rounded border-[rgb(var(--ios-separator))] text-[rgb(var(--ios-accent))] focus:ring-[rgb(var(--ios-accent))] bg-white dark:bg-slate-800"
                                    />
                                    <span className="text-sm text-[rgb(var(--ios-text-secondary))] group-hover:text-[rgb(var(--ios-accent))] transition-colors">{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <hr className="border-[rgb(var(--ios-separator))]/50 hidden lg:block" />

                    {/* Organization Filter */}
                    <div className="space-y-3 hidden lg:block">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">หน่วยงาน / ศูนย์</h3>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />
                            <input
                                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-[rgb(var(--ios-separator))] rounded-[var(--ios-radius-sm)] focus:ring-1 focus:ring-[rgb(var(--ios-accent))] focus:border-[rgb(var(--ios-accent))] outline-none transition-all"
                                placeholder="ค้นหาหน่วยงาน..."
                                type="text"
                                value={orgSearchTerm}
                                onChange={(e) => setOrgSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mt-2">
                            {filteredOrgsList.map((org) => (
                                <label key={org} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrgs.includes(org)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedOrgs(prev => [...prev, org]);
                                            else setSelectedOrgs(prev => prev.filter(o => o !== org));
                                        }}
                                        className="size-4 rounded border-[rgb(var(--ios-separator))] text-[rgb(var(--ios-accent))] focus:ring-[rgb(var(--ios-accent))] bg-white dark:bg-slate-800"
                                    />
                                    <span className="text-sm text-[rgb(var(--ios-text-secondary))] group-hover:text-[rgb(var(--ios-accent))] transition-colors truncate w-full" title={org}>{org}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Project List Content */}
                <main className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-[rgb(var(--ios-text-secondary))] text-sm">พบข้อมูล <span className="font-bold text-[rgb(var(--ios-text-primary))]">{filteredProjects.length}</span> รายการ</p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[rgb(var(--ios-text-secondary))] hidden sm:block">เรียงตาม:</span>
                            <select className="py-1.5 pl-3 pr-8 text-sm border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-sm)] bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[rgb(var(--ios-accent))] cursor-pointer w-[160px] outline-none text-[rgb(var(--ios-text-primary))]">
                                <option>งบประมาณ (มาก-น้อย)</option>
                                <option>งบประมาณ (น้อย-มาก)</option>
                                <option>ความเกี่ยวข้อง</option>
                                <option>ล่าสุด</option>
                            </select>
                        </div>
                    </div>

                    {/* Project Cards */}
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[rgb(var(--ios-accent))] animate-spin"></div></div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-[rgb(var(--ios-separator))]">
                            <p className="text-[rgb(var(--ios-text-secondary))]">ไม่พบโครงการที่ค้นหา</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProjects.slice(0, 10).map(proj => { // Show max 10 for demo
                                let statusBadge = "";
                                let statusText = "ไม่อนุมัติ";

                                if (proj.status === "อนุมัติ" || proj.budget_approved === proj.budget_requested) {
                                    statusBadge = "bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))] border-[rgb(var(--ios-green))]/20";
                                    statusText = "อนุมัติเต็มจำนวน";
                                } else if (proj.budget_approved > 0) {
                                    statusBadge = "bg-[rgb(var(--ios-orange))]/10 text-[rgb(var(--ios-orange))] border-[rgb(var(--ios-orange))]/20";
                                    statusText = "ตัดงบบางส่วน";
                                } else {
                                    statusBadge = "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                                }

                                return (
                                    <div key={proj.id} className="group bg-[rgb(var(--ios-bg-secondary))] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-lg)] p-5 hover:border-[rgb(var(--ios-accent))]/50 hover:shadow-[var(--ios-shadow-md)] transition-all shadow-[var(--ios-shadow-sm)]">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] text-[10px] whitespace-nowrap px-2.5 py-1 rounded font-medium truncate max-w-[200px]">
                                                        {proj.organization}
                                                    </span>
                                                    <span className="bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] text-[10px] whitespace-nowrap px-2.5 py-1 rounded font-medium">
                                                        ปีงบประมาณ {proj.fiscal_year}
                                                    </span>
                                                    <span className={`${statusBadge} text-[10px] whitespace-nowrap px-2.5 py-1 rounded font-bold uppercase tracking-wider border`}>
                                                        {statusText}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold mb-2 group-hover:text-[rgb(var(--ios-accent))] transition-colors cursor-pointer line-clamp-2">
                                                    {proj.project_name}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mt-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[rgb(var(--ios-text-secondary))] text-xs">งบที่ขอ:</span>
                                                        <span className="font-mono font-medium">{formatTHB(Number(proj.budget_requested))}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[rgb(var(--ios-text-secondary))] text-xs">งบที่อนุมัติ:</span>
                                                        <span className={`font-mono font-bold ${proj.budget_approved > 0 ? (statusText === 'อนุมัติเต็มจำนวน' ? 'text-[rgb(var(--ios-green))]' : 'text-[rgb(var(--ios-orange))]') : 'text-[rgb(var(--ios-text-secondary))]'}`}>
                                                            {formatTHB(Number(proj.budget_approved))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-accent))] hover:text-white rounded-[var(--ios-radius-md)] text-sm font-bold transition-all w-full ios-press cursor-not-allowed">
                                                    <Eye className="w-[18px] h-[18px]" /> ดูรายละเอียด
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Developer API Section (Adapted for TU Open Data) */}
                    <div className="mt-12 p-6 md:p-8 rounded-[var(--ios-radius-xl)] bg-slate-900 border border-slate-800 shadow-xl overflow-hidden relative">
                        {/* Abstract Blue Pattern Background */}
                        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgb(var(--ios-accent)) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px', width: '300px', height: '300px', WebkitMaskImage: 'linear-gradient(to bottom left, black, transparent)' }}></div>

                        <div className="relative z-10 flex flex-col xl:flex-row gap-8 items-center lg:items-start text-white">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-2 text-blue-400 mb-3">
                                    <Code2 className="w-[18px] h-[18px]" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#0a84ff]">TU Open Data API</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">เชื่อมต่อข้อมูลได้โดยตรง</h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0">
                                    นักวิจัยและนักพัฒนาสามารถดึงข้อมูลโครงการ และชุดข้อมูลแบบเปิด (Open Data) ผ่าน RESTful API ของเราไปใช้งานในแอปพลิเคชันของคุณได้อย่างอิสระ
                                </p>
                                <div className="flex gap-4 justify-center lg:justify-start pointer-events-none opacity-50 cursor-not-allowed">
                                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0a84ff] rounded-[var(--ios-radius-md)] text-sm font-bold shadow-lg shadow-blue-900/40">
                                        ขอ API Key &rarr;
                                    </button>
                                    <a className="flex items-center justify-center px-5 py-2.5 bg-slate-800 rounded-[var(--ios-radius-md)] text-sm font-semibold border border-slate-700" href="#">อ่านคู่มือการใช้งาน</a>
                                </div>
                            </div>

                            <div className="w-full xl:w-5/12 bg-[#0d1117] rounded-xl border border-slate-700/50 shadow-2xl p-5 font-mono text-[13px] overflow-hidden text-left">
                                <div className="flex items-center gap-1.5 mb-4 border-b border-slate-800 pb-3">
                                    <div className="size-3 rounded-full bg-red-500"></div>
                                    <div className="size-3 rounded-full bg-yellow-500"></div>
                                    <div className="size-3 rounded-full bg-green-500"></div>
                                    <span className="ml-2 text-slate-500 text-xs font-sans tracking-widest">BASH</span>
                                </div>
                                <pre className="text-slate-300 overflow-x-auto pb-2"><code><span className="text-fuchsia-400">curl</span> -X GET "https://api.opendata.tu.ac.th/v1/projects" \
                                    -H <span className="text-yellow-300">"Authorization: Bearer YOUR_API_KEY"</span> \
                                    -d <span className="text-yellow-300">"year=2567"</span></code></pre>
                                <div className="my-3 text-slate-500 italic pb-2 border-b border-slate-800/50">// Response (JSON)</div>
                                <pre className="text-emerald-400 mt-2 overflow-x-auto"><code>{`{
  "total_items": 205,
  "data": [
    {
      "id": "PRJ-67-001",
      "name": "โครงการจัดซื้อ...",
      "status": "approved"
    }
  ]
}`}</code></pre>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="mt-auto border-t border-[rgb(var(--ios-separator))]/40 py-6 text-center text-[rgb(var(--ios-text-secondary))] text-sm">
                <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© 2024 Thammasat University Open Data Initiative. All rights reserved.</p>
                    <div className="flex gap-6 pointer-events-none opacity-50">
                        <span className="hover:text-[rgb(var(--ios-accent))] transition-colors">นโยบายความเป็นส่วนตัว</span>
                        <span className="hover:text-[rgb(var(--ios-accent))] transition-colors">ข้อกำหนดการใช้งาน</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
