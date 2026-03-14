export type ProjectStatus = 'อนุมัติ' | 'ตัดงบ' | 'ไม่อนุมัติ' | 'รอพิจารณา';

export type Campus = 'central' | 'rangsit' | 'thaprachan' | 'lampang';

export const CAMPUS_LABELS: Record<Campus, string> = {
    central: 'ส่วนกลาง',
    rangsit: 'รังสิต',
    thaprachan: 'ท่าพระจันทร์',
    lampang: 'ลำปาง',
};

export interface Project {
    id: number;
    organization: string;
    project_name: string;
    fiscal_year: number;
    budget_requested: number;
    budget_approved: number;
    budget_average?: number;
    status: ProjectStatus;
    notes?: string;
    campus: Campus;
    // New Fields
    responsible_person?: string;
    advisor?: string;
    activity_type?: string;
    rationale?: string;
    objectives?: string[];
    targets?: string;
    sdg_goals?: string[];
    budget_breakdown?: BudgetBreakdownItem[];
    is_published: boolean;
    created_at: string;
    has_files?: boolean;
}

export interface BudgetBreakdownItem {
    item: string;
    amount: number; // Quantity
    unit: string;
    cost_per_unit: number;
    total: number;
}

export interface ProjectFile {
    id: string;
    project_id: number;
    file_name: string;
    file_url: string;
    file_type: string;
    category: string;
    uploaded_at: string;
}

export interface DashboardStats {
    totalRequested: number;
    totalApproved: number;
    totalCut: number;
    approvalRate: number;
}

// ============================================
// CMS Types
// ============================================

export type OrganizationType = 'club' | 'council' | 'committee' | 'department' | 'other';

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
    club: 'ชมรม',
    council: 'สภา',
    committee: 'คณะกรรมการ',
    department: 'หน่วยงาน',
    other: 'อื่นๆ',
};

export interface Organization {
    id: number;
    name: string;
    short_name?: string;
    type: OrganizationType;
    campus: Campus;
    contact_person?: string;
    contact_email?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type ImportSourceType = 'template_excel' | 'template_csv' | 'ai_pdf' | 'manual';
export type ImportBatchStatus = 'pending' | 'validating' | 'previewing' | 'importing' | 'completed' | 'rolled_back' | 'failed';

export interface ImportBatch {
    id: string;
    user_email: string;
    fiscal_year: number;
    campus: Campus;
    source_type: ImportSourceType;
    file_name?: string;
    total_rows: number;
    imported_rows: number;
    failed_rows: number;
    status: ImportBatchStatus;
    error_log?: ImportError[];
    project_ids?: number[];
    created_at: string;
    completed_at?: string;
}

export interface ImportError {
    row: number;
    column: string;
    value: unknown;
    message: string;
    severity: 'error' | 'warning';
}

export interface ImportRow {
    organization: string;
    project_name: string;
    budget_requested: number;
    budget_approved: number;
    budget_average?: number;
    notes?: string;
    _rowNumber: number;
    _errors: ImportError[];
    _warnings: ImportError[];
    _isValid: boolean;
}

export interface BudgetCategory {
    id: number;
    name: string;
    description?: string;
    max_rate?: number;
    unit?: string;
    rules?: string;
    campus: Campus;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

export interface CmsPage {
    id: string;
    title: string;
    content: string;
    updated_by?: string;
    updated_at: string;
}

export interface SystemSetting {
    key: string;
    value: unknown;
    description?: string;
    updated_at: string;
}
