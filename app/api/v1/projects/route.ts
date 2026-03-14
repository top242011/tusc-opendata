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
        const campus = searchParams.get('campus');
        const organization = searchParams.get('organization');
        const status = searchParams.get('status');
        const q = searchParams.get('q');
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 500);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

        const supabase = await createPublicClient();

        let query = supabase
            .from('projects')
            .select(
                'id, project_name, organization, fiscal_year, budget_requested, budget_approved, status, campus, responsible_person, activity_type, objectives, sdg_goals, is_published, created_at',
                { count: 'exact' }
            )
            .eq('is_published', true);

        if (fiscalYear) {
            query = query.eq('fiscal_year', parseInt(fiscalYear, 10));
        }
        if (campus) {
            query = query.eq('campus', campus);
        }
        if (organization) {
            query = query.ilike('organization', `%${organization}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (q) {
            query = query.or(
                `project_name.ilike.%${q}%,organization.ilike.%${q}%,responsible_person.ilike.%${q}%`
            );
        }

        query = query
            .order('fiscal_year', { ascending: false })
            .order('id', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch projects', details: error.message },
                { status: 500, headers: { ...CORS_HEADERS } }
            );
        }

        return NextResponse.json(
            {
                data: data || [],
                meta: {
                    total: count ?? 0,
                    limit,
                    offset,
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
