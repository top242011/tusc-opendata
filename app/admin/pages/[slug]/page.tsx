import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CmsPageEditor } from './cms-page-editor';

const PAGE_DEFAULTS: Record<string, { title: string; content: string }> = {
    about: {
        title: 'เกี่ยวกับ',
        content: '# เกี่ยวกับ TU Open Data\n\nแพลตฟอร์มเปิดเผยข้อมูลงบประมาณกิจกรรมนักศึกษา มหาวิทยาลัยธรรมศาสตร์',
    },
    'api-docs': {
        title: 'API Documentation',
        content: '# API Documentation\n\nเอกสารสำหรับนักพัฒนาที่ต้องการเข้าถึงข้อมูลผ่าน API',
    },
};

export default async function EditCmsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { slug } = await params;

    const { data: page } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('id', slug)
        .single();

    const defaults = PAGE_DEFAULTS[slug];
    const currentTitle = page?.title || defaults?.title || slug;
    const currentContent = page?.content || defaults?.content || '';

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/admin/pages"
                    className="inline-flex items-center gap-1 text-sm text-[rgb(var(--ios-accent))] hover:underline mb-3"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับ
                </Link>
                <h1 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">
                    แก้ไข: {currentTitle}
                </h1>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">
                    ใช้รูปแบบ Markdown ในการจัดรูปแบบเนื้อหา
                </p>
            </div>

            <CmsPageEditor slug={slug} initialTitle={currentTitle} initialContent={currentContent} />
        </div>
    );
}
