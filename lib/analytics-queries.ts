import { createClient } from '@/utils/supabase/server';
import { Campus, CAMPUS_LABELS, Project } from '@/lib/types';

// ============================================
// Types
// ============================================

export interface FiscalYearTrend {
    fiscal_year: number;
    total_requested: number;
    total_approved: number;
    total_cut: number;
    project_count: number;
    approval_rate: number;
}

export interface OrgPerformance {
    organization: string;
    organization_id: number | null;
    project_count: number;
    total_requested: number;
    total_approved: number;
    approval_ratio: number;
    avg_cut_percentage: number;
}

export interface ActivityTypeBreakdown {
    activity_type: string;
    project_count: number;
    total_requested: number;
    total_approved: number;
}

export interface SDGBreakdown {
    sdg_goal: string;
    project_count: number;
    total_approved: number;
}

export interface CampusBreakdown {
    campus: Campus;
    campus_label: string;
    project_count: number;
    total_requested: number;
    total_approved: number;
}

export interface Anomaly {
    type: 'high_cut' | 'repeat_submission' | 'zero_approved';
    severity: 'warning' | 'critical';
    message: string;
    project_id?: number;
    project_name?: string;
    organization?: string;
    value?: number;
}

export interface ComplaintSummary {
    status: string;
    count: number;
}

export interface AnalyticsData {
    fiscalYearTrends: FiscalYearTrend[];
    orgPerformance: OrgPerformance[];
    activityTypes: ActivityTypeBreakdown[];
    sdgBreakdown: SDGBreakdown[];
    campusBreakdown: CampusBreakdown[];
    anomalies: Anomaly[];
    complaintSummary: ComplaintSummary[];
    projects: Project[];
    fiscalYears: number[];
}

// ============================================
// Queries
// ============================================

export async function getAnalyticsData(fiscalYear?: number): Promise<AnalyticsData> {
    const supabase = await createClient();

    // Fetch all projects (optionally filtered by fiscal year)
    let query = supabase
        .from('projects')
        .select('*')
        .order('fiscal_year', { ascending: true });

    if (fiscalYear) {
        query = query.eq('fiscal_year', fiscalYear);
    }

    const [projectsResult, complaintsResult, fiscalYearsResult] = await Promise.all([
        query,
        supabase
            .from('complaints')
            .select('status'),
        supabase
            .from('projects')
            .select('fiscal_year')
            .order('fiscal_year', { ascending: false }),
    ]);

    const projects = (projectsResult.data || []) as Project[];
    const complaints = complaintsResult.data || [];
    const allFiscalYears = [...new Set((fiscalYearsResult.data || []).map(p => p.fiscal_year))].sort((a, b) => b - a);

    return {
        fiscalYearTrends: computeFiscalYearTrends(projects, fiscalYear),
        orgPerformance: computeOrgPerformance(projects),
        activityTypes: computeActivityTypes(projects),
        sdgBreakdown: computeSDGBreakdown(projects),
        campusBreakdown: computeCampusBreakdown(projects),
        anomalies: detectAnomalies(projects),
        complaintSummary: computeComplaintSummary(complaints),
        projects,
        fiscalYears: allFiscalYears,
    };
}

// ============================================
// Compute Functions
// ============================================

function computeFiscalYearTrends(projects: Project[], selectedYear?: number): FiscalYearTrend[] {
    // If a year is selected, we still want all years for trend chart
    const allProjects = projects;
    const byYear = new Map<number, Project[]>();

    for (const p of allProjects) {
        const arr = byYear.get(p.fiscal_year) || [];
        arr.push(p);
        byYear.set(p.fiscal_year, arr);
    }

    return Array.from(byYear.entries())
        .sort(([a], [b]) => a - b)
        .map(([year, ps]) => {
            const totalRequested = ps.reduce((s, p) => s + Number(p.budget_requested || 0), 0);
            const totalApproved = ps.reduce((s, p) => s + Number(p.budget_approved || 0), 0);
            return {
                fiscal_year: year,
                total_requested: totalRequested,
                total_approved: totalApproved,
                total_cut: totalRequested - totalApproved,
                project_count: ps.length,
                approval_rate: totalRequested > 0 ? (totalApproved / totalRequested) * 100 : 0,
            };
        });
}

function computeOrgPerformance(projects: Project[]): OrgPerformance[] {
    const byOrg = new Map<string, Project[]>();

    for (const p of projects) {
        const key = p.organization;
        const arr = byOrg.get(key) || [];
        arr.push(p);
        byOrg.set(key, arr);
    }

    return Array.from(byOrg.entries())
        .map(([org, ps]) => {
            const totalRequested = ps.reduce((s, p) => s + Number(p.budget_requested || 0), 0);
            const totalApproved = ps.reduce((s, p) => s + Number(p.budget_approved || 0), 0);
            const cutPercentages = ps
                .filter(p => Number(p.budget_requested) > 0)
                .map(p => ((Number(p.budget_requested) - Number(p.budget_approved)) / Number(p.budget_requested)) * 100);

            return {
                organization: org,
                organization_id: null,
                project_count: ps.length,
                total_requested: totalRequested,
                total_approved: totalApproved,
                approval_ratio: totalRequested > 0 ? (totalApproved / totalRequested) * 100 : 0,
                avg_cut_percentage: cutPercentages.length > 0
                    ? cutPercentages.reduce((a, b) => a + b, 0) / cutPercentages.length
                    : 0,
            };
        })
        .sort((a, b) => b.total_approved - a.total_approved);
}

