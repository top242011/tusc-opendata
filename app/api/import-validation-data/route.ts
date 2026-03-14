import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [orgsResult, projectsResult] = await Promise.all([
        supabase.from('organizations').select('name'),
        supabase.from('projects').select('project_name'),
    ]);

    // Fallback: if organizations table doesn't exist, get distinct from projects
    let organizations: string[] = [];
    if (orgsResult.data && orgsResult.data.length > 0) {
        organizations = orgsResult.data.map(o => o.name);
    } else {
        const { data: distinctOrgs } = await supabase
            .from('projects')
            .select('organization');
        organizations = [...new Set((distinctOrgs || []).map(o => o.organization).filter(Boolean))];
    }

    const projects = (projectsResult.data || []).map(p => p.project_name);

    return NextResponse.json({ organizations, projects });
}
