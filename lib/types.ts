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
