'use server';

import { createClient } from '@/utils/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { Project } from '@/lib/types';
import { parseProjectPDF, parseBudgetExcel } from './gemini';

export interface ImportPreviewItem {
    id: string; // temp id
    fileName: string; // The file it came from
    source: 'PDF' | 'EXCEL'; // Origin type
    status: 'NEW' | 'UPDATE' | 'CONFLICT' | 'LINKED' | 'UNLISTED' | 'MISSING_INFO'; // LINKED = Excel Match + PDF Match
    data: Partial<Project>;
    originalData?: Partial<Project>; // To revert to after import (for persistent master list)
    existingProjectId?: number;
    matchScore: number; // For logging
    budgetMismatch?: {
        pdf: number;
        excel: number;
    };
    reason?: string;
}

// Helper to normalize strings for comparison
const normalize = (str: string) => str?.toLowerCase().replace(/\s+/g, '').replace(/[\-_\.]/g, '') || '';

export async function analyzeFileForImport(formData: FormData): Promise<{ success: boolean; data?: ImportPreviewItem[]; error?: string }> {
    try {
        const file = formData.get('file') as File;
        if (!file) return { success: false, error: 'No file' };

        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        const results: ImportPreviewItem[] = [];

        // 1. Parse based on file type
        if (isExcel) {
            const excelResult = await parseBudgetExcel(formData);
            if (!excelResult.success || !excelResult.data) {
                return { success: false, error: excelResult.error };
            }

            // Map Excel rows to Preview Items
            const rows = excelResult.data as any[]; // Array of project objects

            for (const row of rows) {
                results.push({
                    id: Math.random().toString(36).substring(7),
                    fileName: file.name,
                    source: 'EXCEL',
                    status: 'NEW', // Will be re-evaluated later
                    matchScore: 0,
                    data: {
                        project_name: row.project_name,
                        organization: row.organization,
                        budget_requested: row.budget_requested,
                        budget_approved: row.budget_approved,
                        budget_average: row.budget_average,
                        notes: row.notes,
                        fiscal_year: 2568, // Default
                    },
                    originalData: {
                        project_name: row.project_name,
                        organization: row.organization,
                        budget_requested: row.budget_requested,
                        budget_approved: row.budget_approved,
                        budget_average: row.budget_average,
                        notes: row.notes,
                        fiscal_year: 2568,
                    }
                });
            }

        } else {
            // PDF Handling
            const pdfResult = await parseProjectPDF(formData);
            if (!pdfResult.success || !pdfResult.data) {
                return { success: false, error: pdfResult.error };
            }

            const aiData = pdfResult.data;
            results.push({
                id: Math.random().toString(36).substring(7),
                fileName: file.name,
                source: 'PDF',
                status: 'NEW', // Will be re-evaluated later
                matchScore: 0,
                data: {
                    project_name: aiData.project_name,
                    organization: aiData.organization || 'Unknown Org',
                    budget_requested: aiData.budget_requested || 0,
                    // All Details
                    responsible_person: aiData.responsible_person,
                    advisor: aiData.advisor,
                    activity_type: aiData.activity_type,
                    rationale: aiData.rationale,
                    objectives: aiData.objectives,
                    targets: aiData.targets,
                    sdg_goals: aiData.sdg_goals,
                    budget_breakdown: aiData.budget_breakdown,
                }
            });
        }

        // 2. Initial DB Check (Can be done client side aggregation for best results, but here we do individual check)
        // Actually, for "Auto-Linking", we need the full list in the client state. 
        // So here we validly just return the extracted data. 
        // BUT we can still check DB to flagging "UPDATE" status if it exists in DB.

        const supabase = await createClient();
        const { data: existingProjects } = await supabase
            .from('projects')
            .select('id, project_name, organization, budget_requested')
            // Just optimize, maybe fetch all if small, or search individual?
            // For bulk, fetching all IDs is better than 100 queries.
            .order('id', { ascending: false });

        if (existingProjects) {
            for (const item of results) {
                const targetName = normalize(item.data.project_name || '');
                const match = existingProjects.find(p => {
                    const dbName = normalize(p.project_name);
                    // Match Logic: Includes + Length check
                    return (dbName.includes(targetName) || targetName.includes(dbName)) && targetName.length > 5;
                });

                if (match) {
                    item.status = 'UPDATE';
                    item.existingProjectId = match.id;
                    item.reason = `Matches DB: "${match.project_name}"`;
                }
            }
        }

        return { success: true, data: results };

    } catch (err) {
        console.error('Analyze Error:', err);
        return { success: false, error: 'Analysis failed' };
    }
}

