import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Building2, Search } from 'lucide-react';
import { CAMPUS_LABELS, ORGANIZATION_TYPE_LABELS } from '@/lib/types';
import { OrganizationDeleteButton } from './delete-button';

interface SearchParams {
    search?: string;
    campus?: string;
    type?: string;
}

export default async function OrganizationsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const params = await searchParams;

    let query = supabase
        .from('organizations')
        .select('*, projects(count)')
        .order('name', { ascending: true });

    if (params.campus) query = query.eq('campus', params.campus);
    if (params.type) query = query.eq('type', params.type);
    if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,short_name.ilike.%${params.search}%`);
    }

    const { data: organizations, error } = await query;
    const items = organizations || [];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">องค์กร / ชมรม</h1>
                    <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                        จัดการรายชื่อองค์กร ชมรม และหน่วยงานในระบบ
                    </p>
                </div>
                <Link
                    href="/admin/organizations/new"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 ios-press"
                >
                    <Plus className="w-4 h-4" />
                    เพิ่มองค์กร
                </Link>
            </div>

            {/* Filters */}
            <form className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--ios-text-tertiary))]" />
                    <input
                        type="text"
                        name="search"
                        defaultValue={params.search}
                        placeholder="ค้นหาองค์กร..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))]"
                    />
                </div>
                <select
                    name="campus"
                    defaultValue={params.campus}
                    className="px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))]"
                >
                    <option value="">ทุกศูนย์การศึกษา</option>
                    {Object.entries(CAMPUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <select
                    name="type"
                    defaultValue={params.type}
                    className="px-3 py-2 text-sm rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 bg-[rgb(var(--ios-bg-primary))] text-[rgb(var(--ios-text-primary))]"
                >
                    <option value="">ทุกประเภท</option>
                    {Object.entries(ORGANIZATION_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-fill-tertiary))] text-[rgb(var(--ios-text-primary))] hover:bg-[rgb(var(--ios-fill-secondary))]"
                >
                    ค้นหา
                </button>
            </form>

            {/* Table */}
            {items.length === 0 ? (
                <div className="text-center py-16">
                    <Building2 className="w-12 h-12 text-[rgb(var(--ios-text-tertiary))] mx-auto mb-3" />
                    <p className="text-sm text-[rgb(var(--ios-text-tertiary))]">
                        {params.search ? 'ไม่พบองค์กรที่ตรงกับการค้นหา' : 'ยังไม่มีองค์กรในระบบ'}
                    </p>
                </div>
            ) : (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[rgb(var(--ios-fill-tertiary))]">
                                    <th className="px-4 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))]">ชื่อ</th>
                                    <th className="px-4 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))]">ประเภท</th>
                                    <th className="px-4 py-2.5 text-left font-medium text-[rgb(var(--ios-text-secondary))]">ศูนย์การศึกษา</th>
                                    <th className="px-4 py-2.5 text-right font-medium text-[rgb(var(--ios-text-secondary))]">โครงการ</th>
                                    <th className="px-4 py-2.5 text-center font-medium text-[rgb(var(--ios-text-secondary))] w-28">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgb(var(--ios-separator))]/30">
                                {items.map((org: any) => {
                                    const projectCount = org.projects?.[0]?.count ?? 0;
                                    return (
                                        <tr key={org.id} className="hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-[rgb(var(--ios-text-primary))]">{org.name}</p>
                                                    {org.short_name && (
                                                        <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">{org.short_name}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[rgb(var(--ios-text-secondary))]">
                                                {ORGANIZATION_TYPE_LABELS[org.type as keyof typeof ORGANIZATION_TYPE_LABELS] || org.type}
                                            </td>
                                            <td className="px-4 py-3 text-[rgb(var(--ios-text-secondary))]">
                                                {CAMPUS_LABELS[org.campus as keyof typeof CAMPUS_LABELS] || org.campus}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-[rgb(var(--ios-text-primary))]">
                                                {projectCount}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link
                                                        href={`/admin/organizations/${org.id}`}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-[var(--ios-radius-sm)] text-[rgb(var(--ios-accent))] hover:bg-[rgb(var(--ios-accent))]/5"
                                                    >
                                                        แก้ไข
                                                    </Link>
                                                    <OrganizationDeleteButton id={org.id} name={org.name} hasProjects={projectCount > 0} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-2 border-t border-[rgb(var(--ios-separator))]/30 text-xs text-[rgb(var(--ios-text-tertiary))]">
                        ทั้งหมด {items.length} องค์กร
                    </div>
                </div>
            )}
        </div>
    );
}
