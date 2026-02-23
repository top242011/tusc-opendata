import Link from "next/link";
import { createPublicClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/components/public-navbar";
import { formatTHB } from "@/lib/utils";
import { Search, MapPin, Layers, Briefcase, FileText, Wallet, Percent, Users, LayoutDashboard, Share2, Download, Table2, Info } from "lucide-react";

export const revalidate = 300;

export default async function OrganizationDetailsPage(props: { searchParams?: Promise<{ name?: string }> }) {
    const searchParams = props.searchParams ? await props.searchParams : {};
    const orgNameParam = searchParams.name;
    const supabase = await createPublicClient();

    // Fetch all projects to compute unique orgs and filter
    const { data: allProjectsData } = await supabase
        .from('projects')
        .select('*')
        .order('budget_requested', { ascending: false });

    const allProjects = allProjectsData || [];
    const uniqueOrgs = Array.from(new Set(allProjects.map(p => p.organization))).sort();

    // Determine which organization to display
    const ORG_NAME = orgNameParam && uniqueOrgs.includes(orgNameParam) ? orgNameParam : (uniqueOrgs.length > 0 ? uniqueOrgs[0] : "ไม่พบข้อมูล");

    // Filter projects for the selected organization
    const projects = allProjects.filter(p => p.organization === ORG_NAME);

    const totalRequested = projects.reduce((sum, p) => sum + Number(p.budget_requested), 0);
    const totalApproved = projects.reduce((sum, p) => sum + Number(p.budget_approved), 0);
    const totalCut = projects.reduce((sum, p) => sum + (p.budget_approved < p.budget_requested ? Number(p.budget_requested) - Number(p.budget_approved) : 0), 0);
    const totalProjects = projects.length;
    const approvalRate = totalRequested > 0 ? (totalApproved / totalRequested) * 100 : 0;

    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] pb-20 font-sans antialiased">
            <PublicNavbar />

            <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">

                {/* Sidebar Info */}
                <aside className="w-full md:w-80 flex-shrink-0 space-y-6">
                    {/* Organization Selector */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 shadow-[var(--ios-shadow-sm)]">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> เลือกหน่วยงาน
                        </h3>
                        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                            {uniqueOrgs.map(org => (
                                <Link key={org} href={`/organizations?name=${encodeURIComponent(org)}`} className={`block text-sm px-3 py-2 rounded-[var(--ios-radius-sm)] transition-colors ${org === ORG_NAME ? 'bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] font-bold' : 'text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))] hover:text-[rgb(var(--ios-text-primary))]'}`}>
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
                        <h1 className="text-xl font-bold mb-1 text-[rgb(var(--ios-text-primary))]">{ORG_NAME}</h1>
                        <p className="text-[rgb(var(--ios-text-secondary))] text-sm mb-4">กลุ่มวิทยาศาสตร์สุขภาพ</p>

                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            <span className="bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] text-xs font-semibold px-2.5 py-1 rounded-[var(--ios-radius-sm)] flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> ศูนย์รังสิต
                            </span>
                            <span className="bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] text-xs font-semibold px-2.5 py-1 rounded-[var(--ios-radius-sm)]">
                                วิชาการ
                            </span>
                        </div>

                        <div className="w-full h-px bg-[rgb(var(--ios-separator))]/50 mb-6"></div>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> โครงการเสนอขอ</span>
                                <span className="font-bold text-[rgb(var(--ios-text-primary))]">{projects.length} โครงการ</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex items-center gap-1.5"><FileText className="w-4 h-4" /> โครงการที่อนุมัติ</span>
                                <span className="font-bold text-[rgb(var(--ios-green))]">{projects.filter(p => p.status === 'อนุมัติ' || p.budget_approved > 0).length} โครงการ</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex items-center gap-1.5"><Wallet className="w-4 h-4" /> งบที่ได้รับอนุมัติ (2567)</span>
                                <span className="font-bold text-[rgb(var(--ios-text-primary))]">{formatTHB(totalApproved)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[rgb(var(--ios-text-secondary))] flex items-center gap-1.5"><Percent className="w-4 h-4" /> อัตราการอนุมัติ</span>
                                <span className="font-bold text-[rgb(var(--ios-green))]">{approvalRate.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact/About */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)]">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))] mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" /> ข้อมูลทั่วไป
                        </h3>
                        <p className="text-sm text-[rgb(var(--ios-text-secondary))] leading-relaxed mb-4">
                            รับผิดชอบการจัดการเรียนการสอน การวิจัย และการบริการวิชาการทางด้านแพทยศาสตร์และวิทยาศาสตร์สุขภาพ
                        </p>
                        <a href="#" className="text-[rgb(var(--ios-accent))] text-sm font-semibold hover:underline flex items-center gap-1 pointer-events-none opacity-50">
                            med.tu.ac.th <Search className="w-3 h-3" />
                        </a>
                    </div>
                </aside>

                {/* Main Content Dashboard */}
                <div className="flex-1 space-y-6">

                    {/* Header Stats */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center shadow-[var(--ios-shadow-sm)]">
                        <div>
                            <h2 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))] mb-1">ภาพรวมงบประมาณ ปี 2567</h2>
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

                    {/* Budget Categorization Chart (Placeholder) */}
                    <div className="w-full bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-2">
                                สัดส่วนการใช้งบประมาณตามประเภท
                            </h3>
                            <button className="text-[rgb(var(--ios-accent))] text-xs font-semibold pointer-events-none">ดูรายละเอียด</button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Bar 1 */}
                            <div>
                                <div className="flex justify-between text-sm mb-1.5 font-medium">
                                    <span className="text-[rgb(var(--ios-text-primary))] text-sm">การจัดการเรียนการสอนและพัฒนานักศึกษา</span>
                                    <span className="text-[rgb(var(--ios-text-primary))]">{formatTHB(totalApproved * 0.45)}</span>
                                </div>
                                <div className="h-2.5 w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full overflow-hidden">
                                    <div className="h-full bg-[rgb(var(--ios-accent))]" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            {/* Bar 2 */}
                            <div>
                                <div className="flex justify-between text-sm mb-1.5 font-medium">
                                    <span className="text-[rgb(var(--ios-text-primary))] text-sm">การวิจัยและนวัตกรรม</span>
                                    <span className="text-[rgb(var(--ios-text-primary))]">{formatTHB(totalApproved * 0.35)}</span>
                                </div>
                                <div className="h-2.5 w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500" style={{ width: '35%' }}></div>
                                </div>
                            </div>
                            {/* Bar 3 */}
                            <div>
                                <div className="flex justify-between text-sm mb-1.5 font-medium">
                                    <span className="text-[rgb(var(--ios-text-primary))] text-sm">จัดซื้อครุภัณฑ์การแพทย์และวิทยาศาตร์</span>
                                    <span className="text-[rgb(var(--ios-text-primary))]">{formatTHB(totalApproved * 0.15)}</span>
                                </div>
                                <div className="h-2.5 w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: '15%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects List Menu */}
                    <div className="flex justify-between items-end mt-8 mb-4">
                        <h3 className="text-xl font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-2">
                            <Table2 className="w-5 h-5 text-[rgb(var(--ios-accent))]" /> รายการโครงการ
                        </h3>

                        <div className="flex items-center gap-2">
                            <div className="relative pointer-events-none">
                                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />
                                <input type="text" placeholder="ค้นหาโครงการ..." className="w-48 sm:w-64 pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-md)] focus:outline-none focus:border-[rgb(var(--ios-accent))] focus:ring-1 focus:ring-[rgb(var(--ios-accent))] text-[rgb(var(--ios-text-primary))] placeholder:text-[rgb(var(--ios-text-tertiary))]" />
                            </div>
                        </div>
                    </div>

                    {/* Projects Table View */}
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[rgb(var(--ios-fill-tertiary))] border-b border-[rgb(var(--ios-separator))]/50text-xs uppercase tracking-wider text-[rgb(var(--ios-text-secondary))]">
                                        <th className="p-4 font-bold">ชื่อโครงการ</th>
                                        <th className="p-4 font-bold text-right">งบที่ขอ</th>
                                        <th className="p-4 font-bold text-right">ส่วนที่อนุมัติ</th>
                                        <th className="p-4 font-bold text-center">สถานะ</th>
                                        <th className="p-4 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgb(var(--ios-separator))]/30">
                                    {projects.map((proj) => {
                                        let statusBadge = "";
                                        if (proj.status === "อนุมัติ" || proj.budget_approved === proj.budget_requested) {
                                            statusBadge = "bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))] border-[rgb(var(--ios-green))]/20";
                                        } else if (proj.status === "ไม่อนุมัติ") {
                                            statusBadge = "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                                        } else {
                                            statusBadge = "bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))] border-[rgb(var(--ios-red))]/20";
                                        }

                                        return (
                                            <tr key={proj.id} className="hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors group">
                                                <td className="p-4">
                                                    <p className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] line-clamp-2 leading-snug">{proj.project_name}</p>
                                                </td>
                                                <td className="p-4 text-right align-top">
                                                    <span className="text-sm text-[rgb(var(--ios-text-secondary))] font-mono">{formatTHB(Number(proj.budget_requested))}</span>
                                                </td>
                                                <td className="p-4 text-right align-top">
                                                    <span className="text-sm font-bold text-[rgb(var(--ios-text-primary))] font-mono">{formatTHB(Number(proj.budget_approved))}</span>
                                                </td>
                                                <td className="p-4 text-center align-top">
                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${statusBadge}`}>
                                                        {proj.status === 'อนุมัติ' ? 'อนุมัติเต็มจำนวน' : (proj.budget_approved > 0 ? 'ตัดงบบางส่วน' : 'ไม่อนุมัติ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center align-top">
                                                    <div className="flex gap-2 justify-end opacity-50 pointer-events-none">
                                                        <button className="text-[rgb(var(--ios-text-quaternary))] cursor-not-allowed">
                                                            <Download className="w-[18px] h-[18px]" />
                                                        </button>
                                                        <button className="text-[rgb(var(--ios-text-quaternary))] cursor-not-allowed">
                                                            <Share2 className="w-[18px] h-[18px]" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {projects.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-[rgb(var(--ios-text-tertiary))] text-sm">
                                                ไม่พบข้อมูลโครงการสำหรับหน่วยงานนี้ในปี 2567
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination placeholder */}
                        {projects.length > 0 && (
                            <div className="px-4 py-3 border-t border-[rgb(var(--ios-separator))]/50 flex items-center justify-between text-sm text-[rgb(var(--ios-text-secondary))] bg-[rgb(var(--ios-bg-secondary))]">
                                <span>แสดง 1 ถึง {projects.length} จาก {projects.length} รายการ</span>
                                <div className="flex gap-1 opacity-50 pointer-events-none">
                                    <button className="px-2 py-1 border border-[rgb(var(--ios-separator))] rounded bg-white dark:bg-slate-800 text-[rgb(var(--ios-text-tertiary))] cursor-not-allowed text-xs">&lt;</button>
                                    <button className="px-3 py-1 border border-[rgb(var(--ios-accent))] rounded bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] font-bold text-xs">1</button>
                                    <button className="px-2 py-1 border border-[rgb(var(--ios-separator))] rounded bg-white dark:bg-slate-800 text-[rgb(var(--ios-text-tertiary))] cursor-not-allowed text-xs">&gt;</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
