import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/components/public-navbar";
import { Footer } from "@/components/footer";
import { formatTHB } from "@/lib/utils";
import { CAMPUS_LABELS, Campus } from "@/lib/types";
import { MapPin, Briefcase, Wallet, Percent, Building2, Table2, ArrowLeft, FileText } from "lucide-react";

export const revalidate = 300;

const VALID_CAMPUSES = Object.keys(CAMPUS_LABELS) as Campus[];

export function generateStaticParams() {
    return VALID_CAMPUSES.map((slug) => ({ slug }));
}

export default async function CampusDetailPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;

    if (!VALID_CAMPUSES.includes(slug as Campus)) {
        notFound();
    }

    const campus = slug as Campus;
    const campusLabel = CAMPUS_LABELS[campus];

    const supabase = await createPublicClient();
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('campus', campus)
        .order('budget_requested', { ascending: false });

    const allProjects = projects || [];

    // Stats
    const totalRequested = allProjects.reduce((sum: number, p: any) => sum + Number(p.budget_requested), 0);
    const totalApproved = allProjects.reduce((sum: number, p: any) => sum + Number(p.budget_approved), 0);
    const approvalRate = totalRequested > 0 ? (totalApproved / totalRequested) * 100 : 0;
    const approvedCount = allProjects.filter((p: any) => p.status === 'อนุมัติ' || Number(p.budget_approved) > 0).length;

    // Top organizations by project count
    const orgCount: Record<string, { count: number; approved: number; requested: number }> = {};
    allProjects.forEach((p: any) => {
        if (p.organization) {
            if (!orgCount[p.organization]) {
                orgCount[p.organization] = { count: 0, approved: 0, requested: 0 };
            }
            orgCount[p.organization].count += 1;
            orgCount[p.organization].approved += Number(p.budget_approved);
            orgCount[p.organization].requested += Number(p.budget_requested);
        }
    });
    const topOrganizations = Object.entries(orgCount)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.approved - a.approved)
        .slice(0, 10);

    // Fiscal years
    const fiscalYears = [...new Set(allProjects.map((p: any) => p.fiscal_year).filter(Boolean))].sort() as number[];
    const latestFiscalYear = fiscalYears.length > 0 ? Math.max(...fiscalYears.map(Number)) : null;

    const currentYear = new Date().getFullYear();

    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] pb-20 font-sans antialiased">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[rgb(var(--ios-accent))]/5 via-[rgb(var(--ios-bg-grouped))] to-[rgb(var(--ios-accent))]/10 border-b border-[rgb(var(--ios-separator))]/40">
                <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
                    <Link
                        href="/campus"
                        className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--ios-accent))] hover:underline mb-4 ios-press"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        ศูนย์การศึกษาทั้งหมด
                    </Link>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-12 bg-[rgb(var(--ios-accent))]/10 rounded-[var(--ios-radius-md)] flex items-center justify-center text-[rgb(var(--ios-accent))]">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[rgb(var(--ios-text-primary))] tracking-tight">
                                ศูนย์การศึกษา{campusLabel}
                            </h1>
                            <p className="text-[rgb(var(--ios-text-secondary))] text-sm mt-0.5">
                                {allProjects.length} โครงการ
                                {latestFiscalYear ? ` \u00B7 ปีงบประมาณล่าสุด ${latestFiscalYear}` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 shadow-[var(--ios-shadow-sm)]">
                        <div className="flex items-center gap-2 text-[rgb(var(--ios-text-tertiary))] mb-2">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">โครงการทั้งหมด</span>
                        </div>
                        <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">{allProjects.length}</p>
                    </div>
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 shadow-[var(--ios-shadow-sm)]">
                        <div className="flex items-center gap-2 text-[rgb(var(--ios-text-tertiary))] mb-2">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">งบเสนอขอ</span>
                        </div>
                        <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))] font-mono">{formatTHB(totalRequested)}</p>
                    </div>
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 shadow-[var(--ios-shadow-sm)]">
                        <div className="flex items-center gap-2 text-[rgb(var(--ios-text-tertiary))] mb-2">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">งบอนุมัติ</span>
                        </div>
                        <p className="text-2xl font-bold text-[rgb(var(--ios-green))] font-mono">{formatTHB(totalApproved)}</p>
                    </div>
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-5 shadow-[var(--ios-shadow-sm)]">
                        <div className="flex items-center gap-2 text-[rgb(var(--ios-text-tertiary))] mb-2">
                            <Percent className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">อัตราอนุมัติ</span>
                        </div>
                        <p className="text-2xl font-bold text-[rgb(var(--ios-green))]">{approvalRate.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Top Organizations */}
                {topOrganizations.length > 0 && (
                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)]">
                        <h2 className="text-lg font-bold text-[rgb(var(--ios-text-primary))] mb-5 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                            หน่วยงานที่ได้รับงบประมาณสูงสุด
                        </h2>
                        <div className="space-y-3">
                            {topOrganizations.map((org, index) => {
                                const maxApproved = topOrganizations[0]?.approved || 1;
                                const barWidth = (org.approved / maxApproved) * 100;
                                return (
                                    <div key={org.name}>
                                        <div className="flex justify-between items-baseline mb-1.5">
                                            <Link
                                                href={`/organizations?name=${encodeURIComponent(org.name)}`}
                                                className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] hover:text-[rgb(var(--ios-accent))] transition-colors truncate max-w-[55%]"
                                                title={org.name}
                                            >
                                                <span className="text-[rgb(var(--ios-text-tertiary))] mr-2">{index + 1}.</span>
                                                {org.name}
                                            </Link>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-[rgb(var(--ios-text-tertiary))]">{org.count} โครงการ</span>
                                                <span className="font-bold text-[rgb(var(--ios-text-primary))] font-mono">{formatTHB(org.approved)}</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-[rgb(var(--ios-fill-tertiary))] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[rgb(var(--ios-accent))] rounded-full transition-all"
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Projects Table */}
                <div>
                    <h2 className="text-xl font-bold text-[rgb(var(--ios-text-primary))] mb-4 flex items-center gap-2">
                        <Table2 className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        รายการโครงการ
                        <span className="text-sm font-normal text-[rgb(var(--ios-text-secondary))]">
                            ({allProjects.length} รายการ)
                        </span>
                    </h2>

                    <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden shadow-[var(--ios-shadow-sm)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[rgb(var(--ios-fill-tertiary))] border-b border-[rgb(var(--ios-separator))]/50 text-xs uppercase tracking-wider text-[rgb(var(--ios-text-secondary))]">
                                        <th className="p-4 font-bold">ชื่อโครงการ</th>
                                        <th className="p-4 font-bold">หน่วยงาน</th>
                                        <th className="p-4 font-bold text-right">งบที่ขอ</th>
                                        <th className="p-4 font-bold text-right">งบอนุมัติ</th>
                                        <th className="p-4 font-bold text-center">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgb(var(--ios-separator))]/30">
                                    {allProjects.map((proj: any) => {
                                        let statusBadge = "";
                                        let statusLabel = "";
                                        if (proj.status === "อนุมัติ" || proj.budget_approved === proj.budget_requested) {
                                            statusBadge = "bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))] border-[rgb(var(--ios-green))]/20";
                                            statusLabel = "อนุมัติเต็มจำนวน";
                                        } else if (proj.status === "ไม่อนุมัติ" || Number(proj.budget_approved) === 0) {
                                            statusBadge = "bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-secondary))] border-[rgb(var(--ios-separator))]/50";
                                            statusLabel = "ไม่อนุมัติ";
                                        } else {
                                            statusBadge = "bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))] border-[rgb(var(--ios-red))]/20";
                                            statusLabel = "ตัดงบบางส่วน";
                                        }

                                        return (
                                            <tr key={proj.id} className="hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors">
                                                <td className="p-4">
                                                    <p className="text-sm font-semibold text-[rgb(var(--ios-text-primary))] line-clamp-2 leading-snug">{proj.project_name}</p>
                                                    {proj.fiscal_year && (
                                                        <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-0.5">ปี {proj.fiscal_year}</p>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <Link
                                                        href={`/organizations?name=${encodeURIComponent(proj.organization)}`}
                                                        className="text-sm text-[rgb(var(--ios-accent))] hover:underline"
                                                    >
                                                        {proj.organization}
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-right align-top">
                                                    <span className="text-sm text-[rgb(var(--ios-text-secondary))] font-mono">{formatTHB(Number(proj.budget_requested))}</span>
                                                </td>
                                                <td className="p-4 text-right align-top">
                                                    <span className="text-sm font-bold text-[rgb(var(--ios-text-primary))] font-mono">{formatTHB(Number(proj.budget_approved))}</span>
                                                </td>
                                                <td className="p-4 text-center align-top">
                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${statusBadge}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {allProjects.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-[rgb(var(--ios-text-tertiary))] text-sm">
                                                ไม่พบข้อมูลโครงการสำหรับศูนย์การศึกษานี้
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {allProjects.length > 0 && (
                            <div className="px-4 py-3 border-t border-[rgb(var(--ios-separator))]/50 flex items-center justify-between text-sm text-[rgb(var(--ios-text-secondary))] bg-[rgb(var(--ios-bg-secondary))]">
                                <span>แสดง {allProjects.length} รายการ</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
