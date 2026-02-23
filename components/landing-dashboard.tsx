"use client";

import { Project, DashboardStats } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { Calendar, Download, Wallet, FileText, CheckSquare, Search } from "lucide-react";

interface LandingDashboardProps {
    projects: Project[];
    stats: DashboardStats;
}

export function LandingDashboard({ projects, stats }: LandingDashboardProps) {
    // Top 5 Calculation for dynamic bar chart
    const orgStats = projects.reduce((acc, project) => {
        if (!acc[project.organization]) {
            acc[project.organization] = { name: project.organization, requested: 0, approved: 0 };
        }
        acc[project.organization].requested += Number(project.budget_requested);
        acc[project.organization].approved += Number(project.budget_approved);
        return acc;
    }, {} as Record<string, { name: string, requested: number, approved: number }>);

    const top5Orgs = Object.values(orgStats)
        .sort((a, b) => b.approved - a.approved)
        .slice(0, 5);

    const maxApproved = Math.max(...top5Orgs.map((o) => o.approved), 1);

    // Fallback colors for top 5
    const colors = ["bg-blue-600", "bg-sky-500", "bg-indigo-500", "bg-teal-500", "bg-amber-500"];

    // --- Dynamic Data for Treemap ---
    const sortedOrgsForTreemap = Object.values(orgStats).sort((a, b) => b.approved - a.approved);
    while (sortedOrgsForTreemap.length < 7) {
        sortedOrgsForTreemap.push({ name: 'ไม่มีข้อมูล', requested: 0, approved: 0 });
    }
    const t1 = sortedOrgsForTreemap[0];
    const t2 = sortedOrgsForTreemap[1];
    const t3 = sortedOrgsForTreemap[2];
    const t4 = sortedOrgsForTreemap[3];
    const t5 = sortedOrgsForTreemap[4];
    const t6 = sortedOrgsForTreemap[5];
    const t7 = sortedOrgsForTreemap[6];

    // others
    const otherOrgsList = sortedOrgsForTreemap.slice(7);
    const otherApproved = otherOrgsList.reduce((sum, org) => sum + org.approved, 0);
    const otherCount = otherOrgsList.length;

    const trTotal = stats.totalApproved || 1;
    const getPct = (val: number) => ((val / trTotal) * 100).toFixed(1) + '%';

    // --- Dynamic Data for Campus Donut ---
    const campusStats = projects.reduce((acc, proj) => {
        const campus = proj.campus || 'central';
        if (!acc[campus]) acc[campus] = 0;
        acc[campus] += Number(proj.budget_approved);
        return acc;
    }, {} as Record<string, number>);

    const cTotal = Object.values(campusStats).reduce((sum, val) => sum + val, 0) || 1;
    const donutData = [
        { name: 'รังสิต', val: campusStats['rangsit'] || 0, color: '#1152d4' },
        { name: 'ท่าพระจันทร์', val: campusStats['thaprachan'] || 0, color: '#0ea5e9' },
        { name: 'ลำปาง', val: campusStats['lampang'] || 0, color: '#6366f1' },
        { name: 'ส่วนกลาง', val: campusStats['central'] || 0, color: '#f59e0b' }
    ].filter(d => d.val > 0).sort((a, b) => b.val - a.val);

    const { gradientStops } = donutData.reduce((acc, d) => {
        const pct = (d.val / cTotal) * 100;
        const stopStr = `${d.color} ${acc.currentStop}% ${acc.currentStop + pct}%`;
        return {
            currentStop: acc.currentStop + pct,
            gradientStops: acc.gradientStops ? `${acc.gradientStops}, ${stopStr}` : stopStr
        };
    }, { currentStop: 0, gradientStops: '' });

    const finalGradient = gradientStops || '#cbd5e1 0% 100%';

    // --- Dynamic Data for Timeline ---
    const yearStats = projects.reduce((acc, project) => {
        const year = project.fiscal_year || 2567;
        if (!acc[year]) acc[year] = { req: 0, app: 0 };
        acc[year].req += Number(project.budget_requested);
        acc[year].app += Number(project.budget_approved);
        return acc;
    }, {} as Record<number, { req: number, app: number }>);

    const sortedYears = Object.keys(yearStats).map(Number).sort((a, b) => a - b).slice(-6);
    const timelineData = sortedYears.map(year => ({
        year,
        approved: yearStats[year].app
    }));

    // Fill to 6 points if less
    while (timelineData.length > 0 && timelineData.length < 6) {
        timelineData.unshift({ year: timelineData[0].year - 1, approved: 0 });
    }
    if (timelineData.length === 0) {
        for (let i = 0; i < 6; i++) timelineData.push({ year: 2562 + i, approved: 0 });
    }

    const maxTimelineY = Math.max(...timelineData.map(d => d.approved)) || 1;
    const svgPoints = timelineData.map((d, i) => {
        const x = (i / 5) * 100;
        const y = 100 - ((d.approved / maxTimelineY) * 90);  // 10% padding top
        return { x, y, data: d };
    });

    const pathD = `M${svgPoints.map(p => `${p.x},${p.y}`).join(' L')} V100 H0 Z`;
    const linePathD = `M${svgPoints.map(p => `${p.x},${p.y}`).join(' L')}`;

    const formatSmallTHB = (n: number) => {
        if (n >= 1e9) return `฿${(n / 1e9).toFixed(1)}B`;
        if (n >= 1e6) return `฿${(n / 1e6).toFixed(1)}M`;
        if (n >= 1e3) return `฿${(n / 1e3).toFixed(0)}K`;
        return `฿${n.toFixed(0)}`;
    };

    return (
        <div className="flex-1 px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-black tracking-tight text-[rgb(var(--ios-text-primary))]">
                        ภาพรวมงบประมาณโครงการ ปี 2567
                    </h2>
                    <p className="text-[rgb(var(--ios-text-secondary))] text-sm">
                        อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} • แหล่งข้อมูล: กองแผนงาน มหาวิทยาลัยธรรมศาสตร์
                    </p>
                </div>

                {/* Search Bar (Mockup Desktop) */}
                <div className="hidden lg:flex flex-col min-w-64 h-10 max-w-sm mr-auto ml-10">
                    <div className="flex w-full flex-1 items-stretch rounded-[var(--ios-radius-md)] h-full border border-[rgb(var(--ios-separator))] bg-white dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-[rgb(var(--ios-accent))]/50 transition-all">
                        <div className="text-[rgb(var(--ios-text-tertiary))] flex items-center justify-center pl-3">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 bg-transparent border-none text-[rgb(var(--ios-text-primary))] focus:ring-0 placeholder:text-[rgb(var(--ios-text-tertiary))] px-3 text-sm font-normal outline-none"
                            placeholder="ค้นหาข้อมูลโครงการ..."
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                    <button className="flex items-center gap-2 h-10 px-4 rounded-[var(--ios-radius-md)] border border-[rgb(var(--ios-separator))] bg-white dark:bg-slate-800 text-[rgb(var(--ios-text-primary))] text-sm font-semibold hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors pointer-events-none opacity-80">
                        <Calendar className="w-[18px] h-[18px]" />
                        <span>ปี 2567</span>
                    </button>
                    <button className="flex items-center gap-2 h-10 px-4 rounded-[var(--ios-radius-md)] bg-[rgb(var(--ios-accent))] text-white text-sm font-bold hover:bg-opacity-90 transition-colors shadow-sm pointer-events-none opacity-80">
                        <Download className="w-[18px] h-[18px]" />
                        <span>ส่งออกข้อมูล</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card 1 */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] p-6 border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] relative overflow-hidden group hover:border-[rgb(var(--ios-accent))]/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-[var(--ios-radius-sm)] text-blue-600 dark:text-blue-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-[rgb(var(--ios-text-secondary))] text-sm font-medium mb-1">งบประมาณที่อนุมัติทั้งหมด</p>
                    <p className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] tracking-tight">{formatTHB(stats.totalApproved)}</p>
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Card 2 */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] p-6 border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] relative overflow-hidden group hover:border-[rgb(var(--ios-accent))]/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-[var(--ios-radius-sm)] text-amber-600 dark:text-amber-400">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-[rgb(var(--ios-text-secondary))] text-sm font-medium mb-1">งบประมาณโครงการที่ขอ</p>
                    <p className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] tracking-tight">{formatTHB(stats.totalRequested)}</p>
                    <div className="absolute bottom-0 left-0 h-1 bg-amber-500 w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Card 3 */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] p-6 border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] relative overflow-hidden group hover:border-[rgb(var(--ios-accent))]/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-[var(--ios-radius-sm)] text-emerald-600 dark:text-emerald-400">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-[rgb(var(--ios-text-secondary))] text-sm font-medium mb-1">จำนวนโครงการทั้งหมด</p>
                    <p className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] tracking-tight">{projects.length} โครงการ</p>
                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Treemap Card Placeholder - Preserved HTML layout adapted to JSX */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] flex flex-col h-full min-h-[500px]">
                        <div className="p-6 border-b border-[rgb(var(--ios-separator))]/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-[rgb(var(--ios-text-primary))]">สัดส่วนงบประมาณตามคณะ/หน่วยงาน</h3>
                                <p className="text-[rgb(var(--ios-text-secondary))] text-sm">ขนาดของกล่องแสดงถึงงบประมาณที่ได้รับอนุมัติ (ตัวเลขจำลองจาก Mockup)</p>
                            </div>
                        </div>
                        <div className="p-6 flex-1">
                            {/* Simulated Treemap */}
                            <div className="w-full h-full min-h-[400px] flex flex-col gap-1">
                                <div className="flex flex-1 gap-1">
                                    <div className="w-[45%] bg-blue-600 hover:bg-blue-700 transition-colors p-4 flex flex-col justify-between text-white rounded-sm group relative cursor-pointer">
                                        <span className="font-bold text-lg line-clamp-2">{t1.name}</span>
                                        <div className="flex items-end justify-between">
                                            <span className="text-2xl font-bold opacity-90">{formatSmallTHB(t1.approved)}</span>
                                            <span className="text-sm bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">{getPct(t1.approved)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1">
                                        <div className="h-[60%] w-full bg-sky-500 hover:bg-sky-600 transition-colors p-4 flex flex-col justify-between text-white rounded-sm cursor-pointer">
                                            <span className="font-bold text-lg line-clamp-1">{t2.name}</span>
                                            <div className="flex items-end justify-between">
                                                <span className="text-xl font-bold opacity-90">{formatSmallTHB(t2.approved)}</span>
                                                <span className="text-sm bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">{getPct(t2.approved)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 gap-1">
                                            <div className="flex-1 bg-indigo-500 hover:bg-indigo-600 transition-colors p-3 flex flex-col justify-between text-white rounded-sm cursor-pointer">
                                                <span className="font-bold line-clamp-1 truncate">{t3.name}</span>
                                                <div className="flex items-end justify-between w-full">
                                                    <span className="text-lg opacity-90 font-bold">{formatSmallTHB(t3.approved)}</span>
                                                    <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">{getPct(t3.approved)}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 bg-teal-500 hover:bg-teal-600 transition-colors p-3 flex flex-col justify-between text-white rounded-sm cursor-pointer">
                                                <span className="font-bold line-clamp-1 truncate">{t4.name}</span>
                                                <div className="flex items-end justify-between w-full">
                                                    <span className="text-lg opacity-90 font-bold">{formatSmallTHB(t4.approved)}</span>
                                                    <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">{getPct(t4.approved)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[120px] flex gap-1">
                                    <div className="w-[30%] bg-amber-500 hover:bg-amber-600 transition-colors p-3 text-white rounded-sm flex flex-col justify-between cursor-pointer">
                                        <span className="font-bold text-sm truncate w-full">{t5.name}</span>
                                        <div className="flex items-end justify-between w-full">
                                            <span className="text-base font-bold">{formatSmallTHB(t5.approved)}</span>
                                            <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">{getPct(t5.approved)}</span>
                                        </div>
                                    </div>
                                    <div className="w-[25%] bg-rose-500 hover:bg-rose-600 transition-colors p-3 text-white rounded-sm flex flex-col justify-between cursor-pointer">
                                        <span className="font-bold text-sm truncate w-full">{t6.name}</span>
                                        <div className="flex items-end justify-between w-full">
                                            <span className="text-base font-bold">{formatSmallTHB(t6.approved)}</span>
                                            <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">{getPct(t6.approved)}</span>
                                        </div>
                                    </div>
                                    <div className="w-[20%] bg-purple-500 hover:bg-purple-600 transition-colors p-3 text-white rounded-sm flex flex-col justify-between cursor-pointer">
                                        <span className="font-bold text-sm truncate w-full">{t7.name}</span>
                                        <div className="flex items-end justify-between w-full">
                                            <span className="text-base font-bold">{formatSmallTHB(t7.approved)}</span>
                                            <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm ml-1">{getPct(t7.approved)}</span>
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
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="flex flex-col gap-6">
                    {/* Top 5 Ministries/Orgs - Dynamic DB Driven */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] p-6">
                        <h3 className="text-lg font-bold text-[rgb(var(--ios-text-primary))] mb-6">5 อันดับคณะที่ได้งบประมาณสูงสุด (ข้อมูลจริง)</h3>
                        {top5Orgs.map((org, index: number) => {
                            const percentage = maxApproved > 0 ? (org.approved / maxApproved) * 100 : 0;
                            const barColor = colors[index % colors.length];

                            return (
                                <div key={org.name} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-[rgb(var(--ios-text-primary))] truncate max-w-[70%]">{org.name}</span>
                                        <span className="text-[rgb(var(--ios-text-primary))] font-bold">{formatTHB(org.approved)}</span>
                                    </div>
                                    <div className="w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full h-2">
                                        <div className={`${barColor} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {top5Orgs.length === 0 && (
                            <p className="text-sm text-[rgb(var(--ios-text-secondary))]">ไม่มีข้อมูล</p>
                        )}
                    </div>
                </div>

                {/* Strategic Areas Donut Chart Placeholder */}
                <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-[rgb(var(--ios-text-primary))] mb-2">สัดส่วนงบประมาณตามวิทยาเขต</h3>
                    <div className="flex-1 flex items-center justify-center relative my-4">
                        <div className="w-48 h-48 rounded-full relative" style={{ background: `conic-gradient(${finalGradient})` }}>
                            <div className="absolute inset-0 m-auto w-32 h-32 bg-[rgb(var(--ios-bg-secondary))] rounded-full flex items-center justify-center flex-col shadow-inner">
                                <span className="text-xs text-[rgb(var(--ios-text-secondary))] font-medium uppercase">รวมทั้งหมด</span>
                                <span className="text-xl font-bold text-[rgb(var(--ios-text-primary))]">100%</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 text-xs text-[rgb(var(--ios-text-secondary))] mt-4">
                        {donutData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span>{d.name} ({((d.val / cTotal) * 100).toFixed(1)}%)</span>
                            </div>
                        ))}
                        {donutData.length === 0 && <span className="text-[rgb(var(--ios-text-secondary))]">ไม่มีข้อมูล</span>}
                    </div>
                </div>
            </div>

            {/* Footer Timeline Chart (Mockup) */}
            <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 shadow-[var(--ios-shadow-sm)] p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-[rgb(var(--ios-text-primary))]">แนวโน้มงบประมาณโครงการ (5 ปีย้อนหลัง)</h3>
                        <p className="text-[rgb(var(--ios-text-secondary))] text-sm">ข้อมูลจำลองการเปรียบเทียบงบประมาณระหว่างช่วงเวลา</p>
                    </div>
                    <div className="flex gap-2 opacity-50 pointer-events-none">
                        <button className="px-3 py-1.5 text-xs font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white">ทั้งหมด</button>
                        <button className="px-3 py-1.5 text-xs font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))]">5Y</button>
                        <button className="px-3 py-1.5 text-xs font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))]">1Y</button>
                    </div>
                </div>

                <div className="h-64 w-full relative pt-8 pb-6 px-4">
                    <div className="absolute inset-x-4 inset-y-6 flex flex-col justify-between text-xs text-[rgb(var(--ios-text-tertiary))] font-mono z-0">
                        <div className="border-b border-dashed border-[rgb(var(--ios-separator))] w-full h-0 relative"><span className="absolute -left-8 -top-2">{formatSmallTHB(maxTimelineY)}</span></div>
                        <div className="border-b border-dashed border-[rgb(var(--ios-separator))] w-full h-0 relative"><span className="absolute -left-8 -top-2">{formatSmallTHB(maxTimelineY * 0.75)}</span></div>
                        <div className="border-b border-dashed border-[rgb(var(--ios-separator))] w-full h-0 relative"><span className="absolute -left-8 -top-2">{formatSmallTHB(maxTimelineY * 0.5)}</span></div>
                        <div className="border-b border-dashed border-[rgb(var(--ios-separator))] w-full h-0 relative"><span className="absolute -left-8 -top-2">{formatSmallTHB(maxTimelineY * 0.25)}</span></div>
                        <div className="border-b border-solid border-[rgb(var(--ios-separator))]/80 w-full h-0 relative"><span className="absolute -left-8 -top-2">0</span></div>
                    </div>

                    <svg className="absolute inset-x-4 inset-y-6 w-full h-[calc(100%-3rem)] z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="rgb(var(--ios-accent))" stopOpacity="0.2"></stop>
                                <stop offset="100%" stopColor="rgb(var(--ios-accent))" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        <path d={pathD} fill="url(#chart-gradient)"></path>
                        <path d={linePathD} fill="none" stroke="rgb(var(--ios-accent))" strokeWidth="0.8" vectorEffect="non-scaling-stroke"></path>

                        {svgPoints.map((p, i) => (
                            <g key={i}>
                                <circle cx={p.x} cy={p.y} fill="white" r="1.5" stroke="rgb(var(--ios-accent))" strokeWidth="0.5" vectorEffect="non-scaling-stroke"></circle>
                            </g>
                        ))}
                    </svg>

                    <div className="absolute bottom-0 left-4 right-4 flex justify-between text-xs text-[rgb(var(--ios-text-secondary))] font-medium pt-2">
                        {timelineData.map(d => (
                            <span key={d.year}>{d.year}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
}
