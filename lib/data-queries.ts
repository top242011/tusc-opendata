import { createPublicClient } from '@/utils/supabase/server';

export async function getLatestFiscalYear(): Promise<number> {
    const supabase = await createPublicClient();

    // Get the max fiscal year from projects that are published
    const { data } = await supabase
        .from('projects')
        .select('fiscal_year')
        //.eq('is_published', true) // Optional: only public data? Yes makes sense.
        .order('fiscal_year', { ascending: false })
        .limit(1)
        .single();

    return data?.fiscal_year || (new Date().getFullYear() + 543);
}

export async function getFiscalYearStats() {
    const supabase = await createPublicClient();

    const { data } = await supabase
        .from('projects')
        .select('fiscal_year')
        .order('fiscal_year', { ascending: false });

    if (!data) return { latest: new Date().getFullYear() + 543, years: [] };

    const years = [...new Set(data.map(p => p.fiscal_year))].sort((a, b) => b - a);
    return { latest: years[0], years };
}