export async function saveImportedProject(item: ImportPreviewItem, fileFormData: FormData | null) {
    const supabase = await createClient();

    // If source is EXCEL, we often don't have a single file attachment for THIS row specifically, 
    // unless we want to attach the Excel sheet to every project (redundant).
    // Usually Excel mainly Updates Data.
    // If source is PDF, we upload the file.

    try {
        let projectId = item.existingProjectId;

        // 1. Insert or Update Project
        if (item.status === 'NEW' || !projectId) {
            // Create New
            const { data, error } = await supabase.from('projects').insert({
                project_name: item.data.project_name || 'Untitled Project',
                organization: item.data.organization || 'Unassigned',
                fiscal_year: new Date().getFullYear() + 543,
                budget_requested: item.data.budget_requested || 0,
                budget_approved: item.data.budget_approved || 0,
                budget_average: item.data.budget_average || 0,
                notes: item.data.notes,
                // Details (might be null if Excel)
                responsible_person: item.data.responsible_person,
                advisor: item.data.advisor,
                activity_type: item.data.activity_type,
                rationale: item.data.rationale,
                objectives: item.data.objectives,
                targets: item.data.targets,
                sdg_goals: item.data.sdg_goals,
                budget_breakdown: item.data.budget_breakdown,
                is_published: true // Excel import usually means approved list? Default True for now.
            }).select().single();

            if (error) throw error;
            projectId = data.id;
        } else {
            // Update Existing
            const updatePayload: any = {};

            // If Excel: update budgets and status
            if (item.source === 'EXCEL') {
                if (item.data.budget_approved !== undefined) updatePayload.budget_approved = item.data.budget_approved;
                if (item.data.budget_average !== undefined) updatePayload.budget_average = item.data.budget_average;
                if (item.data.notes !== undefined) updatePayload.notes = item.data.notes;
            }

            // If PDF: update details
            if (item.source === 'PDF') {
                updatePayload.responsible_person = item.data.responsible_person;
                updatePayload.advisor = item.data.advisor;
                updatePayload.activity_type = item.data.activity_type;
                updatePayload.rationale = item.data.rationale;
                updatePayload.objectives = item.data.objectives;
                updatePayload.targets = item.data.targets;
                updatePayload.sdg_goals = item.data.sdg_goals;
                updatePayload.budget_breakdown = item.data.budget_breakdown;
                // Also trust PDF budget requested? Maybe.
                if (item.data.budget_requested) updatePayload.budget_requested = item.data.budget_requested;
            }

            if (Object.keys(updatePayload).length > 0) {
                const { error } = await supabase.from('projects').update(updatePayload).eq('id', projectId);
                if (error) throw error;
            }
        }

        // 2. Upload File (Only if file provided - works for PDF source OR Linked Excel source)
        if (fileFormData) {
            const file = fileFormData.get('file') as File;
            if (file && projectId) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${projectId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('project_files')
                    .upload(filePath, file);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('project_files')
                        .getPublicUrl(filePath);

                    await supabase.from('project_files').insert({
                        project_id: projectId,
                        file_name: file.name,
                        file_url: publicUrl,
                        file_type: fileExt || 'pdf',
                        category: 'เอกสารเสนอโครงการ (Auto-Import)'
                    });
                }
            }
        }

        return { success: true, projectId };

    } catch (error) {
        console.error('Save Import Error:', error);
        return { success: false, error: 'Failed to save project' };
    }
}
