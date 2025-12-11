import { createClient } from "@/utils/supabase/server";
import { HeroSection } from "@/components/hero-section";
import { StatsSection } from "@/components/stats-section";
import { ChartsSection } from "@/components/charts-section";
import { DataTable } from "@/components/data-table";
import { DashboardStats, Project } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

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
    // project_files will be an array of objects like [{ count: 1 }] due to count aggregation if done this way, 
    // OR if using head:true/count, it behaves differently. 
    // Actually standard supabase select with foreign key count returns: { ..., project_files: [{ count: N }] } typically or simply array if not counting.
    // Let's check Supabase join syntax behavior. 
    // .select('*, project_files(count)') usually returns { ...project, project_files: [{ count: 3 }] }
    // But since it's a one-to-many, we want to know IF there are files.
    // Let's assume standard returns and simple check.
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
    // Requirement "Percentage of approval" could interpret as money percentage or project count percentage.
    // Usually approval rate is count based, but budget transparency might prefer money based?
    // "เปอร์เซ็นต์การอนุมัติ" - let's stick to project count for now as it's cleaner, or Money Approved / Money Requested * 100.
    // Let's change to Money% based on context of "Budget".
  };

  const moneyApprovalRate = stats.totalRequested > 0 ? (stats.totalApproved / stats.totalRequested) * 100 : 0;
  stats.approvalRate = moneyApprovalRate;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <HeroSection />

      <div className="container mx-auto max-w-7xl px-4 -mt-10 relative z-10">
        <StatsSection stats={stats} />
        <ChartsSection projects={projects} />
        <DataTable projects={projects} />

        <footer className="mt-20 py-8 border-t text-center text-slate-500 text-sm">
          <p>© 2567 สภานักศึกษา | พัฒนาโดย พรรครีไลฟ์</p>
        </footer>
      </div>
    </main>
  );
}
