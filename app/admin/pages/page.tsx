import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Pencil } from 'lucide-react';

const DEFAULT_PAGES = [
    { id: 'about', title: 'เกี่ยวกับ', description: 'หน้าเกี่ยวกับโครงการ TU Open Data' },
    { id: 'api-docs', title: 'API Documentation', description: 'เอกสาร API สำหรับนักพัฒนา' },
];

export default async function CmsPagesListPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: pages } = await supabase
        .from('cms_pages')
        .select('id, title, updated_by, updated_at')
        .order('id');

    const pageMap = new Map((pages || []).map(p => [p.id, p]));

    // Merge defaults with DB pages
    const allPages = DEFAULT_PAGES.map(dp => ({
        ...dp,
        dbPage: pageMap.get(dp.id),
    }));

    // Add any DB pages not in defaults
    (pages || []).forEach(p => {
        if (!DEFAULT_PAGES.find(dp => dp.id === p.id)) {
            allPages.push({ id: p.id, title: p.title, description: '', dbPage: p });
        }
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">แก้ไขหน้าเว็บ</h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    แก้ไขเนื้อหาหน้าเว็บสาธารณะ รองรับรูปแบบ Markdown
                </p>
            </div>

            <div className="space-y-3">
                {allPages.map(page => (
                    <Link
                        key={page.id}
                        href={`/admin/pages/${page.id}`}
                        className="flex items-center gap-4 p-4 bg-[rgb(var(--ios-bg-primary))] rounded-[var(--ios-radius)] border border-[rgb(var(--ios-separator))]/50 hover:bg-[rgb(var(--ios-fill-tertiary))] transition-colors ios-press"
                    >
                        <div className="w-10 h-10 rounded-[var(--ios-radius-sm)] bg-[rgb(var(--ios-accent))]/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[rgb(var(--ios-accent))]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[rgb(var(--ios-text-primary))]">{page.title}</p>
                            <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                                {page.description}
                                {page.dbPage?.updated_at && (
                                    <> &middot; แก้ไขล่าสุด {new Date(page.dbPage.updated_at).toLocaleString('th-TH')}</>
                                )}
                            </p>
                        </div>
                        <Pencil className="w-4 h-4 text-[rgb(var(--ios-text-tertiary))] flex-shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
