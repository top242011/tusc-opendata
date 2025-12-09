"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Project } from "@/lib/types";

export async function createProject(data: Partial<Project>) {
    const supabase = await createClient();
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "Unauthorized" };
    }

    const { error } = await supabase.from('projects').insert([data]);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function updateProject(id: number, data: Partial<Project>) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "Unauthorized" };
    }

    const { error } = await supabase.from('projects').update(data).eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function deleteProject(id: number) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "Unauthorized" };
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}
