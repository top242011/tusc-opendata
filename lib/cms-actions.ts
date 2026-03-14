'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CmsPage } from './types';

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

export async function getCmsPages() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('id');

    if (error) return { error: error.message };
    return { data: data as CmsPage[] };
}

export async function getCmsPage(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('id', slug)
        .single();

    if (error) return { error: error.message };
    return { data: data as CmsPage };
}

export async function updateCmsPage(slug: string, updates: { title?: string; content: string }) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    const { data, error } = await supabase
        .from('cms_pages')
        .upsert({
            id: slug,
            title: updates.title,
            content: updates.content,
            updated_by: user.email,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) return { error: error.message };

    await logActivity('update', 'cms_page', slug, updates.title || slug);
    revalidatePath('/admin/pages');
    revalidatePath(`/admin/pages/${slug}`);
    // Revalidate public pages
    if (slug === 'about') revalidatePath('/about');
    if (slug === 'api-docs') revalidatePath('/api-docs');
    return { success: true, data };
}
