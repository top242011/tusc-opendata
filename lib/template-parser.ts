'use server';

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { IMPORT_TEMPLATE_COLUMNS, HEADER_ALIASES } from './import-templates';
import type { ImportRow, ImportError } from './types';

export interface ParseResult {
    rows: ImportRow[];
    headerMap: Record<string, string>;
    unmappedHeaders: string[];
    totalRows: number;
}

/**
 * Parse an uploaded Excel or CSV file into ImportRow objects.
 * Uses deterministic header matching (no AI).
 */
export async function parseImportFile(file: File): Promise<ParseResult> {
    const ext = file.name.toLowerCase().split('.').pop();

    if (ext === 'csv') {
        return parseCsvFile(file);
    }
    if (ext === 'xlsx' || ext === 'xls') {
        return parseExcelFile(file);
    }

    throw new Error(`ไม่รองรับไฟล์ประเภท .${ext} กรุณาใช้ไฟล์ .xlsx หรือ .csv`);
}

async function parseExcelFile(file: File): Promise<ParseResult> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });

    // Use first sheet
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rawData: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    return processRawRows(rawData);
}

async function parseCsvFile(file: File): Promise<ParseResult> {
    const text = await file.text();
    const result = Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
    });

    return processRawRows(result.data as unknown[][]);
}

function processRawRows(rawData: unknown[][]): ParseResult {
    if (rawData.length < 2) {
        throw new Error('ไฟล์ว่างหรือมีข้อมูลไม่เพียงพอ (ต้องมีอย่างน้อย 1 แถวหัวคอลัมน์ + 1 แถวข้อมูล)');
    }

    // Find header row (first non-empty row)
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
        const row = rawData[i];
        if (row && row.some(cell => cell !== '')) {
            headerRowIndex = i;
            break;
        }
    }

    const headerRow = rawData[headerRowIndex].map(cell => String(cell).trim());
    const headerMap = matchHeaders(headerRow);

    // Check if row after header is machine-readable keys (from template), skip it
    let dataStartIndex = headerRowIndex + 1;
    if (dataStartIndex < rawData.length) {
        const possibleKeysRow = rawData[dataStartIndex].map(cell => String(cell).trim());
        const templateKeys = IMPORT_TEMPLATE_COLUMNS.map(col => col.key);
        const isKeysRow = possibleKeysRow.some(cell => templateKeys.includes(cell));
        if (isKeysRow) {
            dataStartIndex++;
        }
    }

    const unmappedHeaders = headerRow.filter(h => {
        return h !== '' && !Object.values(headerMap).includes(h);
    });

    const rows: ImportRow[] = [];
    for (let i = dataStartIndex; i < rawData.length; i++) {
        const rawRow = rawData[i];
        if (!rawRow || rawRow.every(cell => cell === '' || cell === null || cell === undefined)) {
            continue; // Skip empty rows
        }

        const row = mapRowToImportRow(rawRow, headerRow, headerMap, i + 1);
        rows.push(row);
    }

    return {
        rows,
        headerMap,
        unmappedHeaders,
        totalRows: rows.length,
    };
}

/**
 * Match file headers to template columns using aliases
 */
function matchHeaders(headers: string[]): Record<string, string> {
    const map: Record<string, string> = {};

    for (const col of IMPORT_TEMPLATE_COLUMNS) {
        const aliases = HEADER_ALIASES[col.key] || [];
        const allMatches = [col.label, col.key, ...aliases];

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i].trim().toLowerCase();
            if (header === '') continue;

            for (const match of allMatches) {
                if (header === match.toLowerCase() || header.includes(match.toLowerCase())) {
                    map[col.key] = headers[i];
                    break;
                }
            }
            if (map[col.key]) break;
        }
    }

    return map;
}

function mapRowToImportRow(
    rawRow: unknown[],
    headers: string[],
    headerMap: Record<string, string>,
    rowNumber: number
): ImportRow {
    const getValue = (key: string): unknown => {
        const headerName = headerMap[key];
        if (!headerName) return undefined;
        const colIndex = headers.indexOf(headerName);
        if (colIndex === -1) return undefined;
        return rawRow[colIndex];
    };

    const parseNumber = (val: unknown): number => {
        if (val === null || val === undefined || val === '') return 0;
        // Remove commas, currency symbols, spaces
        const cleaned = String(val).replace(/[,฿\s]/g, '');
        const num = Number(cleaned);
        return isNaN(num) ? 0 : num;
    };

    const errors: ImportError[] = [];
    const warnings: ImportError[] = [];

    const org = String(getValue('organization') ?? '').trim();
    const projectName = String(getValue('project_name') ?? '').trim();
    const budgetRequested = parseNumber(getValue('budget_requested'));
    const budgetApproved = parseNumber(getValue('budget_approved'));
    const budgetAverage = getValue('budget_average') !== undefined && getValue('budget_average') !== ''
        ? parseNumber(getValue('budget_average'))
        : undefined;
    const notes = String(getValue('notes') ?? '').trim() || undefined;

    return {
        organization: org,
        project_name: projectName,
        budget_requested: budgetRequested,
        budget_approved: budgetApproved,
        budget_average: budgetAverage,
        notes,
        _rowNumber: rowNumber,
        _errors: errors,
        _warnings: warnings,
        _isValid: true, // Will be set by validator
    };
}
