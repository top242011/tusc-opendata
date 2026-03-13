import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/utils/supabase/server';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const CACHE_HEADERS = {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const fiscalYear = searchParams.get('fiscal_year');

        const supabase = await createPublicClient();

        let query = supabase
            .from('projects')
            .select('id, budget_requested, budget_approved, status, campus, organization, is_published')
            .eq('is_published', true);

        if (fiscalYear) {
            query = query.eq('fiscal_year', parseInt(fiscalYear, 10));
        }

        const { data: projects, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch statistics', details: error.message },
                { status: 500, headers: { ...CORS_HEADERS } }
            );
        }

        const allProjects = projects || [];
        const totalProjects = allProjects.length;
        const totalRequested = allProjects.reduce(
            (sum, p) => sum + (Number(p.budget_requested) || 0),
            0
        );
        const totalApproved = allProjects.reduce(
            (sum, p) => sum + (Number(p.budget_approved) || 0),
            0
        );
        const approvalRate =
            totalRequested > 0
                ? Math.round((totalApproved / totalRequested) * 10000) / 100
                : 0;

        // Aggregate by campus
        const campusMap: Record<string, { total_projects: number; total_requested: number; total_approved: number }> = {};
        for (const p of allProjects) {
            const c = p.campus || 'unknown';
            if (!campusMap[c]) {
                campusMap[c] = { total_projects: 0, total_requested: 0, total_approved: 0 };
            }
            campusMap[c].total_projects++;
            campusMap[c].total_requested += Number(p.budget_requested) || 0;
            campusMap[c].total_approved += Number(p.budget_approved) || 0;
        }
        const byCampus = Object.entries(campusMap).map(([campus, stats]) => ({
            campus,
            ...stats,
        }));

        // Aggregate by status
        const statusMap: Record<string, number> = {};
        for (const p of allProjects) {
            const s = p.status || 'unknown';
            statusMap[s] = (statusMap[s] || 0) + 1;
        }
        const byStatus = Object.entries(statusMap).map(([status, count]) => ({
            status,
            count,
        }));

        // Top 10 organizations by total approved budget
        const orgMap: Record<string, { total_projects: number; total_requested: number; total_approved: number }> = {};
        for (const p of allProjects) {
            const org = p.organization || 'unknown';
            if (!orgMap[org]) {
                orgMap[org] = { total_projects: 0, total_requested: 0, total_approved: 0 };
            }
            orgMap[org].total_projects++;
            orgMap[org].total_requested += Number(p.budget_requested) || 0;
            orgMap[org].total_approved += Number(p.budget_approved) || 0;
        }
        const topOrganizations = Object.entries(orgMap)
            .map(([organization, stats]) => ({ organization, ...stats }))
            .sort((a, b) => b.total_approved - a.total_approved)
            .slice(0, 10);

        return NextResponse.json(
            {
                data: {
                    total_projects: totalProjects,
                    total_requested: totalRequested,
                    total_approved: totalApproved,
                    approval_rate: approvalRate,
                    by_campus: byCampus,
                    by_status: byStatus,
                    top_organizations: topOrganizations,
                },
                meta: {
                    fiscal_year: fiscalYear ? parseInt(fiscalYear, 10) : null,
                },
            },
            { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
        );
    } catch (err) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: { ...CORS_HEADERS } }
        );
    }
}
