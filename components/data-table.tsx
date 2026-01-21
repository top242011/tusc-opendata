"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/types";
import { formatTHB, getStatusLabel } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, Filter, FileX, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/utils/cn";

interface DataTableProps {
    projects: Project[];
}

type SortConfig = {
    key: keyof Project | '';
    direction: 'asc' | 'desc';
};

export function DataTable({ projects }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrg, setSelectedOrg] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [noDocAlertOpen, setNoDocAlertOpen] = useState(false);
    const itemsPerPage = 10;

    // Extract unique organizations, years, and statuses for filter options
    const organizations = useMemo(() => Array.from(new Set(projects.map(p => p.organization))), [projects]);
    const years = useMemo(() => Array.from(new Set(projects.map(p => p.fiscal_year))).sort((a, b) => b - a), [projects]);
    const statuses = useMemo(() => Array.from(new Set(projects.map(p => p.status))), [projects]);

    const handleSort = (key: keyof Project) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Filter and Sort logic
    const filteredProjects = useMemo(() => {
        let result = projects.filter(project => {
            const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesOrg = selectedOrg === 'All' || project.organization === selectedOrg;
            const matchesYear = selectedYear === 'All' || project.fiscal_year.toString() === selectedYear;
            const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
            return matchesSearch && matchesOrg && matchesYear && matchesStatus;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Project];
                const bValue = b[sortConfig.key as keyof Project];

                if (aValue === bValue) return 0;
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;

                // Handle different types if needed, generally string/number works with < >
                // For strings, use localeCompare for better Thai sorting
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [projects, searchTerm, selectedOrg, selectedYear, selectedStatus, sortConfig]);

    // Pagination logic
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const statusVariant = (status: string) => {
        switch (status) {
            case 'อนุมัติ': return 'success';
            case 'ตัดงบ': return 'warning';
            case 'ไม่อนุมัติ': return 'destructive';
            default: return 'secondary';
        }
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof Project }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-50" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-4 h-4 text-blue-600" />
            : <ArrowDown className="w-4 h-4 text-blue-600" />;
    };

    return (
        <>
            <NoDocumentAlert open={noDocAlertOpen} onOpenChange={setNoDocAlertOpen} />
            <Card className="w-full">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle>รายการโครงการทั้งหมด</CardTitle>

                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-wrap">
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อโครงการ..."
                                    aria-label="ค้นหาชื่อโครงการ"
                                    className="pl-9 h-10 w-full sm:w-[200px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <select
                                className="h-10 w-full sm:w-auto rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                aria-label="กรองตามสถานะ"
                            >
                                <option value="All">ทุกสถานะ</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{getStatusLabel(status)}</option>
                                ))}
                            </select>

                            <select
                                className="h-10 w-full sm:w-auto rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                aria-label="กรองตามองค์กร"
                            >
                                <option value="All">ทุกองค์กร</option>
                                {organizations.map(org => (
                                    <option key={org} value={org}>{org}</option>
                                ))}
                            </select>

                            <select
                                className="h-10 w-full sm:w-auto rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                aria-label="กรองตามปีงบประมาณ"
                            >
                                <option value="All">ทุกปีงบประมาณ</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        {/* Live Region for Screen Readers */}
                        <div role="status" aria-live="polite" className="sr-only">
                            {filteredProjects.length} โครงการที่พบ
                        </div>
                        <table className="w-full text-sm text-left">
                            <caption className="sr-only">รายการโครงการและงบประมาณ</caption>
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3 w-[100px] hidden md:table-cell">สถานะ</th>
                                    <th className="px-4 py-3">ชื่อโครงการ</th>
                                    <th
                                        className="px-4 py-3 cursor-pointer group hover:bg-slate-100 transition-colors hidden md:table-cell"
                                        onClick={() => handleSort('organization')}
                                    >
                                        <div className="flex items-center gap-1">
                                            องค์กร
                                            <SortIcon columnKey="organization" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-right cursor-pointer group hover:bg-slate-100 transition-colors hidden lg:table-cell"
                                        onClick={() => handleSort('budget_requested')}
                                    >
                                        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                            งบที่เสนอขอ
                                            <SortIcon columnKey="budget_requested" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-right cursor-pointer group hover:bg-slate-100 transition-colors"
                                        onClick={() => handleSort('budget_approved')}
                                    >
                                        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                            งบที่ได้รับ
                                            <SortIcon columnKey="budget_approved" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="bg-slate-100 p-3 rounded-full">
                                                    <Search className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">ไม่พบข้อมูลโครงการ</p>
                                                    <p className="text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setSelectedOrg('All');
                                                        setSelectedYear('All');
                                                        setSelectedStatus('All');
                                                    }}
                                                    className="text-sm text-blue-600 hover:underline mt-2"
                                                >
                                                    ล้างตัวกรองทั้งหมด
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50/50 h-[72px]">
                                            <td className="px-4 py-3 align-top md:align-middle hidden md:table-cell">
                                                <Badge variant={statusVariant(project.status) as any} className="whitespace-nowrap">
                                                    {getStatusLabel(project.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 font-medium align-top md:align-middle">
                                                <div className="flex flex-col gap-1">
                                                    {project.has_files ? (
                                                        <Link href={`/project/${project.id}`} prefetch={false} className="hover:text-blue-600 hover:underline transition-colors line-clamp-2">
                                                            {project.project_name}
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            onClick={() => setNoDocAlertOpen(true)}
                                                            className="text-left hover:text-red-500 hover:underline transition-colors line-clamp-2"
                                                        >
                                                            {project.project_name}
                                                        </button>
                                                    )}
                                                    {/* Mobile: Show Organization here */}
                                                    <div className="text-xs text-slate-500 md:hidden line-clamp-1">
                                                        {project.organization}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 hidden md:table-cell align-top md:align-middle">
                                                <div className="line-clamp-2">{project.organization}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right hidden lg:table-cell align-top md:align-middle">{formatTHB(project.budget_requested)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-900 align-top md:align-middle whitespace-nowrap">{formatTHB(project.budget_approved)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            แสดง {paginatedProjects.length} จาก {filteredProjects.length} รายการ
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-slate-200 disabled:opacity-50 hover:bg-slate-100"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                aria-label="หน้าก่อนหน้า"
                            >
                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <div className="text-sm font-medium">
                                หน้าที่ {currentPage} / {totalPages || 1}
                            </div>
                            <button
                                className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-slate-200 disabled:opacity-50 hover:bg-slate-100"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                aria-label="หน้าถัดไป"
                            >
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

function NoDocumentAlert({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <Modal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="ไม่มีเอกสารของโครงการนี้"
            className="w-[90%] max-w-sm rounded-lg sm:max-w-[425px]"
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start gap-3 text-slate-600">
                    <div className="flex justify-center w-full sm:w-auto">
                        <FileX className="w-10 h-10 text-red-500 shrink-0" />
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                        <div className="font-medium text-slate-900">ไม่พบไฟล์เอกสาร</div>
                        <p className="text-sm">โครงการนี้ยังไม่มีการอัปโหลดเอกสารต้นฉบับ (PDF) หรือไฟล์แนบใดๆ ในขณะนี้</p>
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 text-sm font-medium"
                    >
                        รับทราบ
                    </button>
                </div>
            </div>
        </Modal>
    );
}
