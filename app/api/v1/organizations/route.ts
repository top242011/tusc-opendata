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
        const campus = searchParams.get('campus');

        const supabase = await createPublicClient();

        let query = supabase
            .from('projects')
            .select('organization, budget_requested, budget_approved, is_published')
            .eq('is_published', true);

        if (campus) {
            query = query.eq('campus', campus);
        }

        const { data: projects, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch organizations', details: error.message },
                { status: 500, headers: { ...CORS_HEADERS } }
            );
        }

        const allProjects = projects || [];

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

        const organizations = Object.entries(orgMap)
            .map(([name, stats]) => ({
                name,
                ...stats,
                approval_rate:
                    stats.total_requested > 0
                        ? Math.round((stats.total_approved / stats.total_requested) * 10000) / 100
                        : 0,
            }))
            .sort((a, b) => b.total_projects - a.total_projects);

        return NextResponse.json(
            {
                data: organizations,
                meta: {
                    total: organizations.length,
                    campus: campus || null,
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
