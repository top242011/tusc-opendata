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

    // Log Activity
    if (newProject) {
        await logActivity('create', 'project', newProject.id.toString(), newProject.project_name, { new_data: data });
    }

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

    // Log Activity
    if (updatedProject) {
        await logActivity('update', 'project', id.toString(), updatedProject.project_name, { update_data: updateData });
    }

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

    // Log Activity
    await logActivity('delete', 'project', id.toString(), `Project ID ${id}`);

    return { success: true };
}

// --- Activity Logging Helper ---

async function logActivity(
    action: string,
    entityType: string,
    entityId: string,
    entityName: string,
    details?: object
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await supabase.from('activity_logs').insert({
                user_email: user.email || 'unknown',
                action,
                entity_type: entityType,
                entity_id: entityId,
                entity_name: entityName || 'Unknown',
                details,
            });
        }
    } catch (e) {
        // Fail silently to not block main action
        console.error("Failed to log activity:", e);
    }
}
