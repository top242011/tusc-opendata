"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Project, DashboardStats } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import {
    Download,
    Search,
    Wallet,
    Building2,
    FolderKanban,
    ShieldCheck,
    ArrowRight,
    TrendingUp,
    Calendar,
} from "lucide-react";

interface LandingDashboardProps {
    projects: Project[];
    stats: DashboardStats;
}

export function LandingDashboard({ projects, stats }: LandingDashboardProps) {
    const router = useRouter();
    const [heroSearch, setHeroSearch] = useState("");

    // --- Derived data ---

    const latestYear = useMemo(
        () =>
            projects.length > 0
                ? Math.max(...projects.map((p) => p.fiscal_year || 0))
                : new Date().getFullYear() + 543,
        [projects]
    );

    // Status breakdown
    const statusBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of projects) {
            counts[p.status] = (counts[p.status] || 0) + 1;
        }
        return counts;
    }, [projects]);

    // Org stats (shared between treemap, bar chart, insight card)
    const orgStats = useMemo(() => {
        const acc: Record<string, { name: string; requested: number; approved: number }> = {};
        for (const project of projects) {
            if (!acc[project.organization]) {
                acc[project.organization] = { name: project.organization, requested: 0, approved: 0 };
            }
            acc[project.organization].requested += Number(project.budget_requested);
            acc[project.organization].approved += Number(project.budget_approved);
        }
        return acc;
    }, [projects]);

    const sortedOrgs = useMemo(
        () => Object.values(orgStats).sort((a, b) => b.approved - a.approved),
        [orgStats]
    );

    const top5Orgs = useMemo(() => sortedOrgs.slice(0, 5), [sortedOrgs]);
    const topOrg = top5Orgs[0] ?? null;
    const maxApproved = useMemo(() => Math.max(...top5Orgs.map((o) => o.approved), 1), [top5Orgs]);

    // Treemap data (pad to 7)
    const treemapOrgs = useMemo(() => {
        const list = [...sortedOrgs];
        while (list.length < 7) {
            list.push({ name: "ไม่มีข้อมูล", requested: 0, approved: 0 });
        }
        return list;
    }, [sortedOrgs]);

    const otherOrgsList = useMemo(() => sortedOrgs.slice(7), [sortedOrgs]);
    const otherApproved = useMemo(
        () => otherOrgsList.reduce((sum, org) => sum + org.approved, 0),
        [otherOrgsList]
    );
    const otherCount = otherOrgsList.length;

    const trTotal = stats.totalApproved || 1;
    const getPct = (val: number) => ((val / trTotal) * 100).toFixed(1) + "%";

    // Campus donut
    const campusStats = useMemo(() => {
        const acc: Record<string, number> = {};
        for (const proj of projects) {
            const campus = proj.campus || "central";
            acc[campus] = (acc[campus] || 0) + Number(proj.budget_approved);
        }
        return acc;
    }, [projects]);

    const cTotal = useMemo(
        () => Object.values(campusStats).reduce((sum, val) => sum + val, 0) || 1,
        [campusStats]
    );

    const donutData = useMemo(
        () =>
            [
                { name: "รังสิต", val: campusStats["rangsit"] || 0, color: "#1152d4" },
                { name: "ท่าพระจันทร์", val: campusStats["thaprachan"] || 0, color: "#0ea5e9" },
                { name: "ลำปาง", val: campusStats["lampang"] || 0, color: "#6366f1" },
                { name: "ส่วนกลาง", val: campusStats["central"] || 0, color: "#f59e0b" },
            ]
                .filter((d) => d.val > 0)
                .sort((a, b) => b.val - a.val),
        [campusStats]
    );

    const finalGradient = useMemo(() => {
        let currentStop = 0;
        let gradientStops = "";
        for (const d of donutData) {
            const pct = (d.val / cTotal) * 100;
            const stopStr = `${d.color} ${currentStop}% ${currentStop + pct}%`;
            gradientStops = gradientStops ? `${gradientStops}, ${stopStr}` : stopStr;
            currentStop += pct;
        }
        return gradientStops || "#cbd5e1 0% 100%";
    }, [donutData, cTotal]);

    // Timeline
    const timelineData = useMemo(() => {
        const yearStats: Record<number, { req: number; app: number }> = {};
        for (const project of projects) {
            const year = project.fiscal_year || 2567;
            if (!yearStats[year]) yearStats[year] = { req: 0, app: 0 };
            yearStats[year].req += Number(project.budget_requested);
            yearStats[year].app += Number(project.budget_approved);
        }

        const sortedYears = Object.keys(yearStats)
            .map(Number)
            .sort((a, b) => a - b)
            .slice(-6);

        const data = sortedYears.map((year) => ({
            year,
            approved: yearStats[year].app,
        }));

        // Don't pad with fake years - only show actual data
        if (data.length === 0) {
            data.push({ year: new Date().getFullYear() + 543, approved: 0 });
        }
        return data;
    }, [projects]);

    const maxTimelineY = useMemo(
        () => Math.max(...timelineData.map((d) => d.approved)) || 1,
        [timelineData]
    );

    const pointCount = timelineData.length;
    const svgPoints = useMemo(
        () =>
            timelineData.map((d, i) => ({
                x: pointCount === 1 ? 50 : (i / (pointCount - 1)) * 100,
                y: 100 - (d.approved / maxTimelineY) * 90,
                data: d,
            })),
        [timelineData, maxTimelineY, pointCount]
    );

    const pathD = pointCount === 1
        ? `M0,${svgPoints[0].y} H100 V100 H0 Z`
        : `M${svgPoints.map((p) => `${p.x},${p.y}`).join(" L")} V100 H0 Z`;
    const linePathD = pointCount === 1
        ? `M0,${svgPoints[0].y} H100`
        : `M${svgPoints.map((p) => `${p.x},${p.y}`).join(" L")}`;

    // --- Helpers ---

    const formatSmallTHB = (n: number) => {
        if (n >= 1e9) return `฿${(n / 1e9).toFixed(1)}B`;
        if (n >= 1e6) return `฿${(n / 1e6).toFixed(1)}M`;
        if (n >= 1e3) return `฿${(n / 1e3).toFixed(0)}K`;
        return `฿${n.toFixed(0)}`;
    };

    const handleHeroSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (heroSearch.trim()) {
            router.push(`/projects?q=${encodeURIComponent(heroSearch.trim())}`);
        }
    };

    const handleExport = () => {
        const headers = [
            "ชื่อโครงการ",
            "หน่วยงาน",
            "ปีงบประมาณ",
            "งบที่ขอ (บาท)",
            "งบที่อนุมัติ (บาท)",
            "สถานะ",
        ];
        const rows = projects.map((p) => [
            `"${String(p.project_name || "").replace(/"/g, '""')}"`,
            `"${String(p.organization || "").replace(/"/g, '""')}"`,
            p.fiscal_year || "",
            p.budget_requested || 0,
            p.budget_approved || 0,
            `"${p.status || ""}"`,
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tu-open-data-export.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const barColors = ["bg-blue-600", "bg-sky-500", "bg-indigo-500", "bg-teal-500", "bg-amber-500"];
    const treemapColors = [
        "bg-blue-600 hover:bg-blue-700",
        "bg-sky-500 hover:bg-sky-600",
        "bg-indigo-500 hover:bg-indigo-600",
        "bg-teal-500 hover:bg-teal-600",
        "bg-amber-500 hover:bg-amber-600",
        "bg-rose-500 hover:bg-rose-600",
        "bg-purple-500 hover:bg-purple-600",
    ];

    const t = treemapOrgs;

    return (
        <div className="flex-1 w-full">
            {/* ========== HERO SECTION ========== */}
            <section className="bg-gradient-to-b from-[rgb(var(--ios-accent))]/5 to-transparent border-b border-[rgb(var(--ios-separator))]/30">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-10 pb-8">
                    <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] text-xs font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>ข้อมูลจากปีงบประมาณ {latestYear}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[rgb(var(--ios-text-primary))] leading-tight">
                            ข้อมูลงบประมาณโครงการ
                            <br />
                            มหาวิทยาลัยธรรมศาสตร์
                        </h1>

                        <p className="text-[rgb(var(--ios-text-secondary))] text-sm md:text-base max-w-lg leading-relaxed">
                            แพลตฟอร์มความโปร่งใสด้านงบประมาณ เปิดเผยข้อมูลโครงการ
                            งบที่ขอ งบที่อนุมัติ และสถานะการดำเนินงาน
                            จากสภานักศึกษามหาวิทยาลัยธรรมศาสตร์
                        </p>

                        {/* Hero Search */}
                        <form
                            onSubmit={handleHeroSearch}
                            className="w-full max-w-md mt-2"
                        >
                            <div className="flex items-stretch rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))] bg-[rgb(var(--ios-bg-secondary))] shadow-[var(--ios-shadow-sm)] overflow-hidden focus-within:ring-2 focus-within:ring-[rgb(var(--ios-accent))]/50 transition-all">
                                <div className="flex items-center justify-center pl-4 text-[rgb(var(--ios-text-tertiary))]">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    className="flex-1 bg-transparent border-none text-[rgb(var(--ios-text-primary))] focus:ring-0 placeholder:text-[rgb(var(--ios-text-tertiary))] px-3 py-3 text-sm font-normal outline-none min-w-0"
                                    placeholder="ค้นหาโครงการ หน่วยงาน หรือคำสำคัญ..."
                                    value={heroSearch}
                                    onChange={(e) => setHeroSearch(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="px-4 bg-[rgb(var(--ios-accent))] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                                >
                                    ค้นหา
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* ========== MAIN CONTENT ========== */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
                {/* Action bar: Year + Export */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[rgb(var(--ios-text-primary))]">
                        ภาพรวมงบประมาณ ปี {latestYear}
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 h-9 px-4 rounded-[var(--ios-radius-md)] bg-[rgb(var(--ios-accent))] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">ส่งออกข้อมูล</span>
                        </button>
                    </div>
                </div>

                {/* ========== INSIGHT CARDS ========== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                    {/* Insight 1: Total approved + approval rate */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] p-5 border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] relative overflow-hidden group hover:border-[rgb(var(--ios-accent))]/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-[var(--ios-radius-sm)] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <span
                                className="text-xs font-semibold px-2 py-1 rounded-full"
                                style={{
                                    color: "rgb(var(--ios-green))",
                                    backgroundColor: "rgb(var(--ios-green) / 0.1)",
                                }}
                            >
                                อนุมัติ {stats.approvalRate.toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-[rgb(var(--ios-text-secondary))] text-xs font-medium mb-1">
                            งบประมาณที่อนุมัติ
                        </p>
                        <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))] tracking-tight">
                            {formatTHB(stats.totalApproved)}
                        </p>
                        <p className="text-[rgb(var(--ios-text-tertiary))] text-xs mt-1.5">
                            จากงบที่ขอทั้งหมด {formatTHB(stats.totalRequested)}
                        </p>
                        <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Insight 2: Top org */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] p-5 border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] relative overflow-hidden group hover:border-[rgb(var(--ios-accent))]/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-[var(--ios-radius-sm)] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-[rgb(var(--ios-text-tertiary))] px-2 py-1 rounded-full bg-[rgb(var(--ios-fill-tertiary))]">
                                อันดับ 1
                            </span>
                        </div>
                        <p className="text-[rgb(var(--ios-text-secondary))] text-xs font-medium mb-1">
                            หน่วยงานงบประมาณสูงสุด
                        </p>
                        <p className="text-lg font-bold text-[rgb(var(--ios-text-primary))] tracking-tight truncate">
                            {topOrg ? topOrg.name : "ไม่มีข้อมูล"}
                        </p>
                        <p className="text-[rgb(var(--ios-text-tertiary))] text-xs mt-1.5">
                            {topOrg
                                ? `ได้รับอนุมัติ ${formatTHB(topOrg.approved)} (${getPct(topOrg.approved)})`
                                : ""}
                        </p>
                        <div className="absolute bottom-0 left-0 h-0.5 bg-amber-500 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Insight 3: Project count + status breakdown */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] p-5 border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] relative overflow-hidden group hover:border-[rgb(var(--ios-accent))]/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-[var(--ios-radius-sm)] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                <FolderKanban className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[rgb(var(--ios-text-secondary))] text-xs font-medium mb-1">
                            จำนวนโครงการทั้งหมด
                        </p>
                        <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))] tracking-tight">
                            {projects.length.toLocaleString()}{" "}
                            <span className="text-base font-medium text-[rgb(var(--ios-text-secondary))]">โครงการ</span>
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-[rgb(var(--ios-text-tertiary))]">
                            {statusBreakdown["อนุมัติ"] && (
                                <span>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: "rgb(var(--ios-green))" }} />
                                    อนุมัติ {statusBreakdown["อนุมัติ"]}
                                </span>
                            )}
                            {statusBreakdown["ตัดงบ"] && (
                                <span>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: "rgb(var(--ios-orange))" }} />
                                    ตัดงบ {statusBreakdown["ตัดงบ"]}
                                </span>
                            )}
                            {statusBreakdown["ไม่อนุมัติ"] && (
                                <span>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: "rgb(var(--ios-red))" }} />
                                    ไม่อนุมัติ {statusBreakdown["ไม่อนุมัติ"]}
                                </span>
                            )}
                            {statusBreakdown["รอพิจารณา"] && (
                                <span>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-1" />
                                    รอพิจารณา {statusBreakdown["รอพิจารณา"]}
                                </span>
                            )}
                        </div>
                        <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* ========== AI DOCUMENT CHECKER CTA ========== */}
                <Link
                    href="/tools/document-checker"
                    className="flex items-center gap-4 mb-6 px-5 py-4 rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-accent))]/20 bg-[rgb(var(--ios-accent))]/5 hover:bg-[rgb(var(--ios-accent))]/10 transition-colors group"
                >
                    <div className="p-2.5 rounded-[var(--ios-radius-md)] bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[rgb(var(--ios-text-primary))]">
                            ตรวจสอบเอกสารโครงการ ด้วย AI
                        </p>
                        <p className="text-xs text-[rgb(var(--ios-text-secondary))] mt-0.5">
                            ตรวจความถูกต้องของเอกสารงบประมาณอัตโนมัติ พร้อมคำแนะนำการแก้ไข
                        </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[rgb(var(--ios-text-tertiary))] group-hover:text-[rgb(var(--ios-accent))] transition-colors shrink-0" />
                </Link>

                {/* ========== MAIN CHART GRID ========== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Left: Treemap (desktop) / Bar chart (mobile) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] flex flex-col min-h-0">
                            <div className="p-5 border-b border-[rgb(var(--ios-separator))]/50">
                                <h3 className="text-base font-bold text-[rgb(var(--ios-text-primary))]">
                                    สัดส่วนงบประมาณตามคณะ/หน่วยงาน
                                </h3>
                                <p className="text-[rgb(var(--ios-text-secondary))] text-xs mt-0.5">
                                    ขนาดแสดงถึงสัดส่วนงบประมาณที่ได้รับอนุมัติ
                                </p>
                            </div>

                            {/* Desktop: Treemap */}
                            <div className="hidden md:block p-5 flex-1">
                                <div className="w-full min-h-[400px] flex flex-col gap-1">
                                    <div className="flex flex-1 gap-1">
                                        <div
                                            className={`w-[45%] ${treemapColors[0]} transition-colors p-4 flex flex-col justify-between text-white rounded-sm cursor-pointer`}
                                        >
                                            <span className="font-bold text-lg line-clamp-2">{t[0].name}</span>
                                            <div className="flex items-end justify-between">
                                                <span className="text-2xl font-bold opacity-90">{formatSmallTHB(t[0].approved)}</span>
                                                <span className="text-sm bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                                                    {getPct(t[0].approved)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div
                                                className={`h-[60%] w-full ${treemapColors[1]} transition-colors p-4 flex flex-col justify-between text-white rounded-sm cursor-pointer`}
                                            >
                                                <span className="font-bold text-lg line-clamp-1">{t[1].name}</span>
                                                <div className="flex items-end justify-between">
                                                    <span className="text-xl font-bold opacity-90">{formatSmallTHB(t[1].approved)}</span>
                                                    <span className="text-sm bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                                                        {getPct(t[1].approved)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-1 gap-1">
                                                <div
                                                    className={`flex-1 ${treemapColors[2]} transition-colors p-3 flex flex-col justify-between text-white rounded-sm cursor-pointer`}
                                                >
                                                    <span className="font-bold line-clamp-1 truncate">{t[2].name}</span>
                                                    <div className="flex items-end justify-between w-full">
                                                        <span className="text-lg opacity-90 font-bold">{formatSmallTHB(t[2].approved)}</span>
                                                        <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">
                                                            {getPct(t[2].approved)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`flex-1 ${treemapColors[3]} transition-colors p-3 flex flex-col justify-between text-white rounded-sm cursor-pointer`}
                                                >
                                                    <span className="font-bold line-clamp-1 truncate">{t[3].name}</span>
                                                    <div className="flex items-end justify-between w-full">
                                                        <span className="text-lg opacity-90 font-bold">{formatSmallTHB(t[3].approved)}</span>
                                                        <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">
                                                            {getPct(t[3].approved)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[120px] flex gap-1">
                                        <div
                                            className={`w-[30%] ${treemapColors[4]} transition-colors p-3 text-white rounded-sm flex flex-col justify-between cursor-pointer`}
                                        >
                                            <span className="font-bold text-sm truncate w-full">{t[4].name}</span>
                                            <div className="flex items-end justify-between w-full">
                                                <span className="text-base font-bold">{formatSmallTHB(t[4].approved)}</span>
                                                <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">
                                                    {getPct(t[4].approved)}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={`w-[25%] ${treemapColors[5]} transition-colors p-3 text-white rounded-sm flex flex-col justify-between cursor-pointer`}
                                        >
                                            <span className="font-bold text-sm truncate w-full">{t[5].name}</span>
                                            <div className="flex items-end justify-between w-full">
                                                <span className="text-base font-bold">{formatSmallTHB(t[5].approved)}</span>
                                                <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">
                                                    {getPct(t[5].approved)}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={`w-[20%] ${treemapColors[6]} transition-colors p-3 text-white rounded-sm flex flex-col justify-between cursor-pointer`}
                                        >
                                            <span className="font-bold text-sm truncate w-full">{t[6].name}</span>
                                            <div className="flex items-end justify-between w-full">
                                                <span className="text-base font-bold">{formatSmallTHB(t[6].approved)}</span>
                                                <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">
                                                    {getPct(t[6].approved)}
                                                </span>
                                            </div>
                                        </div>
                                        {otherCount > 0 && (
                                            <div className="flex-1 bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 transition-colors p-3 text-white rounded-sm flex flex-col justify-between items-center cursor-pointer">
                                                <span className="font-bold text-xs">อื่นๆ ({otherCount})</span>
                                                <span className="font-bold text-sm">{formatSmallTHB(otherApproved)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile: Horizontal bar chart */}
                            <div className="md:hidden p-5 flex flex-col gap-3">
                                {sortedOrgs.slice(0, 7).map((org, i) => {
                                    const pct = trTotal > 0 ? (org.approved / trTotal) * 100 : 0;
                                    return (
                                        <div key={org.name} className="flex flex-col gap-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-[rgb(var(--ios-text-primary))] font-medium truncate max-w-[60%]">
                                                    {org.name}
                                                </span>
                                                <span className="text-[rgb(var(--ios-text-secondary))] font-semibold shrink-0">
                                                    {formatSmallTHB(org.approved)} ({pct.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full h-2">
                                                <div
                                                    className={`${treemapColors[i]?.split(" ")[0] || "bg-slate-400"} h-2 rounded-full transition-all`}
                                                    style={{ width: `${Math.max(pct, 1)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {otherCount > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-[rgb(var(--ios-text-secondary))]">
                                                อื่นๆ ({otherCount} หน่วยงาน)
                                            </span>
                                            <span className="text-[rgb(var(--ios-text-secondary))] font-semibold">
                                                {formatSmallTHB(otherApproved)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full h-2">
                                            <div
                                                className="bg-slate-400 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.max((otherApproved / trTotal) * 100, 1)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Top 5 + Campus Donut */}
                    <div className="flex flex-col gap-6">
                        {/* Top 5 Orgs */}
                        <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] p-5">
                            <h3 className="text-base font-bold text-[rgb(var(--ios-text-primary))] mb-5">
                                5 อันดับหน่วยงานงบประมาณสูงสุด
                            </h3>
                            <div className="flex flex-col gap-3">
                                {top5Orgs.map((org, index) => {
                                    const percentage = maxApproved > 0 ? (org.approved / maxApproved) * 100 : 0;
                                    return (
                                        <div key={org.name} className="flex flex-col gap-1">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-[rgb(var(--ios-text-primary))] truncate max-w-[60%]">
                                                    {org.name}
                                                </span>
                                                <span className="text-[rgb(var(--ios-text-primary))] font-bold shrink-0">
                                                    {formatTHB(org.approved)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full h-2">
                                                <div
                                                    className={`${barColors[index % barColors.length]} h-2 rounded-full transition-all`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {top5Orgs.length === 0 && (
                                    <p className="text-sm text-[rgb(var(--ios-text-secondary))]">ไม่มีข้อมูล</p>
                                )}
                            </div>
                        </div>

                        {/* Campus Donut (inside sidebar) */}
                        <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] p-5 flex flex-col">
                            <h3 className="text-base font-bold text-[rgb(var(--ios-text-primary))] mb-2">
                                สัดส่วนงบประมาณตามวิทยาเขต
                            </h3>
                            <div className="flex items-center justify-center relative my-4">
                                <div
                                    className="w-44 h-44 rounded-full relative"
                                    style={{ background: `conic-gradient(${finalGradient})` }}
                                >
                                    <div className="absolute inset-0 m-auto w-28 h-28 bg-[rgb(var(--ios-bg-secondary))] rounded-full flex items-center justify-center flex-col shadow-inner">
                                        <span className="text-[10px] text-[rgb(var(--ios-text-secondary))] font-medium uppercase">
                                            รวมทั้งหมด
                                        </span>
                                        <span className="text-lg font-bold text-[rgb(var(--ios-text-primary))]">
                                            100%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3 text-xs text-[rgb(var(--ios-text-secondary))]">
                                {donutData.map((d) => (
                                    <div key={d.name} className="flex items-center gap-1.5">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: d.color }}
                                        />
                                        <span>
                                            {d.name} ({((d.val / cTotal) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                ))}
                                {donutData.length === 0 && (
                                    <span className="text-[rgb(var(--ios-text-secondary))]">ไม่มีข้อมูล</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== TIMELINE ========== */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] p-5 md:p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[rgb(var(--ios-accent))]" />
                                แนวโน้มงบประมาณโครงการ
                            </h3>
                            <p className="text-[rgb(var(--ios-text-secondary))] text-xs mt-0.5">
                                งบประมาณที่ได้รับอนุมัติแยกตามปีงบประมาณ
                            </p>
                        </div>
                    </div>

                    <div className="h-56 md:h-64 w-full relative pt-8 pb-6 px-4">
                        {/* Y-axis grid lines */}
                        <div className="absolute inset-x-4 inset-y-6 flex flex-col justify-between text-[10px] md:text-xs text-[rgb(var(--ios-text-tertiary))] font-mono z-0">
                            <div className="border-b border-dashed border-[rgb(var(--ios-separator))] w-full h-0 relative">
                                <span className="absolute -left-8 -top-2 hidden md:inline">{formatSmallTHB(maxTimelineY)}</span>
                            </div>
                            <div className="border-b border-dashed border-[rgb(var(--ios-separator))] w-full h-0 relative">
                                <span className="absolute -left-8 -top-2 hidden md:inline">{formatSmallTHB(maxTimelineY * 0.75)}</span>
                            </div>
                            <div className="border-b border-dashed border-[rgb(var(--ios-separator))] w-full h-0 relative">
                                <span className="absolute -left-8 -top-2 hidden md:inline">{formatSmallTHB(maxTimelineY * 0.5)}</span>
                            </div>
                            <div className="border-b border-dashed border-[rgb(var(--ios-separator))] w-full h-0 relative">
                                <span className="absolute -left-8 -top-2 hidden md:inline">{formatSmallTHB(maxTimelineY * 0.25)}</span>
                            </div>
                            <div className="border-b border-solid border-[rgb(var(--ios-separator))]/80 w-full h-0 relative">
                                <span className="absolute -left-8 -top-2 hidden md:inline">0</span>
                            </div>
                        </div>

                        <svg
                            className="absolute inset-x-4 inset-y-6 w-full h-[calc(100%-3rem)] z-10 overflow-hidden"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 100"
                        >
                            <defs>
                                <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="rgb(var(--ios-accent))" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="rgb(var(--ios-accent))" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={pathD} fill="url(#chart-gradient)" />
                            <path
                                d={linePathD}
                                fill="none"
                                stroke="rgb(var(--ios-accent))"
                                strokeWidth="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                            {svgPoints.map((p, i) => (
                                <g key={i}>
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        fill="white"
                                        r="1.5"
                                        stroke="rgb(var(--ios-accent))"
                                        strokeWidth="0.5"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </g>
                            ))}
                        </svg>

                        <div className={`absolute bottom-0 left-4 right-4 flex ${timelineData.length === 1 ? 'justify-center' : 'justify-between'} text-[10px] md:text-xs text-[rgb(var(--ios-text-secondary))] font-medium pt-2`}>
                            {timelineData.map((d) => (
                                <span key={d.year}>{d.year}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
