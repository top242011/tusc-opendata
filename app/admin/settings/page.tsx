import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

    // Build settings map with defaults
    const settingsMap: Record<string, any> = {};
    (settings || []).forEach(s => { settingsMap[s.key] = s.value; });

    const currentYear = new Date().getFullYear() + 543; // พ.ศ.

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">ตั้งค่าระบบ</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    ปรับแต่งค่าต่างๆ ของระบบ TU Open Data
                </p>
            </div>

            <SettingsForm
                initialSettings={{
                    current_fiscal_year: settingsMap.current_fiscal_year ?? currentYear,
                    site_title: settingsMap.site_title ?? 'TU Open Data',
                    site_description: settingsMap.site_description ?? 'แพลตฟอร์มเปิดเผยข้อมูลงบประมาณกิจกรรมนักศึกษา มหาวิทยาลัยธรรมศาสตร์',
                    import_max_rows: settingsMap.import_max_rows ?? 500,
                    import_auto_create_orgs: settingsMap.import_auto_create_orgs ?? true,
                }}
            />
        </div>
    );
}
