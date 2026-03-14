'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { BudgetCategory } from './types';

async function logActivity(action: string, entityType: string, entityId: string, entityName: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('activity_logs').insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        user_email: user?.email,
    });
}

export async function getBudgetCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) return { error: error.message };
    return { data: data as BudgetCategory[] };
}

export async function createBudgetCategory(data: Partial<BudgetCategory>) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    // Get max sort_order
    const { data: last } = await supabase
        .from('budget_categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

    const { data: cat, error } = await supabase
        .from('budget_categories')
        .insert({
            name: data.name,
            description: data.description || null,
            max_rate: data.max_rate || null,
            unit: data.unit || null,
            rules: data.rules || null,
            is_active: data.is_active ?? true,
            sort_order: (last?.sort_order ?? 0) + 10,
        })
        .select()
        .single();

    if (error) return { error: error.message };

    await logActivity('create', 'budget_category', cat.id.toString(), cat.name);
    revalidatePath('/admin/budget-categories');
    return { success: true, data: cat };
}

export async function updateBudgetCategory(id: number, data: Partial<BudgetCategory>) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    const { id: _, created_at, ...updateData } = data as any;
    const { data: cat, error } = await supabase
        .from('budget_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) return { error: error.message };

    await logActivity('update', 'budget_category', id.toString(), cat.name);
    revalidatePath('/admin/budget-categories');
    return { success: true, data: cat };
}

export async function deleteBudgetCategory(id: number) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    const { data: cat } = await supabase.from('budget_categories').select('name').eq('id', id).single();
    const { error } = await supabase.from('budget_categories').delete().eq('id', id);
    if (error) return { error: error.message };

    await logActivity('delete', 'budget_category', id.toString(), cat?.name || 'Unknown');
    revalidatePath('/admin/budget-categories');
    return { success: true };
}
