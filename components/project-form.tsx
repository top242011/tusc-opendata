"use client";

import { useState, useEffect, useRef } from "react";
import { Project, Organization } from "@/lib/types";
import { createProject, updateProject } from "@/lib/actions";
import { createClient } from "@/utils/supabase/client";

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
        campus: 'central',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Organization dropdown state
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [orgSearch, setOrgSearch] = useState('');
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);
    const orgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setOrgSearch(initialData.organization || '');
        }
    }, [initialData]);

    // Fetch organizations
    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('organizations')
            .select('*')
            .eq('is_active', true)
            .order('name')
            .then(({ data }) => {
                if (data) setOrganizations(data as Organization[]);
            });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
                setShowOrgDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredOrgs = organizations.filter(o =>
        o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
        (o.short_name && o.short_name.toLowerCase().includes(orgSearch.toLowerCase()))
    );

    const handleSelectOrg = (org: Organization) => {
        setFormData({ ...formData, organization: org.name });
        setOrgSearch(org.name);
        setShowOrgDropdown(false);
        setFieldErrors(prev => ({ ...prev, organization: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const errors: Record<string, string> = {};
        if (!formData.organization?.trim()) errors.organization = 'กรุณาระบุชื่อองค์กร';
        if (!formData.project_name?.trim()) errors.project_name = 'กรุณาระบุชื่อโครงการ';
        if (!formData.fiscal_year || formData.fiscal_year < 2500) errors.fiscal_year = 'กรุณาระบุปีงบประมาณที่ถูกต้อง';
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            setLoading(false);
            return;
        }

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
                <div ref={orgRef} className="relative">
                    <label className="text-sm font-medium">ชื่อองค์กร</label>
                    <input
                        type="text"
                        required
                        className={`w-full mt-1 p-2 border rounded ${fieldErrors.organization ? 'border-red-400' : ''}`}
                        value={orgSearch}
                        onChange={(e) => {
                            setOrgSearch(e.target.value);
                            setFormData({ ...formData, organization: e.target.value });
                            setShowOrgDropdown(true);
                            setFieldErrors(prev => ({ ...prev, organization: '' }));
                        }}
                        onFocus={() => setShowOrgDropdown(true)}
                        placeholder="พิมพ์เพื่อค้นหาหรือสร้างใหม่..."
                    />
                    {fieldErrors.organization && <p className="text-red-500 text-xs mt-1">{fieldErrors.organization}</p>}
                    {showOrgDropdown && orgSearch && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredOrgs.map(org => (
                                <button
                                    key={org.id}
                                    type="button"
                                    onClick={() => handleSelectOrg(org)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between"
                                >
                                    <span>{org.name}</span>
                                    {org.short_name && (
                                        <span className="text-xs text-slate-400">{org.short_name}</span>
                                    )}
                                </button>
                            ))}
                            {filteredOrgs.length === 0 && (
                                <div className="px-3 py-2 text-sm text-slate-500">
                                    ไม่พบองค์กร &quot;{orgSearch}&quot; — จะสร้างใหม่อัตโนมัติ
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium">ศูนย์การศึกษา</label>
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
                        className={`w-full mt-1 p-2 border rounded ${fieldErrors.fiscal_year ? 'border-red-400' : ''}`}
                        value={formData.fiscal_year}
                        onChange={(e) => { setFormData({ ...formData, fiscal_year: parseInt(e.target.value) || 0 }); setFieldErrors(prev => ({ ...prev, fiscal_year: '' })); }}
                    />
                    {fieldErrors.fiscal_year && <p className="text-red-500 text-xs mt-1">{fieldErrors.fiscal_year}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium">ชื่อโครงการ</label>
                    <input
                        type="text"
                        required
                        className={`w-full mt-1 p-2 border rounded ${fieldErrors.project_name ? 'border-red-400' : ''}`}
                        value={formData.project_name}
                        onChange={(e) => { setFormData({ ...formData, project_name: e.target.value }); setFieldErrors(prev => ({ ...prev, project_name: '' })); }}
                    />
                    {fieldErrors.project_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.project_name}</p>}
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
                    {loading ? 'กำลังบันทึก...' : (initialData ? 'บันทึกแก้ไข' : 'เพิ่มโครงการ')}
                </button>
            </div>
        </form>
    );
}
