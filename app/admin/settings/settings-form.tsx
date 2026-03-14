'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { updateSettings } from '@/lib/settings-actions';

interface SettingsData {
    current_fiscal_year: number;
    site_title: string;
    site_description: string;
    import_max_rows: number;
    import_auto_create_orgs: boolean;
}

interface Props {
    initialSettings: SettingsData;
}

export function SettingsForm({ initialSettings }: Props) {
    const router = useRouter();
    const [form, setForm] = useState(initialSettings);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const update = (key: keyof SettingsData, value: any) => setForm(f => ({ ...f, [key]: value }));

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSaved(false);

        const result = await updateSettings([
            { key: 'current_fiscal_year', value: form.current_fiscal_year, description: 'ปีงบประมาณปัจจุบัน (พ.ศ.)' },
            { key: 'site_title', value: form.site_title, description: 'ชื่อเว็บไซต์' },
            { key: 'site_description', value: form.site_description, description: 'คำอธิบายเว็บไซต์' },
            { key: 'import_max_rows', value: form.import_max_rows, description: 'จำนวนแถวสูงสุดต่อการนำเข้า' },
            { key: 'import_auto_create_orgs', value: form.import_auto_create_orgs, description: 'สร้างองค์กรใหม่อัตโนมัติเมื่อนำเข้า' },
        ]);

        setLoading(false);
        if ('error' in result && result.error) {
            setError(result.error);
        } else {
            setSaved(true);
            router.refresh();
            setTimeout(() => setSaved(false), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-red))]/5 border border-[rgb(var(--ios-red))]/20">
                    <p className="text-sm text-[rgb(var(--ios-red))]">{error}</p>
                </div>
            )}
            {saved && (
                <div className="p-3 rounded-[var(--ios-radius)] bg-[rgb(var(--ios-green))]/5 border border-[rgb(var(--ios-green))]/20">
                    <p className="text-sm text-[rgb(var(--ios-green))]">บันทึกสำเร็จ</p>
                </div>
            )}

            {/* General Settings */}
            <SettingsSection title="ทั่วไป">
                <SettingsField label="ชื่อเว็บไซต์" description="แสดงบน title bar และส่วนหัว">
                    <input
                        value={form.site_title}
                        onChange={e => update('site_title', e.target.value)}
                        className="settings-input"
                    />
                </SettingsField>
                <SettingsField label="คำอธิบายเว็บไซต์" description="แสดงในผลการค้นหาและ SEO">
                    <textarea
                        value={form.site_description}
                        onChange={e => update('site_description', e.target.value)}
                        rows={2}
                        className="settings-input resize-none"
                    />
                </SettingsField>
            </SettingsSection>

            {/* Budget Settings */}
            <SettingsSection title="งบประมาณ">
                <SettingsField label="ปีงบประมาณปัจจุบัน (พ.ศ.)" description="ใช้เป็นค่าเริ่มต้นสำหรับการนำเข้าและสร้างโครงการ">
                    <input
                        type="number"
                        value={form.current_fiscal_year}
                        onChange={e => update('current_fiscal_year', Number(e.target.value))}
                        className="settings-input w-40"
                    />
                </SettingsField>
            </SettingsSection>

            {/* Import Settings */}
            <SettingsSection title="การนำเข้าข้อมูล">
                <SettingsField label="จำนวนแถวสูงสุดต่อครั้ง" description="จำกัดขนาดไฟล์ที่อัปโหลดได้">
                    <input
                        type="number"
                        value={form.import_max_rows}
                        onChange={e => update('import_max_rows', Number(e.target.value))}
                        className="settings-input w-40"
                    />
                </SettingsField>
                <SettingsField label="สร้างองค์กรอัตโนมัติ" description="เมื่อนำเข้าข้อมูลที่มีชื่อองค์กรใหม่ ระบบจะสร้างองค์กรให้อัตโนมัติ">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.import_auto_create_orgs}
                            onChange={e => update('import_auto_create_orgs', e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-[rgb(var(--ios-text-primary))]">เปิดใช้งาน</span>
                    </label>
                </SettingsField>
            </SettingsSection>

            {/* Save */}
            <div className="pt-2">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))] text-white hover:opacity-90 disabled:opacity-40 ios-press"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    บันทึกการตั้งค่า
                </button>
            </div>

            <style jsx>{`
                .settings-input {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    border-radius: var(--ios-radius-sm);
                    border: 1px solid rgb(var(--ios-separator) / 0.5);
                    background: rgb(var(--ios-bg-primary));
                    color: rgb(var(--ios-text-primary));
                }
                .settings-input:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgb(var(--ios-accent) / 0.3);
                    border-color: rgb(var(--ios-accent));
                }
            `}</style>
        </div>
    );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50">
            <div className="px-5 py-3 border-b border-[rgb(var(--ios-separator))]/30">
                <h2 className="text-sm font-semibold text-[rgb(var(--ios-text-primary))]">{title}</h2>
            </div>
            <div className="p-5 space-y-5">{children}</div>
        </div>
    );
}

function SettingsField({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-[rgb(var(--ios-text-primary))] mb-1">{label}</label>
            {description && (
                <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mb-2">{description}</p>
            )}
            {children}
        </div>
    );
}
