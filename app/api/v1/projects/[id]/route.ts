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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = parseInt(id, 10);

        if (isNaN(projectId)) {
            return NextResponse.json(
                { error: 'Invalid project ID. Must be a number.' },
                { status: 400, headers: { ...CORS_HEADERS } }
            );
        }

        const supabase = await createPublicClient();

        const { data: project, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('is_published', true)
            .single();

        if (error || !project) {
            return NextResponse.json(
                { error: 'Project not found', message: `No published project found with id ${projectId}` },
                { status: 404, headers: { ...CORS_HEADERS } }
            );
        }

        const { data: files } = await supabase
            .from('project_files')
            .select('id, file_name, file_url, file_type, uploaded_at')
            .eq('project_id', projectId)
            .order('uploaded_at', { ascending: false });

        return NextResponse.json(
            {
                data: {
                    ...project,
                    files: files || [],
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
