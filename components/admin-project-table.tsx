"use client";

import { useState, useMemo } from "react";
import Link from 'next/link';
import { Project, Campus, CAMPUS_LABELS } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { deleteProject } from "@/lib/actions";
import { Modal } from "@/components/ui/modal";
import { ProjectForm } from "@/components/project-form";
import { Edit2, Trash2, Plus, Search, Filter, X, FileText, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { Toast } from "@/components/ui/toast";

interface AdminProjectTableProps {
    projects: Project[];
}

export function AdminProjectTable({ projects }: AdminProjectTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterFiscalYear, setFilterFiscalYear] = useState<string>('all');
    const [filterCampus, setFilterCampus] = useState<string>('all');
    const [filterActivityType, setFilterActivityType] = useState<string>('all');
    const [filterHasFiles, setFilterHasFiles] = useState<string>('all');
    const [filterBudgetStatus, setFilterBudgetStatus] = useState<string>('all');

    const uniqueYears = useMemo(() => Array.from(new Set(projects.map(p => p.fiscal_year))).sort().reverse(), [projects]);
    const uniqueActivityTypes = useMemo(() => Array.from(new Set(projects.map(p => p.activity_type).filter(Boolean))), [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const searchLower = searchTerm.toLowerCase();
            const matchesText =
                p.project_name.toLowerCase().includes(searchLower) ||
                p.organization.toLowerCase().includes(searchLower) ||
                (p.responsible_person && p.responsible_person.toLowerCase().includes(searchLower)) ||
                (p.advisor && p.advisor.toLowerCase().includes(searchLower));
            if (!matchesText) return false;
            if (filterFiscalYear !== 'all' && p.fiscal_year.toString() !== filterFiscalYear) return false;
            if (filterCampus !== 'all' && p.campus !== filterCampus) return false;
            if (filterActivityType !== 'all' && p.activity_type !== filterActivityType) return false;
            if (filterHasFiles === 'yes' && !p.has_files) return false;
            if (filterHasFiles === 'no' && p.has_files) return false;
            if (filterBudgetStatus === 'approved' && p.budget_approved <= 0) return false;
            if (filterBudgetStatus === 'none' && p.budget_approved > 0) return false;
            if (filterBudgetStatus === 'cut' && !(p.budget_approved > 0 && p.budget_approved < p.budget_requested)) return false;
            return true;
        });
    }, [projects, searchTerm, filterFiscalYear, filterCampus, filterActivityType, filterHasFiles, filterBudgetStatus]);

    const activeFilterCount = [
        filterFiscalYear !== 'all',
        filterCampus !== 'all',
        filterActivityType !== 'all',
        filterHasFiles !== 'all',
        filterBudgetStatus !== 'all',
    ].filter(Boolean).length;

    const clearFilters = () => {
        setFilterFiscalYear('all');
        setFilterCampus('all');
        setFilterActivityType('all');
        setFilterHasFiles('all');
        setFilterBudgetStatus('all');
        setSearchTerm('');
    };

    const handleAdd = () => { setEditingProject(undefined); setIsModalOpen(true); };
    const handleEdit = (project: Project) => { setEditingProject(project); setIsModalOpen(true); };

    const handleDelete = async (id: number) => {
        if (!confirm("ต้องการลบโครงการนี้ใช่หรือไม่?")) return;
        setDeletingId(id);
        try {
            await deleteProject(id);
        } catch {
            setToastMessage('ลบโครงการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
            setToastType('error');
            setShowToast(true);
        } finally {
            setDeletingId(null);
        }
    };

    const selectCls = "w-full text-sm border border-[rgb(var(--ios-separator))]/50 rounded-[var(--ios-radius-sm)] px-2.5 py-2 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ios-accent))]";

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-[rgb(var(--ios-text-primary))]">
                        จัดการโครงการ
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))]">
                        {filteredProjects.length} / {projects.length}
                    </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[rgb(var(--ios-text-tertiary))]" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ, องค์กร, ผู้รับผิดชอบ..."
                            className="pl-9 h-9 w-full rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))] placeholder:text-[rgb(var(--ios-text-tertiary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--ios-accent))] text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2 text-[rgb(var(--ios-text-tertiary))] hover:text-[rgb(var(--ios-text-secondary))]">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-[var(--ios-radius-sm)] text-sm border font-medium transition-colors",
                            activeFilterCount > 0 || showFilters
                                ? "bg-[rgb(var(--ios-accent))]/10 border-[rgb(var(--ios-accent))]/30 text-[rgb(var(--ios-accent))]"
                                : "bg-[rgb(var(--ios-bg-primary))] border-[rgb(var(--ios-separator))]/50 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">ตัวกรอง</span>
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[rgb(var(--ios-accent))] text-white text-[10px] font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-1.5 bg-[rgb(var(--ios-accent))] text-white px-3 py-2 rounded-[var(--ios-radius-sm)] text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> เพิ่มโครงการ
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[rgb(var(--ios-text-tertiary))]">ปีงบประมาณ</label>
                        <select className={selectCls} value={filterFiscalYear} onChange={(e) => setFilterFiscalYear(e.target.value)}>
                            <option value="all">ทั้งหมด</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[rgb(var(--ios-text-tertiary))]">ศูนย์การศึกษา</label>
                        <select className={selectCls} value={filterCampus} onChange={(e) => setFilterCampus(e.target.value)}>
                            <option value="all">ทุกศูนย์การศึกษา</option>
                            <option value="central">ส่วนกลาง</option>
                            <option value="thaprachan">ท่าพระจันทร์</option>
                            <option value="rangsit">รังสิต</option>
                            <option value="lampang">ลำปาง</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[rgb(var(--ios-text-tertiary))]">ประเภทกิจกรรม</label>
                        <select className={selectCls} value={filterActivityType} onChange={(e) => setFilterActivityType(e.target.value)}>
                            <option value="all">ทั้งหมด</option>
                            {uniqueActivityTypes.map((t: any) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[rgb(var(--ios-text-tertiary))]">สถานะเอกสาร</label>
                        <select className={selectCls} value={filterHasFiles} onChange={(e) => setFilterHasFiles(e.target.value)}>
                            <option value="all">ทั้งหมด</option>
                            <option value="yes">มีไฟล์แนบแล้ว</option>
                            <option value="no">ยังไม่มีไฟล์</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[rgb(var(--ios-text-tertiary))]">สถานะงบประมาณ</label>
                        <select className={selectCls} value={filterBudgetStatus} onChange={(e) => setFilterBudgetStatus(e.target.value)}>
                            <option value="all">ทั้งหมด</option>
                            <option value="approved">ได้รับการอนุมัติ</option>
                            <option value="cut">ถูกตัดงบ</option>
                            <option value="none">ยังไม่อนุมัติ</option>
                        </select>
                    </div>
                    {activeFilterCount > 0 && (
                        <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                            <button onClick={clearFilters} className="text-xs text-[rgb(var(--ios-red))] hover:underline flex items-center gap-1">
                                <X className="w-3 h-3" /> ล้างตัวกรองทั้งหมด
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-[rgb(var(--ios-separator))]/30 text-xs uppercase tracking-wider text-[rgb(var(--ios-text-tertiary))]">
                                <th className="px-4 py-3 font-semibold">ID</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">ปี / ศูนย์</th>
                                <th className="px-4 py-3 font-semibold min-w-[200px]">โครงการ / องค์กร</th>
                                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">งบที่ขอ</th>
                                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">งบที่ได้</th>
                                <th className="px-4 py-3 font-semibold text-center w-[50px]">ไฟล์</th>
                                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">สถานะ</th>
                                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--ios-separator))]/20">
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-[rgb(var(--ios-text-tertiary))]">
                                        {activeFilterCount > 0 || searchTerm ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-8 h-8 text-[rgb(var(--ios-fill-secondary))]" />
                                                <span>ไม่พบข้อมูลที่ตรงตามเงื่อนไข</span>
                                                <button onClick={clearFilters} className="text-[rgb(var(--ios-accent))] hover:underline text-sm">ล้างตัวกรอง</button>
                                            </div>
                                        ) : "ไม่มีข้อมูลโครงการ"}
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-[rgb(var(--ios-fill-tertiary))]/50 transition-colors group">
                                        <td className="px-4 py-3 font-mono text-xs text-[rgb(var(--ios-text-tertiary))]">{project.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            <div className="font-semibold text-[rgb(var(--ios-text-primary))]">{project.fiscal_year}</div>
                                            <div className="text-[rgb(var(--ios-text-tertiary))]">{CAMPUS_LABELS[project.campus] || project.campus}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-[rgb(var(--ios-text-primary))] line-clamp-1" title={project.project_name}>{project.project_name}</div>
                                            <div className="text-xs text-[rgb(var(--ios-text-secondary))] mt-0.5">{project.organization}</div>
                                            {(project.responsible_person || project.activity_type) && (
                                                <div className="flex gap-2 mt-1 text-[10px] text-[rgb(var(--ios-text-tertiary))]">
                                                    {project.activity_type && (
                                                        <span className="bg-[rgb(var(--ios-fill-tertiary))] px-1.5 py-0.5 rounded">{project.activity_type}</span>
                                                    )}
                                                    {project.responsible_person && <span>👤 {project.responsible_person}</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-[rgb(var(--ios-text-secondary))]">{formatTHB(project.budget_requested)}</td>
                                        <td className="px-4 py-3 text-right font-mono font-semibold text-[rgb(var(--ios-text-primary))]">{formatTHB(project.budget_approved)}</td>
                                        <td className="px-4 py-3 text-center">
                                            {project.has_files ? (
                                                <div className="flex justify-center" title="มีเอกสารแนบ">
                                                    <FileText className="w-4 h-4 text-[rgb(var(--ios-accent))]" />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity" title="ขาดเอกสาร">
                                                    <AlertCircle className="w-4 h-4 text-[rgb(var(--ios-orange))]" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {project.budget_approved > 0 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-green))]/10 text-[rgb(var(--ios-green))] border border-[rgb(var(--ios-green))]/20">
                                                    อนุมัติ
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-tertiary))] border border-[rgb(var(--ios-separator))]/50">
                                                    รอ
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1 opacity-100 [@media(hover:hover)]:opacity-60 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/admin/project/${project.id}`}
                                                    className="p-1.5 text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-accent))]/10 rounded transition-colors"
                                                    title="แก้ไขรายละเอียด"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/project/${project.id}`}
                                                    prefetch={false}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-accent))]/10 rounded transition-colors"
                                                    title="ดูรายละเอียดโครงการ"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="p-1.5 text-[rgb(var(--ios-red))] hover:bg-[rgb(var(--ios-red))]/10 rounded transition-colors"
                                                    title="ลบ"
                                                    disabled={deletingId === project.id}
                                                >
                                                    {deletingId === project.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredProjects.length > 0 && (
                    <div className="px-4 py-3 border-t border-[rgb(var(--ios-separator))]/30 text-xs text-[rgb(var(--ios-text-tertiary))]">
                        แสดง {filteredProjects.length} จาก {projects.length} โครงการ
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProject ? "แก้ไขโครงการ" : "เพิ่มโครงการใหม่"}
            >
                <ProjectForm
                    initialData={editingProject}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setToastMessage(editingProject
                            ? "แก้ไขข้อมูลสําเร็จ (ข้อมูลจะแสดงผลบนหน้าเว็บในอีก 5-10 นาที)"
                            : "เพิ่มโครงการเรียบร้อย (ข้อมูลจะแสดงผลบนหน้าเว็บในอีก 5-10 นาที)"
                        );
                        setToastType('success');
                        setShowToast(true);
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <Toast
                message={toastMessage}
                type={toastType}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}
