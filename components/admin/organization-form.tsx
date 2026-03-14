'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createOrganization, updateOrganization } from '@/lib/organization-actions';
import { CAMPUS_LABELS, ORGANIZATION_TYPE_LABELS, type Organization, type OrganizationType, type Campus } from '@/lib/types';

interface Props {
    organization?: Organization;
    mode: 'create' | 'edit';
}

export function OrganizationForm({ organization, mode }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: organization?.name || '',
        short_name: organization?.short_name || '',
        type: organization?.type || 'club' as OrganizationType,
        campus: organization?.campus || 'central' as Campus,
        contact_person: organization?.contact_person || '',
        contact_email: organization?.contact_email || '',
        description: organization?.description || '',
        is_active: organization?.is_active ?? true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = mode === 'create'
                ? await createOrganization(form)
                : await updateOrganization(organization!.id, form);

            if ('error' in result && result.error) {
                setError(result.error);
            } else {
                router.push('/admin/organizations');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-red))]/5 border border-[rgb(var(--ios-red))]/20">
                    <p className="text-sm text-[rgb(var(--ios-red))]">{error}</p>
                </div>
            )}

            <Field label="ชื่อองค์กร" required>
                <input
                    type="text"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                    placeholder="เช่น ชมรมรักษ์สิ่งแวดล้อม"
                    className="input-field"
                />
            </Field>

            <Field label="ชื่อย่อ">
                <input
                    type="text"
                    value={form.short_name}
                    onChange={e => update('short_name', e.target.value)}
                    placeholder="เช่น ชมรม Eco"
                    className="input-field"
                />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="ประเภท">
                    <select value={form.type} onChange={e => update('type', e.target.value)} className="input-field">
                        {Object.entries(ORGANIZATION_TYPE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </Field>

                <Field label="ศูนย์การศึกษา">
                    <select value={form.campus} onChange={e => update('campus', e.target.value)} className="input-field">
                        {Object.entries(CAMPUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="ผู้ติดต่อ">
                    <input
                        type="text"
                        value={form.contact_person}
                        onChange={e => update('contact_person', e.target.value)}
                        placeholder="ชื่อผู้ประสานงาน"
                        className="input-field"
                    />
                </Field>

                <Field label="อีเมลติดต่อ">
                    <input
                        type="email"
                        value={form.contact_email}
                        onChange={e => update('contact_email', e.target.value)}
                        placeholder="email@example.com"
                        className="input-field"
                    />
                </Field>
            </div>

            <Field label="รายละเอียด">
                <textarea
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    rows={3}
                    placeholder="รายละเอียดเกี่ยวกับองค์กร"
                    className="input-field resize-none"
                />
            </Field>

            <Field label="สถานะ">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={e => update('is_active', e.target.checked)}
                        className="w-4 h-4 rounded border-[rgb(var(--ios-separator))] text-[rgb(var(--ios-accent))] focus:ring-[rgb(var(--ios-accent))]/30"
                    />
                    <span className="text-sm text-[rgb(var(--ios-text-primary))]">ใช้งานอยู่</span>
                </label>
            </Field>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading || !form.name.trim()}
                    className="px-5 py-2.5 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 disabled:opacity-40 transition-opacity ios-press"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        mode === 'create' ? 'สร้างองค์กร' : 'บันทึก'
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium rounded-[var(--ios-radius-sm)] border border-[rgb(var(--ios-separator))]/50 text-[rgb(var(--ios-text-secondary))] hover:bg-[rgb(var(--ios-fill-tertiary))]"
                >
                    ยกเลิก
                </button>
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    padding: 0.625rem 0.75rem;
                    font-size: 0.875rem;
                    border-radius: var(--ios-radius-sm);
                    border: 1px solid rgb(var(--ios-separator) / 0.5);
                    background: rgb(var(--ios-bg-primary));
                    color: rgb(var(--ios-text-primary));
                }
                .input-field:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgb(var(--ios-accent) / 0.3);
                    border-color: rgb(var(--ios-accent));
                }
            `}</style>
        </form>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-[rgb(var(--ios-text-secondary))] mb-1.5">
                {label}
                {required && <span className="text-[rgb(var(--ios-red))] ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
