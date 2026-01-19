"use client";

import { useState, useMemo } from "react";
import Link from 'next/link';
import { Project, Campus, CAMPUS_LABELS } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { deleteProject } from "@/lib/actions";
import { Modal } from "@/components/ui/modal";
import { ProjectForm } from "@/components/project-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Plus, Search, Filter, X, ChevronDown, ChevronUp, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface AdminProjectTableProps {
    projects: Project[];
}

export function AdminProjectTable({ projects }: AdminProjectTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [filterFiscalYear, setFilterFiscalYear] = useState<string>('all');
    const [filterCampus, setFilterCampus] = useState<string>('all');
    const [filterActivityType, setFilterActivityType] = useState<string>('all');
    const [filterHasFiles, setFilterHasFiles] = useState<string>('all'); // all, yes, no
    const [filterBudgetStatus, setFilterBudgetStatus] = useState<string>('all'); // all, approved, cut, none

    // Derived Options for Dropdowns
    const uniqueYears = useMemo(() => Array.from(new Set(projects.map(p => p.fiscal_year))).sort().reverse(), [projects]);
    const uniqueActivityTypes = useMemo(() => Array.from(new Set(projects.map(p => p.activity_type).filter(Boolean))), [projects]);

    // --- Filter Logic ---
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            // Text Search
            const searchLower = searchTerm.toLowerCase();
            const matchesText =
                p.project_name.toLowerCase().includes(searchLower) ||
                p.organization.toLowerCase().includes(searchLower) ||
                (p.responsible_person && p.responsible_person.toLowerCase().includes(searchLower)) ||
                (p.advisor && p.advisor.toLowerCase().includes(searchLower));

            if (!matchesText) return false;

            // Fiscal Year
            if (filterFiscalYear !== 'all' && p.fiscal_year.toString() !== filterFiscalYear) return false;

            // Campus
            if (filterCampus !== 'all' && p.campus !== filterCampus) return false;

            // Activity Type
            if (filterActivityType !== 'all' && p.activity_type !== filterActivityType) return false;

            // Has Files
            if (filterHasFiles === 'yes' && !p.has_files) return false;
            if (filterHasFiles === 'no' && p.has_files) return false;

            // Budget Status
            if (filterBudgetStatus === 'approved' && p.budget_approved <= 0) return false; // Approved > 0
            if (filterBudgetStatus === 'none' && p.budget_approved > 0) return false; // Not approved yet
            if (filterBudgetStatus === 'cut' && !(p.budget_approved > 0 && p.budget_approved < p.budget_requested)) return false;


            return true;
        });
    }, [projects, searchTerm, filterFiscalYear, filterCampus, filterActivityType, filterHasFiles, filterBudgetStatus]);

    const activeFilterCount = [
        filterFiscalYear !== 'all',
        filterCampus !== 'all',
        filterActivityType !== 'all',
        filterHasFiles !== 'all',
        filterBudgetStatus !== 'all'
    ].filter(Boolean).length;

    const clearFilters = () => {
        setFilterFiscalYear('all');
        setFilterCampus('all');
        setFilterActivityType('all');
        setFilterHasFiles('all');
        setFilterBudgetStatus('all');
        setSearchTerm('');
    };

    // --- Actions ---
    const handleAdd = () => {
        setEditingProject(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("ต้องการลบโครงการนี้ใช่หรือไม่? แนะนำให้ตรวจสอบว่ามีไฟล์แนบหรือไม่ก่อนลบ")) return;
        setDeletingId(id);
        await deleteProject(id);
        setDeletingId(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <CardTitle>จัดการโครงการ ({filteredProjects.length})</CardTitle>
                            {projects.length > 0 && (
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Total: {projects.length}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อ, องค์กร, ผู้รับผิดชอบ..."
                                    className="pl-9 h-10 w-full rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm border font-medium transition-colors shadow-sm",
                                    activeFilterCount > 0 || showFilters
                                        ? "bg-slate-100 border-slate-300 text-slate-900"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">ตัวกรอง</span>
                                {activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="px-1.5 h-5 min-w-[20px] bg-blue-100 text-blue-700 ml-1">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </button>

                            <button
                                onClick={handleAdd}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-md text-sm hover:bg-blue-700 hover:shadow-md transition shadow-sm whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> เพิ่มโครงการ
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-200">
                            {/* 1. Fiscal Year */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">ปีงบประมาณ</label>
                                <select
                                    className="w-full text-sm border rounded-md p-2 bg-slate-50"
                                    value={filterFiscalYear}
                                    onChange={(e) => setFilterFiscalYear(e.target.value)}
                                >
                                    <option value="all">ทั้งหมด</option>
                                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            {/* 2. Campus */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">วิทยาเขต</label>
                                <select
                                    className="w-full text-sm border rounded-md p-2 bg-slate-50"
                                    value={filterCampus}
                                    onChange={(e) => setFilterCampus(e.target.value)}
                                >
                                    <option value="all">ทุกวิทยาเขต</option>
                                    <option value="central">ส่วนกลาง/ท่าพระจันทร์</option>
                                    <option value="rangsit">รังสิต</option>
                                    <option value="lampang">ลำปาง</option>
                                </select>
                            </div>

                            {/* 3. Activity Type */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">ประเภทกิจกรรม</label>
                                <select
                                    className="w-full text-sm border rounded-md p-2 bg-slate-50"
                                    value={filterActivityType}
                                    onChange={(e) => setFilterActivityType(e.target.value)}
                                >
                                    <option value="all">ทั้งหมด</option>
                                    {uniqueActivityTypes.map((t: any) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* 4. Document Status */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">สถานะเอกสาร</label>
                                <select
                                    className="w-full text-sm border rounded-md p-2 bg-slate-50"
                                    value={filterHasFiles}
                                    onChange={(e) => setFilterHasFiles(e.target.value)}
                                >
                                    <option value="all">ทั้งหมด</option>
                                    <option value="yes">✅ มีไฟล์แนบแล้ว</option>
                                    <option value="no">❌ ยังไม่มีไฟล์</option>
                                </select>
                            </div>

                            {/* 5. Budget Status */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">สถานะงบประมาณ</label>
                                <select
                                    className="w-full text-sm border rounded-md p-2 bg-slate-50"
                                    value={filterBudgetStatus}
                                    onChange={(e) => setFilterBudgetStatus(e.target.value)}
                                >
                                    <option value="all">ทั้งหมด</option>
                                    <option value="approved">ได้รับการอนุมัติ</option>
                                    <option value="cut">ถูกตัดงบ</option>
                                    <option value="none">ยังไม่อนุมัติ</option>
                                </select>
                            </div>

                            {activeFilterCount > 0 && (
                                <div className="sm:col-span-2 lg:col-span-1 pt-5">
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-red-600 hover:text-red-800 underline flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> ล้างตัวกรองทั้งหมด
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto min-h-[300px]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 whitespace-nowrap">ID</th>
                                    <th className="px-4 py-3 whitespace-nowrap">ปี/ศูนย์</th>
                                    <th className="px-4 py-3 min-w-[200px]">โครงการ / องค์กร</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">งบที่ขอ</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">งบที่ได้</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap w-[50px]">ไฟล์</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                            {activeFilterCount > 0 || searchTerm ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Search className="w-8 h-8 text-slate-200" />
                                                    <span>ไม่พบข้อมูลที่ตรงตามเงื่อนไข</span>
                                                    <button onClick={clearFilters} className="text-blue-600 hover:underline">ล้างตัวกรอง</button>
                                                </div>
                                            ) : (
                                                "ไม่มีข้อมูลโครงการ"
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50 group">
                                            <td className="px-4 py-3 font-mono text-xs text-slate-400">{project.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs">
                                                <div className="font-medium text-slate-700">{project.fiscal_year}</div>
                                                <div className="text-slate-500">{CAMPUS_LABELS[project.campus] || project.campus}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-900 line-clamp-2 md:line-clamp-1" title={project.project_name}>{project.project_name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{project.organization}</div>
                                                {(project.responsible_person || project.activity_type) && (
                                                    <div className="flex gap-2 mt-1 text-[10px] text-slate-400">
                                                        {project.activity_type && <span className="bg-slate-100 px-1 rounded">{project.activity_type}</span>}
                                                        {project.responsible_person && <span>👤 {project.responsible_person}</span>}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-slate-600">{formatTHB(project.budget_requested)}</td>
                                            <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">{formatTHB(project.budget_approved)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {project.has_files ? (
                                                    <div className="flex justify-center" title="มีเอกสารแนบ">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="ขาดเอกสาร">
                                                        <AlertCircle className="w-4 h-4 text-amber-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {project.budget_approved > 0 ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">อนุมัติ</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50">รอ</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/admin/project/${project.id}`}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="แก้ไขรายละเอียด"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(project.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                        title="ลบ"
                                                        disabled={deletingId === project.id}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingProject ? "แก้ไขโครงการ" : "เพิ่มโครงการใหม่"}
                >
                    <ProjectForm
                        initialData={editingProject}
                        onSuccess={() => setIsModalOpen(false)}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            </Card>
        </div>
    );
}
