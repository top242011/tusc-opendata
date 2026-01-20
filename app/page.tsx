import { createClient } from "@/utils/supabase/server";
import { HeroSection } from "@/components/hero-section";
import { PublicNavbar } from "@/components/public-navbar";
import { StatsSection } from "@/components/stats-section";
import { ChartsSection } from "@/components/charts-section";
import { DataTable } from "@/components/data-table";
import { DashboardStats, Project } from "@/lib/types";

import { getLatestFiscalYear } from '@/lib/data-queries';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const latestFiscalYear = await getLatestFiscalYear();

  const { data: projectsData, error } = await supabase
    .from('projects')
    .select('*, project_files(count)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  // Transform to match Project interface with has_files
  const projects = (projectsData || []).map((p: any) => ({
    ...p,
    has_files: p.project_files && p.project_files[0] && p.project_files[0].count > 0
  })) as Project[];

  // Calculate stats
  const stats: DashboardStats = {
    totalRequested: projects.reduce((sum, p) => sum + Number(p.budget_requested), 0),
    totalApproved: projects.reduce((sum, p) => sum + Number(p.budget_approved), 0),
    totalCut: projects.reduce((sum, p) => sum + (p.budget_approved < p.budget_requested ? Number(p.budget_requested) - Number(p.budget_approved) : 0), 0),
    approvalRate: projects.length > 0
      ? (projects.filter(p => p.status === 'อนุมัติ' || p.budget_approved === p.budget_requested).length / projects.length) * 100
      : 0,
  };

  const moneyApprovalRate = stats.totalRequested > 0 ? (stats.totalApproved / stats.totalRequested) * 100 : 0;
  stats.approvalRate = moneyApprovalRate;

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 pb-20">
      <PublicNavbar />
      <HeroSection latestFiscalYear={latestFiscalYear} />

      <div id="project-table" className="container mx-auto max-w-7xl px-4 -mt-10 relative z-10">
        <StatsSection stats={stats} />
        <ChartsSection projects={projects} />
        <DataTable projects={projects} />

        <footer className="mt-20 py-8 border-t text-center text-slate-500 text-sm">
          <p>© 2568 ระบบเผยแพร่งบประมาณ สภานักศึกษามหาวิทยาลัยธรรมศาสตร์ | พัฒนาโดย พรรครีไลฟ์</p>
        </footer>
      </div>
    </main>
  );
}