function computeActivityTypes(projects: Project[]): ActivityTypeBreakdown[] {
    const byType = new Map<string, Project[]>();

    for (const p of projects) {
        const type = p.activity_type || 'ไม่ระบุ';
        const arr = byType.get(type) || [];
        arr.push(p);
        byType.set(type, arr);
    }

    return Array.from(byType.entries())
        .map(([type, ps]) => ({
            activity_type: type,
            project_count: ps.length,
            total_requested: ps.reduce((s, p) => s + Number(p.budget_requested || 0), 0),
            total_approved: ps.reduce((s, p) => s + Number(p.budget_approved || 0), 0),
        }))
        .sort((a, b) => b.total_approved - a.total_approved);
}

function computeSDGBreakdown(projects: Project[]): SDGBreakdown[] {
    const bySDG = new Map<string, { count: number; approved: number }>();

    for (const p of projects) {
        if (!p.sdg_goals?.length) continue;
        for (const sdg of p.sdg_goals) {
            const existing = bySDG.get(sdg) || { count: 0, approved: 0 };
            existing.count++;
            existing.approved += Number(p.budget_approved || 0);
            bySDG.set(sdg, existing);
        }
    }

    return Array.from(bySDG.entries())
        .map(([sdg, data]) => ({
            sdg_goal: sdg,
            project_count: data.count,
            total_approved: data.approved,
        }))
        .sort((a, b) => b.total_approved - a.total_approved);
}

function computeCampusBreakdown(projects: Project[]): CampusBreakdown[] {
    const byCampus = new Map<Campus, Project[]>();

    for (const p of projects) {
        if (!p.campus) continue;
        const arr = byCampus.get(p.campus) || [];
        arr.push(p);
        byCampus.set(p.campus, arr);
    }

    return Array.from(byCampus.entries())
        .map(([campus, ps]) => ({
            campus,
            campus_label: CAMPUS_LABELS[campus] || campus,
            project_count: ps.length,
            total_requested: ps.reduce((s, p) => s + Number(p.budget_requested || 0), 0),
            total_approved: ps.reduce((s, p) => s + Number(p.budget_approved || 0), 0),
        }))
        .sort((a, b) => b.total_approved - a.total_approved);
}

function detectAnomalies(projects: Project[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    if (projects.length === 0) return anomalies;

    // 1. Projects with high budget cuts (>50%)
    const avgCutRate = projects.reduce((sum, p) => {
        const req = Number(p.budget_requested || 0);
        const app = Number(p.budget_approved || 0);
        return sum + (req > 0 ? ((req - app) / req) * 100 : 0);
    }, 0) / projects.length;

    for (const p of projects) {
        const req = Number(p.budget_requested || 0);
        const app = Number(p.budget_approved || 0);
        if (req <= 0) continue;
        const cutPct = ((req - app) / req) * 100;

        if (cutPct > 50 && cutPct > avgCutRate * 1.5) {
            anomalies.push({
                type: 'high_cut',
                severity: cutPct > 80 ? 'critical' : 'warning',
                message: `งบถูกตัด ${cutPct.toFixed(1)}% (เฉลี่ย ${avgCutRate.toFixed(1)}%)`,
                project_id: p.id,
                project_name: p.project_name,
                organization: p.organization,
                value: cutPct,
            });
        }
    }

    // 2. Zero approved budget
    for (const p of projects) {
        if (Number(p.budget_requested) > 0 && Number(p.budget_approved) === 0) {
            anomalies.push({
                type: 'zero_approved',
                severity: 'critical',
                message: `เสนอขอ ${Number(p.budget_requested).toLocaleString('th-TH')} บาท แต่ไม่ได้รับอนุมัติเลย`,
                project_id: p.id,
                project_name: p.project_name,
                organization: p.organization,
                value: Number(p.budget_requested),
            });
        }
    }

    // 3. Organizations submitting many projects (possible duplicates)
    const orgCounts = new Map<string, number>();
    for (const p of projects) {
        orgCounts.set(p.organization, (orgCounts.get(p.organization) || 0) + 1);
    }
    const avgProjectsPerOrg = projects.length / Math.max(orgCounts.size, 1);

    for (const [org, count] of orgCounts.entries()) {
        if (count > avgProjectsPerOrg * 2.5 && count >= 5) {
            anomalies.push({
                type: 'repeat_submission',
                severity: 'warning',
                message: `ส่ง ${count} โครงการ (เฉลี่ย ${avgProjectsPerOrg.toFixed(1)} โครงการ/องค์กร)`,
                organization: org,
                value: count,
            });
        }
    }

    // Sort by severity (critical first) then by value descending
    return anomalies
        .sort((a, b) => {
            if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
            return (b.value || 0) - (a.value || 0);
        })
        .slice(0, 20); // Limit to top 20
}

function computeComplaintSummary(complaints: { status: string }[]): ComplaintSummary[] {
    const byStatus = new Map<string, number>();
    for (const c of complaints) {
        byStatus.set(c.status, (byStatus.get(c.status) || 0) + 1);
    }
    return Array.from(byStatus.entries())
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);
}
