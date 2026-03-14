'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Organization } from './types';

async function logActivity(action: string, entityType: string, entityId: string, entityName: string, details?: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('activity_logs').insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        user_email: user?.email,
        details,
    });
}

export async function getOrganizations(filters?: { search?: string; campus?: string; type?: string }) {
    const supabase = await createClient();
    let query = supabase
        .from('organizations')
        .select('*, projects(count)')
        .order('name', { ascending: true });

    if (filters?.campus) {
        query = query.eq('campus', filters.campus);
    }
    if (filters?.type) {
        query = query.eq('type', filters.type);
    }
    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,short_name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
}

export async function getOrganization(id: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return { error: error.message };
    return { data };
}

export async function createOrganization(data: Partial<Organization>) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    const { data: org, error } = await supabase
        .from('organizations')
        .insert({
            name: data.name,
            short_name: data.short_name || null,
            type: data.type || 'club',
            campus: data.campus || 'central',
            contact_person: data.contact_person || null,
            contact_email: data.contact_email || null,
            description: data.description || null,
            is_active: data.is_active ?? true,
        })
        .select()
        .single();

    if (error) return { error: error.message };

    await logActivity('create', 'organization', org.id.toString(), org.name);
    revalidatePath('/admin/organizations');
    return { success: true, data: org };
}

export async function updateOrganization(id: number, data: Partial<Organization>) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    const { id: _, created_at, updated_at, ...updateData } = data as any;
    const { data: org, error } = await supabase
        .from('organizations')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) return { error: error.message };

    await logActivity('update', 'organization', id.toString(), org.name);
    revalidatePath('/admin/organizations');
    revalidatePath(`/admin/organizations/${id}`);
    return { success: true, data: org };
}

export async function deleteOrganization(id: number) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    // Check if any projects reference this org
    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('organization_id', id)
        .limit(1);

    if (projects && projects.length > 0) {
        return { error: 'ไม่สามารถลบองค์กรที่มีโครงการอ้างอิงอยู่ได้' };
    }

    const { data: org } = await supabase.from('organizations').select('name').eq('id', id).single();
    const { error } = await supabase.from('organizations').delete().eq('id', id);
    if (error) return { error: error.message };

    await logActivity('delete', 'organization', id.toString(), org?.name || 'Unknown');
    revalidatePath('/admin/organizations');
    return { success: true };
}
