import Link from "next/link";
import { createPublicClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/components/public-navbar";
import { formatTHB } from "@/lib/utils";
import { CAMPUS_LABELS, Campus } from "@/lib/types";
import { MapPin, Briefcase, Wallet, Percent, ArrowRight, Building2 } from "lucide-react";

export const revalidate = 300;

interface CampusStats {
    totalProjects: number;
    totalRequested: number;
    totalApproved: number;
    approvalRate: number;
    topOrganization: string | null;
}

export default async function CampusLandingPage() {
    const supabase = await createPublicClient();
    const { data: projects } = await supabase.from('projects').select('*');

    const allProjects = projects || [];

    // Calculate per-campus stats
    const campusKeys = Object.keys(CAMPUS_LABELS) as Campus[];
    const campusStats: Record<Campus, CampusStats> = {} as Record<Campus, CampusStats>;

    for (const campus of campusKeys) {
        const campusProjects = allProjects.filter((p: any) => p.campus === campus);
        const totalRequested = campusProjects.reduce((sum: number, p: any) => sum + Number(p.budget_requested), 0);
        const totalApproved = campusProjects.reduce((sum: number, p: any) => sum + Number(p.budget_approved), 0);
        const approvalRate = totalRequested > 0 ? (totalApproved / totalRequested) * 100 : 0;

        // Find top organization by number of projects
        const orgCount: Record<string, number> = {};
        campusProjects.forEach((p: any) => {
            if (p.organization) {
                orgCount[p.organization] = (orgCount[p.organization] || 0) + 1;
            }
        });
        const topOrganization = Object.entries(orgCount)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        campusStats[campus] = {
            totalProjects: campusProjects.length,
            totalRequested,
            totalApproved,
            approvalRate,
            topOrganization,
        };
    }

    const currentYear = new Date().getFullYear();

    return (
        <main className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] pb-20 font-sans antialiased">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[rgb(var(--ios-accent))]/5 via-[rgb(var(--ios-bg-grouped))] to-[rgb(var(--ios-accent))]/10 border-b border-[rgb(var(--ios-separator))]/40">
                <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 text-center">
                    <div className="inline-flex items-center gap-2 bg-[rgb(var(--ios-accent))]/10 text-[rgb(var(--ios-accent))] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                        <MapPin className="w-4 h-4" />
                        Campus Overview
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[rgb(var(--ios-text-primary))] mb-3 tracking-tight">
                        ศูนย์การศึกษา มหาวิทยาลัยธรรมศาสตร์
                    </h1>
                    <p className="text-[rgb(var(--ios-text-secondary))] text-base md:text-lg max-w-2xl mx-auto">
                        ภาพรวมงบประมาณและโครงการแยกตามศูนย์การศึกษา
                    </p>
                </div>
            </section>

            {/* Campus Cards Grid */}
            <section className="container mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campusKeys.map((campus) => {
                        const stats = campusStats[campus];
                        return (
                            <Link
                                key={campus}
                                href={`/campus/${campus}`}
                                className="group bg-[rgb(var(--ios-bg-secondary))] rounded-[var(--ios-radius-lg)] border border-[rgb(var(--ios-separator))]/50 p-6 shadow-[var(--ios-shadow-sm)] hover:shadow-[var(--ios-shadow-md)] hover:border-[rgb(var(--ios-accent))]/30 transition-all duration-200 ios-press"
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 bg-[rgb(var(--ios-accent))]/10 rounded-[var(--ios-radius-md)] flex items-center justify-center text-[rgb(var(--ios-accent))] group-hover:bg-[rgb(var(--ios-accent))]/15 transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-[rgb(var(--ios-text-primary))] group-hover:text-[rgb(var(--ios-accent))] transition-colors">
                                                {CAMPUS_LABELS[campus]}
                                            </h2>
                                            <p className="text-xs text-[rgb(var(--ios-text-tertiary))] uppercase tracking-wider font-medium mt-0.5">
                                                {campus}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[rgb(var(--ios-text-tertiary))] group-hover:text-[rgb(var(--ios-accent))] group-hover:translate-x-0.5 transition-all" />
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div className="bg-[rgb(var(--ios-fill-tertiary))]/50 rounded-[var(--ios-radius-sm)] p-3">
                                        <div className="flex items-center gap-1.5 text-[rgb(var(--ios-text-tertiary))] mb-1">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">โครงการ</span>
                                        </div>
                                        <p className="text-lg font-bold text-[rgb(var(--ios-text-primary))]">
                                            {stats.totalProjects}
                                        </p>
                                    </div>
                                    <div className="bg-[rgb(var(--ios-fill-tertiary))]/50 rounded-[var(--ios-radius-sm)] p-3">
                                        <div className="flex items-center gap-1.5 text-[rgb(var(--ios-text-tertiary))] mb-1">
                                            <Percent className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">อนุมัติ</span>
                                        </div>
                                        <p className="text-lg font-bold text-[rgb(var(--ios-green))]">
                                            {stats.approvalRate.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="bg-[rgb(var(--ios-fill-tertiary))]/50 rounded-[var(--ios-radius-sm)] p-3">
                                        <div className="flex items-center gap-1.5 text-[rgb(var(--ios-text-tertiary))] mb-1">
                                            <Wallet className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">งบเสนอขอ</span>
                                        </div>
                                        <p className="text-sm font-bold text-[rgb(var(--ios-text-primary))] font-mono">
                                            {formatTHB(stats.totalRequested)}
                                        </p>
                                    </div>
                                    <div className="bg-[rgb(var(--ios-fill-tertiary))]/50 rounded-[var(--ios-radius-sm)] p-3">
                                        <div className="flex items-center gap-1.5 text-[rgb(var(--ios-text-tertiary))] mb-1">
                                            <Wallet className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">งบอนุมัติ</span>
                                        </div>
                                        <p className="text-sm font-bold text-[rgb(var(--ios-green))] font-mono">
                                            {formatTHB(stats.totalApproved)}
                                        </p>
                                    </div>
                                </div>

                                {/* Top Organization */}
                                {stats.topOrganization && (
                                    <div className="pt-4 border-t border-[rgb(var(--ios-separator))]/30">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Building2 className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />
                                            <span className="text-[rgb(var(--ios-text-tertiary))]">หน่วยงานหลัก:</span>
                                            <span className="font-semibold text-[rgb(var(--ios-text-primary))] truncate">
                                                {stats.topOrganization}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </section>

            <footer className="mt-8 border-t border-[rgb(var(--ios-separator))]/40 py-6 text-center text-sm text-[rgb(var(--ios-text-secondary))]">
                <p>&copy; {currentYear} Thammasat University Open Data Initiative. All rights reserved.</p>
            </footer>
        </main>
    );
}
