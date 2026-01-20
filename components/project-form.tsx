"use client";

import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { createProject, updateProject } from "@/lib/actions";

interface ProjectFormProps {
    initialData?: Project;
    onSuccess: (project?: Project) => void;
    onCancel: () => void;
}

export function ProjectForm({ initialData, onSuccess, onCancel }: ProjectFormProps) {
    const [formData, setFormData] = useState<Partial<Project>>({
        organization: '',
        project_name: '',
        fiscal_year: 2568,
        budget_requested: 0,
        budget_approved: 0,
        is_published: true,
        campus: 'central', // Default campus
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let project: Project | undefined;
            if (initialData?.id) {
                const result = await updateProject(initialData.id, formData);
                if (result.error) throw new Error(result.error);
                project = result.data as Project;
            } else {
                const result = await createProject(formData);
                if (result.error) throw new Error(result.error);
                project = result.data as Project;
            }
            onSuccess(project);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 p-2 text-sm rounded">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">ชื่อองค์กร</label>
                    <input
                        type="text"
                        required
                        className="w-full mt-1 p-2 border rounded"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">วิทยาเขต</label>
                    <select
                        className="w-full mt-1 p-2 border rounded bg-white"
                        value={formData.campus || 'central'}
                        onChange={(e) => setFormData({ ...formData, campus: e.target.value as any })}
                    >
                        <option value="central">ส่วนกลาง</option>
                        <option value="thaprachan">ท่าพระจันทร์</option>
                        <option value="rangsit">รังสิต</option>
                        <option value="lampang">ลำปาง</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">ปีงบประมาณ</label>
                    <input
                        type="number"
                        required
                        className="w-full mt-1 p-2 border rounded"
                        value={formData.fiscal_year}
                        onChange={(e) => setFormData({ ...formData, fiscal_year: parseInt(e.target.value) || 0 })}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">ชื่อโครงการ</label>
                    <input
                        type="text"
                        required
                        className="w-full mt-1 p-2 border rounded"
                        value={formData.project_name}
                        onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">งบที่เสนอขอ (บาท)</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full mt-1 p-2 border rounded"
                        value={formData.budget_requested}
                        onChange={(e) => setFormData({ ...formData, budget_requested: parseFloat(e.target.value) || 0 })}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">งบที่ได้รับอนุมัติ (บาท)</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full mt-1 p-2 border rounded"
                        value={formData.budget_approved}
                        onChange={(e) => setFormData({ ...formData, budget_approved: parseFloat(e.target.value) || 0 })}
                    />
                </div>
            </div>



            <div>
                <label className="text-sm font-medium">หมายเหตุ</label>
                <textarea
                    className="w-full mt-1 p-2 border rounded h-24"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="pt-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm border rounded hover:bg-slate-50"
                    disabled={loading}
                >
                    ยกเลิก
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (initialData ? 'บันทึกแก้ไข' : 'เพิ่มโครงการ')}
                </button>
            </div>
        </form>
    );
}
