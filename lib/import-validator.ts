'use server';

import type { ImportRow, ImportError } from './types';

export interface ValidationResult {
    rows: ImportRow[];
    totalErrors: number;
    totalWarnings: number;
    isValid: boolean;
    summary: ValidationSummary;
}

export interface ValidationSummary {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    newOrganizations: string[];
    duplicateProjects: string[];
}

/**
 * Validate an array of ImportRows.
 * Returns the same rows with _errors, _warnings, and _isValid populated.
 */
export async function validateImportRows(
    rows: ImportRow[],
    existingOrganizations: string[],
    existingProjects: string[]
): Promise<ValidationResult> {
    const orgSet = new Set(existingOrganizations.map(o => o.toLowerCase()));
    const projectSet = new Set(existingProjects.map(p => p.toLowerCase()));
    const batchProjectNames = new Map<string, number>();
    const newOrganizations = new Set<string>();
    const duplicateProjects: string[] = [];

    let totalErrors = 0;
    let totalWarnings = 0;

    const validatedRows = rows.map((row) => {
        const errors: ImportError[] = [];
        const warnings: ImportError[] = [];
        const rowNum = row._rowNumber;

        // Required: organization
        if (!row.organization || row.organization.trim() === '') {
            errors.push({
                row: rowNum,
                column: 'ชื่อองค์กร/ชมรม',
                value: row.organization,
                message: `แถวที่ ${rowNum}: ต้องระบุชื่อองค์กร/ชมรม`,
                severity: 'error',
            });
        } else if (!orgSet.has(row.organization.toLowerCase())) {
            newOrganizations.add(row.organization);
            warnings.push({
                row: rowNum,
                column: 'ชื่อองค์กร/ชมรม',
                value: row.organization,
                message: `แถวที่ ${rowNum}: "${row.organization}" เป็นองค์กรใหม่ที่ยังไม่มีในระบบ (จะสร้างอัตโนมัติ)`,
                severity: 'warning',
            });
        }

        // Required: project_name
        if (!row.project_name || row.project_name.trim() === '') {
            errors.push({
                row: rowNum,
                column: 'ชื่อโครงการ',
                value: row.project_name,
                message: `แถวที่ ${rowNum}: ต้องระบุชื่อโครงการ`,
                severity: 'error',
            });
        } else if (row.project_name.length < 3) {
            errors.push({
                row: rowNum,
                column: 'ชื่อโครงการ',
                value: row.project_name,
                message: `แถวที่ ${rowNum}: ชื่อโครงการสั้นเกินไป (ต้องมีอย่างน้อย 3 ตัวอักษร)`,
                severity: 'error',
            });
        }

        // Check duplicate within batch
        const projectKey = row.project_name.toLowerCase();
        if (batchProjectNames.has(projectKey)) {
            const firstRow = batchProjectNames.get(projectKey)!;
            warnings.push({
                row: rowNum,
                column: 'ชื่อโครงการ',
                value: row.project_name,
                message: `แถวที่ ${rowNum}: ชื่อโครงการซ้ำกับแถวที่ ${firstRow} ในไฟล์เดียวกัน`,
                severity: 'warning',
            });
            duplicateProjects.push(row.project_name);
        } else {
            batchProjectNames.set(projectKey, rowNum);
        }

        // Check existing project in database
        if (row.project_name && projectSet.has(projectKey)) {
            warnings.push({
                row: rowNum,
                column: 'ชื่อโครงการ',
                value: row.project_name,
                message: `แถวที่ ${rowNum}: โครงการ "${row.project_name}" มีอยู่ในระบบแล้ว (จะอัปเดตข้อมูล)`,
                severity: 'warning',
            });
        }

        // Required: budget_requested
        if (row.budget_requested === undefined || row.budget_requested === null) {
            errors.push({
                row: rowNum,
                column: 'งบที่เสนอขอ',
                value: row.budget_requested,
                message: `แถวที่ ${rowNum}: ต้องระบุงบที่เสนอขอ`,
                severity: 'error',
            });
        } else if (row.budget_requested < 0) {
            errors.push({
                row: rowNum,
                column: 'งบที่เสนอขอ',
                value: row.budget_requested,
                message: `แถวที่ ${rowNum}: งบที่เสนอขอต้องไม่ติดลบ`,
                severity: 'error',
            });
        } else if (row.budget_requested === 0) {
            warnings.push({
                row: rowNum,
                column: 'งบที่เสนอขอ',
                value: row.budget_requested,
                message: `แถวที่ ${rowNum}: งบที่เสนอขอเป็น 0 บาท`,
                severity: 'warning',
            });
        }

        // Required: budget_approved
        if (row.budget_approved === undefined || row.budget_approved === null) {
            errors.push({
                row: rowNum,
                column: 'งบที่อนุมัติ',
                value: row.budget_approved,
                message: `แถวที่ ${rowNum}: ต้องระบุงบที่อนุมัติ`,
                severity: 'error',
            });
        } else if (row.budget_approved < 0) {
            errors.push({
                row: rowNum,
                column: 'งบที่อนุมัติ',
                value: row.budget_approved,
                message: `แถวที่ ${rowNum}: งบที่อนุมัติต้องไม่ติดลบ`,
                severity: 'error',
            });
        } else if (row.budget_requested > 0 && row.budget_approved > row.budget_requested) {
            warnings.push({
                row: rowNum,
                column: 'งบที่อนุมัติ',
                value: row.budget_approved,
                message: `แถวที่ ${rowNum}: งบที่อนุมัติ (${row.budget_approved.toLocaleString()} บาท) มากกว่างบที่เสนอขอ (${row.budget_requested.toLocaleString()} บาท)`,
                severity: 'warning',
            });
        }

        // Optional: budget_average
        if (row.budget_average !== undefined && row.budget_average < 0) {
            errors.push({
                row: rowNum,
                column: 'งบเฉลี่ย',
                value: row.budget_average,
                message: `แถวที่ ${rowNum}: งบเฉลี่ยต้องไม่ติดลบ`,
                severity: 'error',
            });
        }

        totalErrors += errors.length;
        totalWarnings += warnings.length;

        return {
            ...row,
            _errors: errors,
            _warnings: warnings,
            _isValid: errors.length === 0,
        };
    });

    const validRows = validatedRows.filter(r => r._isValid).length;
    const errorRows = validatedRows.filter(r => !r._isValid).length;
    const warningRows = validatedRows.filter(r => r._warnings.length > 0 && r._isValid).length;

    return {
        rows: validatedRows,
        totalErrors,
        totalWarnings,
        isValid: totalErrors === 0,
        summary: {
            totalRows: validatedRows.length,
            validRows,
            errorRows,
            warningRows,
            newOrganizations: Array.from(newOrganizations),
            duplicateProjects,
        },
    };
}
