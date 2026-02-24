import Link from "next/link";
import { createPublicClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/components/public-navbar";
import { formatTHB } from "@/lib/utils";
import { ProjectRowActions } from "@/components/project-row-actions";
import { CAMPUS_LABELS, Campus } from "@/lib/types";
import { Search, MapPin, Layers, Briefcase, FileText, Wallet, Percent, Table2, Info } from "lucide-react";

export const revalidate = 300;

export default async function OrganizationDetailsPage(props: { searchParams?: Promise<{ name?: string; q?: string }> }) {
    const searchParams = props.searchParams ? await props.searchParams : {};
    const orgNameParam = searchParams.name;
    const qParam = searchParams.q;
    const supabase = await createPublicClient();

    const { data: allProjectsData } = await supabase
        .from('projects')
        .select('*')
        .order('budget_requested', { ascending: false });

    const allProjects = allProjectsData || [];
    const uniqueOrgs = Array.from(new Set(allProjects.map((p: any) => p.organization))).sort() as string[];

    const ORG_NAME = orgNameParam && uniqueOrgs.includes(orgNameParam)
        ? orgNameParam
        : (uniqueOrgs.length > 0 ? uniqueOrgs[0] : "ไม่พบข้อมูล");

    // All projects for this org — used for stats & profile metadata (not affected by search)
    const allOrgProjects = allProjects.filter((p: any) => p.organization === ORG_NAME);

    // Display projects — filtered by search query for the table
    const displayProjects = qParam?.trim()
        ? allOrgProjects.filter((p: any) =>
            p.project_name.toLowerCase().includes(qParam.toLowerCase())
          )
        : allOrgProjects;

    // --- Stats from ALL org projects (unaffected by search filter) ---
    const totalRequested = allOrgProjects.reduce((sum: number, p: any) => sum + Number(p.budget_requested), 0);
    const totalApproved = allOrgProjects.reduce((sum: number, p: any) => sum + Number(p.budget_approved), 0);
    const approvalRate = totalRequested > 0 ? (totalApproved / totalRequested) * 100 : 0;

    // Latest fiscal year
    const latestFiscalYear = allOrgProjects.length > 0
        ? Math.max(...allOrgProjects.map((p: any) => Number(p.fiscal_year) || 0))
        : 2567;

    // All fiscal years with data
    const fiscalYears = [...new Set(
        allOrgProjects.map((p: any) => p.fiscal_year).filter(Boolean)
    )].sort() as number[];

    // Most common campus
    const campusCount = allOrgProjects.reduce((acc: Record<string, number>, p: any) => {
        if (p.campus) acc[p.campus] = (acc[p.campus] || 0) + 1;
        return acc;
    }, {});
    const primaryCampus = Object.entries(campusCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] as Campus | undefined;

    // Most common activity type (for profile badge)
    const activityCountMap = allOrgProjects.reduce((acc: Record<string, number>, p: any) => {
        if (p.activity_type?.trim()) acc[p.activity_type.trim()] = (acc[p.activity_type.trim()] || 0) + 1;
        return acc;
    }, {});
    const primaryActivityType = Object.entries(activityCountMap)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

    // --- Budget chart data ---
    // Try activity_type first; fall back to status if no activity data
    const activityBudgetMap = allOrgProjects.reduce((acc: Record<string, number>, p: any) => {
        const key = p.activity_type?.trim() || '';
        if (key) acc[key] = (acc[key] || 0) + Number(p.budget_approved);
        return acc;
    }, {});

    const hasActivityData = Object.keys(activityBudgetMap).length > 0;

    const budgetChartData: { label: string; amount: number; pct: number; colorClass: string }[] = hasActivityData
        ? Object.entries(activityBudgetMap)
            .map(([label, amount]) => ({
                label,
                amount,
                pct: totalApproved > 0 ? (amount / totalApproved) * 100 : 0,
                colorClass: '',
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4)
        : [
            {
                label: 'อนุมัติเต็มจำนวน',
                amount: allOrgProjects
                    .filter((p: any) => p.status === 'อนุมัติ' || p.budget_approved === p.budget_requested)
                    .reduce((s: number, p: any) => s + Number(p.budget_approved), 0),
                pct: 0,
                colorClass: 'bg-[rgb(var(--ios-green))]',
            },
            {
                label: 'ตัดงบบางส่วน',
                amount: allOrgProjects
                    .filter((p: any) => Number(p.budget_approved) > 0 && p.status !== 'อนุมัติ' && p.budget_approved < p.budget_requested)
                    .reduce((s: number, p: any) => s + Number(p.budget_approved), 0),
                pct: 0,
                colorClass: 'bg-[rgb(var(--ios-orange))]',
            },
            {
                label: 'งบที่ถูกตัด/ไม่อนุมัติ',
                amount: allOrgProjects.reduce((s: number, p: any) =>
                    s + Math.max(0, Number(p.budget_requested) - Number(p.budget_approved)), 0),
                pct: 0,
                colorClass: 'bg-slate-400',
            },
        ].filter(d => d.amount > 0)
         .map(d => ({
             ...d,
             pct: totalRequested > 0 ? (d.amount / totalRequested) * 100 : 0,
         }));

    const activityBarColors = ['bg-[rgb(var(--ios-accent))]', 'bg-sky-500', 'bg-indigo-500', 'bg-amber-500'];
    if (hasActivityData) {
        budgetChartData.forEach((d, i) => { d.colorClass = activityBarColors[i] ?? 'bg-slate-400'; });
    }

    const budgetChartTitle = hasActivityData
        ? 'สัดส่วนการใช้งบประมาณตามประเภทกิจกรรม'
        : 'สัดส่วนงบประมาณตามสถานะการอนุมัติ';

    const currentYear = new Date().getFullYear();

    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] pb-20 font-sans antialiased">
            <PublicNavbar />

            <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
                <aside className="w-full md:w-80 flex-shrink-0 space-y-6">
                    {/* Organization Selector */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 shadow-[var(--ios-shadow-sm)]">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> เลือกหน่วยงาน
                        </h3>
                        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                            {uniqueOrgs.map(org => (
                                <Link
                                    key={org}
                                    href={`/organizations?name=${encodeURIComponent(org)}`}
                                    className={`block text-sm px-3 py-2 rounded-[var(--ios-radius-sm)] transition-colors ${org === ORG_NAME
                                        ? 'bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] font-bold'
                                        : 'text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))] hover:text-[rgb(var(--ios-text-primary))]'
                                    }`}
                                >
                                    {org}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 flex flex-col items-center text-center shadow-[var(--ios-shadow-sm)]">
                        <div className="size-24 bg-[rgb(var(--ios-accent))]/10 rounded-full flex items-center justify-center mb-4 text-[rgb(var(--ios-accent))]">
                            <Layers className="w-12 h-12" />
                        </div>
                        <h1 className="text-xl font-bold mb-4 text-[rgb(var(--ios-text-primary))] leading-snug">{ORG_NAME}</h1>

                        {/* Dynamic badges from real data */}
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {primaryCampus && CAMPUS_LABELS[primaryCampus] && (
                                <span className="bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] text-xs font-semibold px-2.5 py-1 rounded-[var(--ios-radius-sm)] flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {CAMPUS_LABELS[primaryCampus]}
                                </span>
                            )}
                            {primaryActivityType && (
                                <span className="bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] text-xs font-semibold px-2.5 py-1 rounded-[var(--ios-radius-sm)]">
                                    {primaryActivityType}
                                </span>
                            )}
                        </div>

                        <div className="w-full h-px bg-[rgb(var(--ios-separator))]/50 mb-6"></div>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" /> โครงการเสนอขอ
                                </span>
                                <span className="font-bold text-[rgb(var(--ios-text-primary))]">{allOrgProjects.length} โครงการ</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex items-center gap-1.5">
                                    <FileText className="w-4 h-4" /> โครงการที่อนุมัติ
                                </span>
                                <span className="font-bold text-[rgb(var(--ios-green))]">
                                    {allOrgProjects.filter((p: any) => p.status === 'อนุมัติ' || Number(p.budget_approved) > 0).length} โครงการ
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex items-center gap-1.5">
                                    <Wallet className="w-4 h-4" /> งบที่ได้รับอนุมัติ ({latestFiscalYear})
                                </span>
                                <span className="font-bold text-[rgb(var(--ios-text-primary))]">{formatTHB(totalApproved)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex items-center gap-1.5">
                                    <Percent className="w-4 h-4" /> อัตราการอนุมัติ
                                </span>
                                <span className="font-bold text-[rgb(var(--ios-green))]">{approvalRate.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* General Info — dynamic from real data */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)]">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" /> ข้อมูลทั่วไป
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex-shrink-0">ปีงบประมาณล่าสุด</span>
                                <span className="font-semibold">{latestFiscalYear}</span>
                            </div>
                            {fiscalYears.length > 1 && (
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-[rgb(var(--ios-text-secondary))] flex-shrink-0">ช่วงปีที่มีข้อมูล</span>
                                    <span className="font-semibold text-right">
                                        {fiscalYears[0]}–{fiscalYears[fiscalYears.length - 1]}
                                    </span>
                                </div>
                            )}
                            {primaryCampus && CAMPUS_LABELS[primaryCampus] && (
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-[rgb(var(--ios-text-secondary))] flex-shrink-0">วิทยาเขตหลัก</span>
                                    <span className="font-semibold">{CAMPUS_LABELS[primaryCampus]}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex-shrink-0">งบรวมที่เสนอขอ</span>
                                <span className="font-semibold text-right">{formatTHB(totalRequested)}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Header Stats */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center shadow-[var(--ios-shadow-sm)]">
                        <div>
                            <h2 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))] mb-1">
                                ภาพรวมงบประมาณ ปี {latestFiscalYear}
                            </h2>
                            <p className="text-[rgb(var(--ios-text-secondary))] text-sm">ข้อมูลการเสนอขอและการอนุมัติงบประมาณของหน่วยงาน</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[rgb(var(--ios-text-tertiary))] text-xs font-semibold uppercase tracking-wider mb-1">เสนอขอ (Request)</p>
                                <p className="text-xl font-bold text-[rgb(var(--ios-text-primary))]">{formatTHB(totalRequested)}</p>
                            </div>
                            <div className="w-px bg-[rgb(var(--ios-separator))]/50"></div>
                            <div className="text-right">
                                <p className="text-[rgb(var(--ios-text-tertiary))] text-xs font-semibold uppercase tracking-wider mb-1">อนุมัติ (Approved)</p>
                                <p className="text-xl font-bold text-[rgb(var(--ios-green))]">{formatTHB(totalApproved)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Budget Chart — dynamic from real data */}
                    {budgetChartData.length > 0 && (
                        <div className="w-full bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)]">
                            <h3 className="font-bold text-[rgb(var(--ios-text-primary))] mb-6">{budgetChartTitle}</h3>
                            <div className="flex flex-col gap-4">
                                {budgetChartData.map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                                            <span className="text-[rgb(var(--ios-text-primary))] text-sm truncate max-w-[60%]" title={item.label}>
                                                {item.label}
                                            </span>
                                            <span className="text-[rgb(var(--ios-text-primary))]">{formatTHB(item.amount)}</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.colorClass} transition-all`}
                                                style={{ width: `${Math.min(item.pct, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">{item.pct.toFixed(1)}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Table */}
                    <div className="flex justify-between items-end mt-8 mb-4">
                        <h3 className="text-xl font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-2">
                            <Table2 className="w-5 h-5 text-[rgb(var(--ios-accent))]" /> รายการโครงการ
                            {qParam && (
                                <span className="text-sm font-normal text-[rgb(var(--ios-text-secondary))]">
                                    ({displayProjects.length} ผลลัพธ์)
                                </span>
                            )}
                        </h3>

                        <form action="/organizations" method="get" className="flex items-center gap-2">
                            <input type="hidden" name="name" value={ORG_NAME} />
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={qParam || ""}
                                    placeholder="ค้นหาโครงการ..."
                                    className="w-48 sm:w-64 pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-md)] focus:outline-none focus:border-[rgb(var(--ios-accent))] focus:ring-1 focus:ring-[rgb(var(--ios-accent))] text-[rgb(var(--ios-text-primary))] placeholder:text-[rgb(var(--ios-text-tertiary))]"
                                />
                            </div>
                        </form>
                    </div>

                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[rgb(var(--ios-fill-tertiary))] border-b border-[rgb(var(--ios-separator))]/50 text-xs uppercase tracking-wider text-[rgb(var(--ios-text-secondary))]">
                                        <th className="p-4 font-bold">ชื่อโครงการ</th>
                                        <th className="p-4 font-bold text-right">งบที่ขอ</th>
                                        <th className="p-4 font-bold text-right">ส่วนที่อนุมัติ</th>
                                        <th className="p-4 font-bold text-center">สถานะ</th>
                                        <th className="p-4 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgb(var(--ios-separator))]/30">
                                    {displayProjects.map((proj: any) => {
                                        let statusBadge = "";
                                        if (proj.status === "อนุมัติ" || proj.budget_approved === proj.budget_requested) {
                                            statusBadge = "bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))] border-[rgb(var(--ios-green))]/20";
                                        } else if (proj.status === "ไม่อนุมัติ") {
                                            statusBadge = "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                                        } else {
                                            statusBadge = "bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))] border-[rgb(var(--ios-red))]/20";
                                        }

                                        return (
                                            <tr key={proj.id} className="hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors">
                                                <td className="p-4">
                                                    <p className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] line-clamp-2 leading-snug">{proj.project_name}</p>
                                                    {proj.fiscal_year && (
                                                        <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-0.5">ปี {proj.fiscal_year}</p>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right align-top">
                                                    <span className="text-sm text-[rgb(var(--ios-text-secondary))] font-mono">{formatTHB(Number(proj.budget_requested))}</span>
                                                </td>
                                                <td className="p-4 text-right align-top">
                                                    <span className="text-sm font-bold text-[rgb(var(--ios-text-primary))] font-mono">{formatTHB(Number(proj.budget_approved))}</span>
                                                </td>
                                                <td className="p-4 text-center align-top">
                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${statusBadge}`}>
                                                        {proj.status === 'อนุมัติ' ? 'อนุมัติเต็มจำนวน' : (Number(proj.budget_approved) > 0 ? 'ตัดงบบางส่วน' : 'ไม่อนุมัติ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center align-top">
                                                    <ProjectRowActions
                                                        projectName={proj.project_name}
                                                        organization={proj.organization}
                                                        budgetRequested={Number(proj.budget_requested)}
                                                        budgetApproved={Number(proj.budget_approved)}
                                                        status={proj.status}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {displayProjects.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-[rgb(var(--ios-text-tertiary))] text-sm">
                                                {qParam
                                                    ? `ไม่พบโครงการที่ตรงกับ "${qParam}"`
                                                    : "ไม่พบข้อมูลโครงการสำหรับหน่วยงานนี้"
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {displayProjects.length > 0 && (
                            <div className="px-4 py-3 border-t border-[rgb(var(--ios-separator))]/50 flex items-center justify-between text-sm text-[rgb(var(--ios-text-secondary))] bg-[rgb(var(--ios-bg-secondary))]">
                                <span>แสดง {displayProjects.length} จาก {allOrgProjects.length} รายการ</span>
                                <div className="flex gap-1">
                                    <button className="px-2 py-1 border border-[rgb(var(--ios-separator))] rounded bg-white dark:bg-slate-800 text-[rgb(var(--ios-text-tertiary))] text-xs opacity-40 cursor-default">&lt;</button>
                                    <button className="px-3 py-1 border border-[rgb(var(--ios-accent))] rounded bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] font-bold text-xs">1</button>
                                    <button className="px-2 py-1 border border-[rgb(var(--ios-separator))] rounded bg-white dark:bg-slate-800 text-[rgb(var(--ios-text-tertiary))] text-xs opacity-40 cursor-default">&gt;</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
