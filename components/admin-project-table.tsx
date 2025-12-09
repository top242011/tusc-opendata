"use client";

import { useState } from "react";
import { Project } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { deleteProject } from "@/lib/actions";
import { Modal } from "@/components/ui/modal";
import { ProjectForm } from "@/components/project-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Plus } from "lucide-react";

interface AdminProjectTableProps {
    projects: Project[];
}

export function AdminProjectTable({ projects }: AdminProjectTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleAdd = () => {
        setEditingProject(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        setDeletingId(id);
        await deleteProject(id);
        setDeletingId(null);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Projects</CardTitle>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" /> เพิ่มโครงการ
                </button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">องค์กร</th>
                                <th className="px-4 py-3">ชื่อโครงการ</th>
                                <th className="px-4 py-3 text-right">งบที่ขอ</th>
                                <th className="px-4 py-3 text-right">งบที่ได้</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">ไม่มีข้อมูลโครงการ</td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-xs">{project.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{project.organization}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{project.project_name}</div>
                                            {project.notes && (
                                                <div className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={project.notes}>
                                                    {project.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">{formatTHB(project.budget_requested)}</td>
                                        <td className="px-4 py-3 text-right">{formatTHB(project.budget_approved)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(project)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
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
    );
}
