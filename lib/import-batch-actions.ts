'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ImportRow } from './types';

export interface ImportBatchInput {
    rows: ImportRow[];
    fiscalYear: number;
    campus: string;
    fileName: string;
}

export interface ImportBatchResult {
    success: boolean;
    batchId?: string;
    imported: number;
    failed: number;
    projectIds: number[];
    errors: string[];
    error?: string;
}

/**
 * Execute a batch import: create batch record, upsert projects, log activity.
 */
export async function executeBatchImport(input: ImportBatchInput): Promise<ImportBatchResult> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, imported: 0, failed: 0, projectIds: [], errors: [], error: 'Unauthorized' };
    }

    const validRows = input.rows.filter(r => r._isValid);
    if (validRows.length === 0) {
        return { success: false, imported: 0, failed: 0, projectIds: [], errors: [], error: 'ไม่มีข้อมูลที่ผ่านการตรวจสอบ' };
    }

    // 1. Create import batch record
    const { data: batch, error: batchError } = await supabase
        .from('import_batches')
        .insert({
            user_email: user.email,
            fiscal_year: input.fiscalYear,
            campus: input.campus,
            source_type: 'template_excel',
            file_name: input.fileName,
            total_rows: validRows.length,
            imported_rows: 0,
            failed_rows: 0,
            status: 'importing',
        })
        .select()
        .single();

    // If batch table doesn't exist yet, continue without tracking
    const batchId = batch?.id || null;

    // 2. Get existing organizations for auto-creation
    const { data: existingOrgs } = await supabase
        .from('organizations')
        .select('id, name');

    const orgMap = new Map<string, number>();
    (existingOrgs || []).forEach(org => orgMap.set(org.name.toLowerCase(), org.id));

    // 3. Process each row
    const projectIds: number[] = [];
    const errors: string[] = [];
    let imported = 0;
    let failed = 0;

    for (const row of validRows) {
        try {
            // Auto-create organization if needed
            let orgId: number | undefined;
            const orgKey = row.organization.toLowerCase();

            if (orgMap.has(orgKey)) {
                orgId = orgMap.get(orgKey);
            } else {
                // Try to create org
                const { data: newOrg, error: orgError } = await supabase
                    .from('organizations')
                    .insert({ name: row.organization, campus: input.campus })
                    .select()
                    .single();

                if (newOrg) {
                    orgId = newOrg.id;
                    orgMap.set(orgKey, newOrg.id);
                }
                // If org creation fails (table might not exist), continue without FK
            }

            // Check for existing project
            const { data: existing } = await supabase
                .from('projects')
                .select('id')
                .eq('project_name', row.project_name)
                .eq('fiscal_year', input.fiscalYear)
                .maybeSingle();

            const projectData: Record<string, any> = {
                project_name: row.project_name,
                organization: row.organization,
                fiscal_year: input.fiscalYear,
                campus: input.campus,
                budget_requested: row.budget_requested,
                budget_approved: row.budget_approved,
                budget_average: row.budget_average || 0,
                notes: row.notes || null,
                is_published: true,
            };

            if (orgId) {
                projectData.organization_id = orgId;
            }

            if (existing) {
                // Update
                const { error } = await supabase
                    .from('projects')
                    .update(projectData)
                    .eq('id', existing.id);

                if (error) throw error;
                projectIds.push(existing.id);
            } else {
                // Insert
                const { data: newProject, error } = await supabase
                    .from('projects')
                    .insert(projectData)
                    .select('id')
                    .single();

                if (error) throw error;
                if (newProject) projectIds.push(newProject.id);
            }

            imported++;
        } catch (err: any) {
            failed++;
            errors.push(`แถว ${row._rowNumber}: ${err.message || 'ไม่สามารถบันทึกได้'}`);
        }
    }

    // 4. Update batch record
    if (batchId) {
        await supabase
            .from('import_batches')
            .update({
                imported_rows: imported,
                failed_rows: failed,
                status: failed === validRows.length ? 'failed' : 'completed',
                project_ids: projectIds,
                error_log: errors.length > 0 ? errors : null,
                completed_at: new Date().toISOString(),
            })
            .eq('id', batchId);
    }

    // 5. Log activity
    await supabase.from('activity_logs').insert({
        action: 'import',
        entity_type: 'project',
        entity_id: batchId || 'batch',
        entity_name: `นำเข้า ${imported} โครงการจาก ${input.fileName}`,
        user_email: user.email,
        details: { imported, failed, batchId, fiscalYear: input.fiscalYear },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/projects');
    revalidatePath('/');

    return {
        success: true,
        batchId: batchId || undefined,
        imported,
        failed,
        projectIds,
        errors,
    };
}

/**
 * Rollback an import batch by deleting all projects created in that batch.
 */
export async function rollbackImportBatch(batchId: string): Promise<{ success: boolean; deleted: number; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, deleted: 0, error: 'Unauthorized' };
    }

    // Get batch
    const { data: batch, error: fetchError } = await supabase
        .from('import_batches')
        .select('*')
        .eq('id', batchId)
        .single();

    if (fetchError || !batch) {
        return { success: false, deleted: 0, error: 'ไม่พบข้อมูลการนำเข้า' };
    }

    if (batch.status === 'rolled_back') {
        return { success: false, deleted: 0, error: 'การนำเข้านี้ถูกย้อนกลับแล้ว' };
    }

    // Check time limit (24 hours)
    const batchTime = new Date(batch.created_at).getTime();
    const now = Date.now();
    if (now - batchTime > 24 * 60 * 60 * 1000) {
        return { success: false, deleted: 0, error: 'ไม่สามารถย้อนกลับได้ (เกิน 24 ชั่วโมง)' };
    }

    const projectIds = batch.project_ids || [];
    if (projectIds.length === 0) {
        return { success: false, deleted: 0, error: 'ไม่มีโครงการที่เชื่อมกับ batch นี้' };
    }

    // Delete projects
    const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .in('id', projectIds);

    if (deleteError) {
        return { success: false, deleted: 0, error: deleteError.message };
    }

    // Update batch status
    await supabase
        .from('import_batches')
        .update({ status: 'rolled_back' })
        .eq('id', batchId);

    // Log
    await supabase.from('activity_logs').insert({
        action: 'rollback_import',
        entity_type: 'import_batch',
        entity_id: batchId,
        entity_name: `ย้อนกลับ ${projectIds.length} โครงการ (batch: ${batch.file_name})`,
        user_email: user.email,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/projects');
    revalidatePath('/');

    return { success: true, deleted: projectIds.length };
}
