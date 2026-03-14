import { createClient, createPublicClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/components/public-navbar";
import { LandingDashboard } from "@/components/landing-dashboard";
import { Footer } from "@/components/footer";
import { DashboardStats, Project } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { getLatestFiscalYear } from '@/lib/data-queries';
export const revalidate = 300; // 5 minutes

export default async function Home() {
  const supabase = await createPublicClient();
  const latestFiscalYear = await getLatestFiscalYear();

  const { data: projectsData, error } = await supabase
    .from('projects')
    .select(`
      id,
      organization,
      project_name,
      fiscal_year,
      budget_requested,
      budget_approved,
      status,
      campus,
      is_published,
      created_at,
      project_files(count)
    `)
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
    <main id="main-content" className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] transition-colors duration-200 antialiased">
      <PublicNavbar />

      {error && (
        <div className="container mx-auto max-w-6xl px-4 mt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง</AlertDescription>
          </Alert>
        </div>
      )}

      <LandingDashboard projects={projects} stats={stats} />
      <Footer />
    </main>
  );
}
