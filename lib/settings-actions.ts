'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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

export async function getSettings() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

    if (error) return { error: error.message };
    return { data: data || [] };
}

export async function getSetting(key: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .single();

    if (error) return null;
    return data?.value;
}

export async function updateSetting(key: string, value: unknown, description?: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('system_settings')
        .upsert({
            key,
            value,
            description,
            updated_at: new Date().toISOString(),
        });

    if (error) return { error: error.message };

    await logActivity('update', 'system_setting', key, key);
    revalidatePath('/admin/settings');
    return { success: true };
}

export async function updateSettings(settings: { key: string; value: unknown; description?: string }[]) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized' };

    const records = settings.map(s => ({
        key: s.key,
        value: s.value,
        description: s.description,
        updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
        .from('system_settings')
        .upsert(records);

    if (error) return { error: error.message };

    await logActivity('update', 'system_setting', 'batch', `${settings.length} settings`);
    revalidatePath('/admin/settings');
    return { success: true };
}
