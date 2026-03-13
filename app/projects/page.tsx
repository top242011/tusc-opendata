"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PublicNavbar } from "@/components/public-navbar";
import { formatTHB } from "@/lib/utils";
import { Project } from "@/lib/types";
import { Search, SlidersHorizontal, Eye, X, SearchX, ArrowRight } from "lucide-react";

function ProjectsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read initial state from URL params
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
        const s = searchParams.get("status");
        return s ? s.split(",").filter(Boolean) : ["อนุมัติเต็มจำนวน", "ตัดงบบางส่วน"];
    });
    const [selectedOrgs, setSelectedOrgs] = useState<string[]>(() => {
        const o = searchParams.get("org");
        return o ? o.split(",").filter(Boolean) : [];
    });
    const [orgSearchTerm, setOrgSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "งบประมาณ (มาก-น้อย)");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const supabase = createClient();

    // Sync filters to URL
    const syncURL = useCallback((q: string, statuses: string[], orgs: string[], sort: string) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (statuses.length > 0) params.set("status", statuses.join(","));
        if (orgs.length > 0) params.set("org", orgs.join(","));
        if (sort && sort !== "งบประมาณ (มาก-น้อย)") params.set("sort", sort);
        const qs = params.toString();
        router.replace(`/projects${qs ? `?${qs}` : ""}`, { scroll: false });
    }, [router]);

    // Debounced URL sync
    useEffect(() => {
        const t = setTimeout(() => {
            syncURL(searchTerm, selectedStatuses, selectedOrgs, sortBy);
        }, 300);
        return () => clearTimeout(t);
    }, [searchTerm, selectedStatuses, selectedOrgs, sortBy, syncURL]);

    useEffect(() => {
        async function fetchProjects() {
            const { data } = await supabase
                .from("projects")
                .select("*")
                .order("budget_requested", { ascending: false });

            if (data) {
                setProjects(data as Project[]);
            }
            setLoading(false);
        }
        fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const uniqueOrgs = useMemo(() => Array.from(new Set(projects.map(p => p.organization))).sort(), [projects]);
    const filteredOrgsList = uniqueOrgs.filter(org => org.toLowerCase().includes(orgSearchTerm.toLowerCase()));

    // Compute latest fiscal year for data freshness badge
    const latestFiscalYear = useMemo(() => {
        if (projects.length === 0) return null;
        return Math.max(...projects.map(p => p.fiscal_year || 0));
    }, [projects]);

    // Helper to get status category for a project
    const getStatusCategory = useCallback((p: Project) => {
        if (p.status === "อนุมัติ" || p.budget_approved === p.budget_requested) return "อนุมัติเต็มจำนวน";
        if (p.budget_approved > 0) return "ตัดงบบางส่วน";
        return "ไม่อนุมัติ";
    }, []);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.organization.toLowerCase().includes(searchTerm.toLowerCase());
            const statusCategory = getStatusCategory(p);
            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(statusCategory);
            const matchesOrg = selectedOrgs.length === 0 || selectedOrgs.includes(p.organization);
            return matchesSearch && matchesStatus && matchesOrg;
        }).sort((a, b) => {
            if (sortBy === "งบประมาณ (มาก-น้อย)") return Number(b.budget_requested) - Number(a.budget_requested);
            if (sortBy === "งบประมาณ (น้อย-มาก)") return Number(a.budget_requested) - Number(b.budget_requested);
            if (sortBy === "ล่าสุด") return (b.fiscal_year || 0) - (a.fiscal_year || 0);
            return 0;
        });
    }, [projects, searchTerm, selectedStatuses, selectedOrgs, sortBy, getStatusCategory]);

    const clearAllFilters = () => {
        setSelectedStatuses([]);
        setSelectedOrgs([]);
        setSearchTerm("");
        setOrgSearchTerm("");
        setSortBy("งบประมาณ (มาก-น้อย)");
    };

    const hasActiveFilters = searchTerm || selectedStatuses.length > 0 || selectedOrgs.length > 0;

    // Shared filter sidebar content
    const filterContent = (
        <>
            <div className="flex items-center justify-between mb-2 lg:mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" /> ตัวกรอง
                </h2>
                <button onClick={clearAllFilters} className="text-[rgb(var(--ios-accent))] text-xs font-medium hover:underline">ล้างทั้งหมด</button>
            </div>

            <hr className="border-[rgb(var(--ios-separator))]/50" />

            {/* Status Filter */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">สถานะโครงการ</h3>
                <div className="space-y-2">
                    {["อนุมัติเต็มจำนวน", "ตัดงบบางส่วน", "ไม่อนุมัติ"].map((status) => (
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

            <hr className="border-[rgb(var(--ios-separator))]/50" />

            {/* Organization Filter */}
            <div className="space-y-3">
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
        </>
    );

    return (
        <main className="bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] flex flex-col min-h-screen font-sans antialiased">
            <PublicNavbar />

            {/* Hero Search Section */}
            <section className="bg-[rgb(var(--ios-bg-secondary))] border-b border-[rgb(var(--ios-separator))]/40 px-4 py-12 md:px-10 shadow-[var(--ios-shadow-sm)]">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">ค้นหาข้อมูลโครงการ</h1>
                        {latestFiscalYear && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] text-xs font-bold">
                                ปี {latestFiscalYear}
                            </span>
                        )}
                    </div>
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
                        <button
                            type="button"
                            onClick={() => setSearchTerm(searchTerm.trim())}
                            className="absolute inset-y-2 right-2 px-6 bg-[rgb(var(--ios-accent))] hover:opacity-90 text-white rounded-[var(--ios-radius-md)] font-medium transition-colors shadow-[var(--ios-shadow-sm)] ios-press"
                        >
                            ค้นหา
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 items-center mt-4">
                        <span className="text-sm text-[rgb(var(--ios-text-secondary))] font-medium mr-2">ค้นหายอดนิยม:</span>
                        {["จัดซื้ออุปกรณ์", "ทุนวิจัย", "ก่อสร้างอาคาร", "ความยั่งยืน (SDG)"].map((tag) => (
                            <button key={tag} onClick={() => setSearchTerm(tag)} className="px-3 py-1.5 rounded-full bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] text-xs font-medium hover:bg-[rgb(var(--ios-accent))]/10 hover:text-[rgb(var(--ios-accent))] transition-colors cursor-pointer">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content Layout */}
            <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-10 py-8 flex flex-col lg:flex-row gap-8">

                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setMobileFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--ios-bg-secondary))] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-md)] text-sm font-medium shadow-[var(--ios-shadow-sm)] ios-press w-full justify-center"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        ตัวกรอง
                        {hasActiveFilters && (
                            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[rgb(var(--ios-accent))] text-white text-[10px] font-bold">
                                {selectedStatuses.length + selectedOrgs.length + (searchTerm ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Mobile Filter Drawer (Backdrop) */}
                {mobileFilterOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
                        {/* Drawer Panel */}
                        <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-[rgb(var(--ios-bg-secondary))] rounded-t-[20px] shadow-2xl overflow-y-auto animate-slide-up">
                            {/* Handle bar */}
                            <div className="sticky top-0 bg-[rgb(var(--ios-bg-secondary))] pt-3 pb-2 px-5 flex items-center justify-between border-b border-[rgb(var(--ios-separator))]/30 z-10">
                                <div className="w-10 h-1 rounded-full bg-[rgb(var(--ios-separator))] mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                                <span className="text-lg font-bold mt-2">ตัวกรอง</span>
                                <button onClick={() => setMobileFilterOpen(false)} className="mt-2 p-1 rounded-full hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5 space-y-6">
                                {filterContent}
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="w-full py-3 bg-[rgb(var(--ios-accent))] text-white rounded-[var(--ios-radius-md)] font-bold text-sm ios-press"
                                >
                                    ดูผลลัพธ์ ({filteredProjects.length} รายการ)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop Sidebar Filters */}
                <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6 bg-[rgb(var(--ios-bg-secondary))] p-5 rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] h-fit sticky top-24">
                    {filterContent}
                </aside>

                {/* Project List Content */}
                <main className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-[rgb(var(--ios-text-secondary))] text-sm">พบข้อมูล <span className="font-bold text-[rgb(var(--ios-text-primary))]">{filteredProjects.length}</span> รายการ</p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[rgb(var(--ios-text-secondary))] hidden sm:block">เรียงตาม:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="py-1.5 pl-3 pr-8 text-sm border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-sm)] bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[rgb(var(--ios-accent))] cursor-pointer w-[160px] outline-none text-[rgb(var(--ios-text-primary))]">
                                <option>งบประมาณ (มาก-น้อย)</option>
                                <option>งบประมาณ (น้อย-มาก)</option>
                                <option>ล่าสุด</option>
                            </select>
                        </div>
                    </div>

                    {/* Project Cards */}
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[rgb(var(--ios-accent))] animate-spin"></div></div>
                    ) : filteredProjects.length === 0 ? (
                        /* Better Empty State */
                        <div className="flex flex-col items-center justify-center py-16 px-6 bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-dashed border-[rgb(var(--ios-separator))]">
                            <div className="w-20 h-20 rounded-full bg-[rgb(var(--ios-fill-tertiary))] flex items-center justify-center mb-6">
                                <SearchX className="w-10 h-10 text-[rgb(var(--ios-text-tertiary))]" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">ไม่พบโครงการที่ตรงกับเงื่อนไข</h3>
                            <p className="text-sm text-[rgb(var(--ios-text-secondary))] text-center max-w-md mb-6">
                                ลองค้นหาด้วยคำอื่น หรือล้างตัวกรองเพื่อแสดงโครงการทั้งหมด
                            </p>
                            <button
                                onClick={clearAllFilters}
                                className="px-6 py-2.5 bg-[rgb(var(--ios-accent))] text-white rounded-[var(--ios-radius-md)] text-sm font-bold ios-press hover:opacity-90 transition-colors"
                            >
                                ล้างตัวกรองทั้งหมด
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProjects.map(proj => {
                                const statusCategory = getStatusCategory(proj);
                                let statusBadge = "";
                                let statusText = statusCategory;

                                if (statusCategory === "อนุมัติเต็มจำนวน") {
                                    statusBadge = "bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))] border-[rgb(var(--ios-green))]/20";
                                } else if (statusCategory === "ตัดงบบางส่วน") {
                                    statusBadge = "bg-[rgb(var(--ios-orange))]/10 text-[rgb(var(--ios-orange))] border-[rgb(var(--ios-orange))]/20";
                                } else {
                                    statusBadge = "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                                }

                                const requested = Number(proj.budget_requested);
                                const approved = Number(proj.budget_approved);
                                const approvalPct = requested > 0 ? Math.round((approved / requested) * 100) : 0;
                                const barColor = statusCategory === "อนุมัติเต็มจำนวน"
                                    ? "bg-[rgb(var(--ios-green))]"
                                    : statusCategory === "ตัดงบบางส่วน"
                                        ? "bg-[rgb(var(--ios-orange))]"
                                        : "bg-slate-300 dark:bg-slate-600";

                                return (
                                    <Link key={proj.id} href={`/project/${proj.id}`} className="block group">
                                        <div className="bg-[rgb(var(--ios-bg-secondary))] border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-lg)] p-5 hover:border-[rgb(var(--ios-accent))]/50 hover:shadow-[var(--ios-shadow-md)] transition-all shadow-[var(--ios-shadow-sm)]">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    {/* Top row: status badge + fiscal year */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className={`${statusBadge} text-[10px] whitespace-nowrap px-2.5 py-1 rounded font-bold uppercase tracking-wider border`}>
                                                            {statusText}
                                                        </span>
                                                        <span className="text-[rgb(var(--ios-text-tertiary))] text-xs font-medium">
                                                            ปีงบฯ {proj.fiscal_year}
                                                        </span>
                                                    </div>

                                                    {/* Project name */}
                                                    <h3 className="text-lg font-bold mb-1 group-hover:text-[rgb(var(--ios-accent))] transition-colors line-clamp-2">
                                                        {proj.project_name}
                                                    </h3>

                                                    {/* Organization */}
                                                    <p className="text-xs text-[rgb(var(--ios-text-secondary))] mb-4 truncate">
                                                        {proj.organization}
                                                    </p>

                                                    {/* Budget comparison bar */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-[rgb(var(--ios-text-secondary))]">งบที่อนุมัติ / งบที่ขอ</span>
                                                            <span className="font-mono font-bold">
                                                                {approvalPct}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 rounded-full bg-[rgb(var(--ios-fill-tertiary))] overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${barColor} transition-all duration-500`}
                                                                style={{ width: `${Math.min(approvalPct, 100)}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[rgb(var(--ios-text-secondary))]">ขอ:</span>
                                                                <span className="font-mono font-medium">{formatTHB(requested)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[rgb(var(--ios-text-secondary))]">อนุมัติ:</span>
                                                                <span className={`font-mono font-bold ${approved > 0 ? (statusCategory === "อนุมัติเต็มจำนวน" ? "text-[rgb(var(--ios-green))]" : "text-[rgb(var(--ios-orange))]") : "text-[rgb(var(--ios-text-secondary))]"}`}>
                                                                    {formatTHB(approved)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* CTA */}
                                                <div className="flex items-center shrink-0 self-center md:self-auto mt-2 md:mt-0">
                                                    <span className="flex items-center gap-1.5 text-[rgb(var(--ios-accent))] text-sm font-bold group-hover:gap-2.5 transition-all">
                                                        ดูรายละเอียด <ArrowRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            <footer className="mt-auto border-t border-[rgb(var(--ios-separator))]/40 py-6 text-center text-[rgb(var(--ios-text-secondary))] text-sm">
                <p>&copy; {new Date().getFullYear()} Thammasat University Open Data Initiative. All rights reserved.</p>
            </footer>

            {/* Mobile drawer slide-up animation */}
            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </main>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={
            <main className="bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] flex flex-col min-h-screen font-sans antialiased">
                <div className="flex justify-center items-center flex-1">
                    <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[rgb(var(--ios-accent))] animate-spin" />
                </div>
            </main>
        }>
            <ProjectsContent />
        </Suspense>
    );
}
