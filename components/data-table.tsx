"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/utils/cn";

interface DataTableProps {
    projects: Project[];
}

export function DataTable({ projects }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrg, setSelectedOrg] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Extract unique organizations and years for filter options
    const organizations = useMemo(() => Array.from(new Set(projects.map(p => p.organization))), [projects]);
    const years = useMemo(() => Array.from(new Set(projects.map(p => p.fiscal_year))).sort((a, b) => b - a), [projects]);

    // Filter logic
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesOrg = selectedOrg === 'All' || project.organization === selectedOrg;
            const matchesYear = selectedYear === 'All' || project.fiscal_year.toString() === selectedYear;
            return matchesSearch && matchesOrg && matchesYear;
        });
    }, [projects, searchTerm, selectedOrg, selectedYear]);

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
            case 'อนุมัติ': return 'success'; // You might need to add 'success' to Badge variants otherwise use default/secondary
            case 'ตัดงบ': return 'warning';
            case 'ไม่อนุมัติ': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle>รายการโครงการทั้งหมด</CardTitle>

                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อโครงการ..."
                                className="pl-9 h-10 w-full md:w-[250px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                            value={selectedOrg}
                            onChange={(e) => setSelectedOrg(e.target.value)}
                        >
                            <option value="All">ทุกองค์กร</option>
                            {organizations.map(org => (
                                <option key={org} value={org}>{org}</option>
                            ))}
                        </select>

                        <select
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
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
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">สถานะ</th>
                                <th className="px-4 py-3">ชื่อโครงการ</th>
                                <th className="px-4 py-3">องค์กร</th>
                                <th className="px-4 py-3 text-right">งบที่เสนอขอ</th>
                                <th className="px-4 py-3 text-right">งบที่ได้รับ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {paginatedProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">ไม่พบข้อมูล</td>
                                </tr>
                            ) : (
                                paginatedProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3">
                                            <Badge variant={statusVariant(project.status) as any}>
                                                {project.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{project.project_name}</td>
                                        <td className="px-4 py-3 text-slate-600">{project.organization}</td>
                                        <td className="px-4 py-3 text-right">{formatTHB(project.budget_requested)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatTHB(project.budget_approved)}</td>
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
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="text-sm font-medium">
                            หน้าที่ {currentPage} / {totalPages || 1}
                        </div>
                        <button
                            className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-slate-200 disabled:opacity-50 hover:bg-slate-100"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
