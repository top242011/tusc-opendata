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

    const { data: newProject, error } = await supabase.from('projects').insert([data]).select().single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: newProject };
}

export async function updateProject(id: number, data: Partial<Project>) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "Unauthorized" };
    }

    // Exclude 'status' and 'id' from update
    const { status, id: _id, ...updateData } = data;
    const { data: updatedProject, error } = await supabase.from('projects').update(updateData).eq('id', id).select().single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: updatedProject };
}

// Update project details (JSON/Arrays)
export async function updateProjectDetails(id: number, data: any) {
    const supabase = await createClient(); // Use await for server client

    const { error } = await supabase.from('projects').update(data).eq('id', id);

    if (error) {
        console.error('Error updating project details:', error);
        throw new Error('Failed to update project details');
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/project/${id}`);
    revalidatePath(`/project/${id}`);
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
