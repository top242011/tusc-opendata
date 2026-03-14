'use client';

import { useReducer, useCallback } from 'react';
import { ImportStepUpload } from './ImportStepUpload';
import { ImportStepPreview } from './ImportStepPreview';
import { ImportStepConfirm } from './ImportStepConfirm';
import type { ImportRow } from '@/lib/types';
import type { ParseResult } from '@/lib/template-parser';
import type { ValidationResult } from '@/lib/import-validator';
import { CheckCircle2, Upload, Eye, Send } from 'lucide-react';

// ── State ────────────────────────────────────────────────────────
export interface WizardState {
    step: 1 | 2 | 3;
    file: File | null;
    fiscalYear: number;
    campus: string;
    parseResult: ParseResult | null;
    validationResult: ValidationResult | null;
    importProgress: { current: number; total: number; status: 'idle' | 'importing' | 'done' | 'error'; errorMessages: string[] };
    importedProjectIds: number[];
}

type WizardAction =
    | { type: 'SET_FILE'; file: File }
    | { type: 'SET_FISCAL_YEAR'; year: number }
    | { type: 'SET_CAMPUS'; campus: string }
    | { type: 'SET_PARSE_RESULT'; result: ParseResult }
    | { type: 'SET_VALIDATION_RESULT'; result: ValidationResult }
    | { type: 'UPDATE_ROW'; index: number; row: ImportRow }
    | { type: 'REMOVE_ROW'; index: number }
    | { type: 'GO_TO_STEP'; step: 1 | 2 | 3 }
    | { type: 'SET_IMPORT_PROGRESS'; progress: Partial<WizardState['importProgress']> }
    | { type: 'ADD_IMPORTED_ID'; id: number }
    | { type: 'RESET' };

const currentFiscalYear = new Date().getFullYear() + 543;

const initialState: WizardState = {
    step: 1,
    file: null,
    fiscalYear: currentFiscalYear,
    campus: 'central',
    parseResult: null,
    validationResult: null,
    importProgress: { current: 0, total: 0, status: 'idle', errorMessages: [] },
    importedProjectIds: [],
};

function reducer(state: WizardState, action: WizardAction): WizardState {
    switch (action.type) {
        case 'SET_FILE':
            return { ...state, file: action.file };
        case 'SET_FISCAL_YEAR':
            return { ...state, fiscalYear: action.year };
        case 'SET_CAMPUS':
            return { ...state, campus: action.campus };
        case 'SET_PARSE_RESULT':
            return { ...state, parseResult: action.result };
        case 'SET_VALIDATION_RESULT':
            return { ...state, validationResult: action.result, step: 2 };
        case 'UPDATE_ROW':
            if (!state.validationResult) return state;
            const updatedRows = [...state.validationResult.rows];
            updatedRows[action.index] = action.row;
            return {
                ...state,
                validationResult: { ...state.validationResult, rows: updatedRows },
            };
        case 'REMOVE_ROW':
            if (!state.validationResult) return state;
            const filteredRows = state.validationResult.rows.filter((_, i) => i !== action.index);
            return {
                ...state,
                validationResult: {
                    ...state.validationResult,
                    rows: filteredRows,
                    summary: {
                        ...state.validationResult.summary,
                        totalRows: filteredRows.length,
                        validRows: filteredRows.filter(r => r._isValid).length,
                        errorRows: filteredRows.filter(r => !r._isValid).length,
                    },
                },
            };
        case 'GO_TO_STEP':
            return { ...state, step: action.step };
        case 'SET_IMPORT_PROGRESS':
            return {
                ...state,
                importProgress: { ...state.importProgress, ...action.progress },
            };
        case 'ADD_IMPORTED_ID':
            return {
                ...state,
                importedProjectIds: [...state.importedProjectIds, action.id],
            };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

// ── Wizard Steps ─────────────────────────────────────────────────
const STEPS = [
    { num: 1 as const, label: 'อัปโหลด', icon: Upload },
    { num: 2 as const, label: 'ตรวจสอบ', icon: Eye },
    { num: 3 as const, label: 'นำเข้า', icon: Send },
];

export function ImportWizard() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleReset = useCallback(() => dispatch({ type: 'RESET' }), []);

    return (
        <div>
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = state.step === s.num;
                    const isDone = state.step > s.num;
                    return (
                        <div key={s.num} className="flex items-center gap-2">
                            {i > 0 && (
                                <div className={`w-8 h-px ${isDone ? 'bg-[rgb(var(--ios-accent))]' : 'bg-[rgb(var(--ios-separator))]'}`} />
                            )}
                            <div className="flex items-center gap-2">
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                                        ${isDone
                                            ? 'bg-[rgb(var(--ios-accent))] text-white'
                                            : isActive
                                                ? 'bg-[rgb(var(--ios-accent))]/15 text-[rgb(var(--ios-accent))] ring-2 ring-[rgb(var(--ios-accent))]/30'
                                                : 'bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))]'
                                        }
                                    `}
                                >
                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                </div>
                                <span className={`text-sm font-medium hidden sm:inline ${isActive ? 'text-[rgb(var(--ios-accent))]' : isDone ? 'text-[rgb(var(--ios-text-primary))]' : 'text-[rgb(var(--ios-text-tertiary))]'}`}>
                                    {s.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            {state.step === 1 && (
                <ImportStepUpload state={state} dispatch={dispatch} />
            )}
            {state.step === 2 && (
                <ImportStepPreview state={state} dispatch={dispatch} />
            )}
            {state.step === 3 && (
                <ImportStepConfirm state={state} dispatch={dispatch} onReset={handleReset} />
            )}
        </div>
    );
}
