export type ProjectStatus = 'อนุมัติ' | 'ตัดงบ' | 'ไม่อนุมัติ' | 'รอพิจารณา';

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
    is_published: boolean;
    created_at: string;
}

export interface DashboardStats {
    totalRequested: number;
    totalApproved: number;
    totalCut: number;
    approvalRate: number;
}
